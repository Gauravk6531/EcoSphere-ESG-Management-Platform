import datetime
from sqlalchemy.orm import Session
from .. import models
from .config_service import get_config


def _clamp(value, lo=0, hi=100):
    return max(lo, min(hi, value))


def compute_environmental_score(db: Session, department_id: int) -> float:
    """
    Average progress (0-100) across all Environmental Goals for the department.
    A department with no goals defined scores a neutral 50.
    """
    goals = db.query(models.EnvironmentalGoal).filter(
        models.EnvironmentalGoal.department_id == department_id
    ).all()
    if not goals:
        return 50.0
    total = sum(g.progress for g in goals)
    return round(_clamp(total / len(goals)), 2)


def compute_social_score(db: Session, department_id: int) -> float:
    """
    Blend of: (a) CSR participation approval rate for the department's employees,
    and (b) participation coverage (share of employees who have at least one
    approved CSR participation).
    """
    employees = db.query(models.Employee).filter(
        models.Employee.department_id == department_id
    ).all()
    if not employees:
        return 50.0
    employee_ids = [e.id for e in employees]

    participations = db.query(models.EmployeeParticipation).filter(
        models.EmployeeParticipation.employee_id.in_(employee_ids)
    ).all()

    if not participations:
        return 30.0  # no engagement yet

    approved = [p for p in participations if p.approval_status == models.ApprovalStatus.approved]
    approval_rate = (len(approved) / len(participations)) * 100 if participations else 0

    participating_employee_ids = {p.employee_id for p in approved}
    coverage_rate = (len(participating_employee_ids) / len(employees)) * 100

    score = (approval_rate * 0.5) + (coverage_rate * 0.5)
    return round(_clamp(score), 2)


def compute_governance_score(db: Session, department_id: int) -> float:
    """
    Blend of: (a) policy acknowledgement rate for the department's employees,
    and (b) inverse of overdue/open compliance issues tied to the department's audits.
    """
    employees = db.query(models.Employee).filter(
        models.Employee.department_id == department_id
    ).all()
    employee_ids = [e.id for e in employees]

    policies = db.query(models.ESGPolicy).join(
        models.policy_department, models.policy_department.c.policy_id == models.ESGPolicy.id
    ).filter(models.policy_department.c.department_id == department_id).all()

    if policies and employee_ids:
        expected = len(policies) * len(employee_ids)
        acks = db.query(models.PolicyAcknowledgement).filter(
            models.PolicyAcknowledgement.employee_id.in_(employee_ids),
            models.PolicyAcknowledgement.policy_id.in_([p.id for p in policies]),
            models.PolicyAcknowledgement.acknowledged_date.isnot(None),
        ).count()
        ack_rate = (acks / expected) * 100 if expected else 100
    else:
        ack_rate = 70.0  # neutral-ish default when no policies assigned

    audits = db.query(models.Audit).filter(models.Audit.department_id == department_id).all()
    audit_ids = [a.id for a in audits]
    if audit_ids:
        issues = db.query(models.ComplianceIssue).filter(
            models.ComplianceIssue.audit_id.in_(audit_ids)
        ).all()
        if issues:
            unresolved_overdue = sum(1 for i in issues if i.is_overdue)
            penalty = min(100, unresolved_overdue * 15)
            compliance_score = 100 - penalty
        else:
            compliance_score = 100
    else:
        compliance_score = 80.0  # neutral default when no audits recorded

    score = (ack_rate * 0.5) + (compliance_score * 0.5)
    return round(_clamp(score), 2)


def compute_department_score(db: Session, department_id: int, persist: bool = True) -> models.DepartmentScore:
    config = get_config(db)
    env = compute_environmental_score(db, department_id)
    soc = compute_social_score(db, department_id)
    gov = compute_governance_score(db, department_id)

    w_env = config.weight_environmental / 100.0
    w_soc = config.weight_social / 100.0
    w_gov = config.weight_governance / 100.0

    total = round((env * w_env) + (soc * w_soc) + (gov * w_gov), 2)

    record = models.DepartmentScore(
        department_id=department_id,
        environmental_score=env,
        social_score=soc,
        governance_score=gov,
        total_score=total,
        period=datetime.date.today(),
    )
    if persist:
        db.add(record)
        db.commit()
        db.refresh(record)
    return record


def compute_all_department_scores(db: Session):
    departments = db.query(models.Department).all()
    return [compute_department_score(db, d.id) for d in departments]


def compute_overall_esg_score(db: Session) -> float:
    """Weighted average of the latest Department Total Scores across the org."""
    departments = db.query(models.Department).all()
    if not departments:
        return 0.0
    latest_scores = []
    for d in departments:
        latest = db.query(models.DepartmentScore).filter(
            models.DepartmentScore.department_id == d.id
        ).order_by(models.DepartmentScore.period.desc(), models.DepartmentScore.id.desc()).first()
        if latest:
            latest_scores.append(latest.total_score)
    if not latest_scores:
        return 0.0
    return round(sum(latest_scores) / len(latest_scores), 2)
