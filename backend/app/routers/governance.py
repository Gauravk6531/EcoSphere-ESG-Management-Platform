import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..services.notification_service import notify

router = APIRouter(prefix="/governance", tags=["Governance"])


# ---------- ESG Policies ----------

@router.get("/policies", response_model=List[schemas.ESGPolicyOut])
def list_policies(db: Session = Depends(get_db)):
    return db.query(models.ESGPolicy).all()


@router.post("/policies", response_model=schemas.ESGPolicyOut)
def create_policy(payload: schemas.ESGPolicyCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    dept_ids = data.pop("department_ids")
    policy = models.ESGPolicy(**data)
    if dept_ids:
        policy.departments = db.query(models.Department).filter(models.Department.id.in_(dept_ids)).all()
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.delete("/policies/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(models.ESGPolicy).get(policy_id)
    if not policy:
        raise HTTPException(404, "Policy not found")
    db.delete(policy)
    db.commit()
    return {"ok": True}


# ---------- Policy Acknowledgements ----------

@router.get("/acknowledgements", response_model=List[schemas.PolicyAcknowledgementOut])
def list_acknowledgements(policy_id: int = None, employee_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.PolicyAcknowledgement)
    if policy_id:
        q = q.filter(models.PolicyAcknowledgement.policy_id == policy_id)
    if employee_id:
        q = q.filter(models.PolicyAcknowledgement.employee_id == employee_id)
    return q.all()


@router.post("/acknowledgements", response_model=schemas.PolicyAcknowledgementOut)
def acknowledge_policy(payload: schemas.PolicyAcknowledgementCreate, db: Session = Depends(get_db)):
    existing = db.query(models.PolicyAcknowledgement).filter(
        models.PolicyAcknowledgement.policy_id == payload.policy_id,
        models.PolicyAcknowledgement.employee_id == payload.employee_id,
    ).first()
    if existing:
        existing.acknowledged_date = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    ack = models.PolicyAcknowledgement(
        policy_id=payload.policy_id,
        employee_id=payload.employee_id,
        acknowledged_date=datetime.datetime.utcnow(),
    )
    db.add(ack)
    db.commit()
    db.refresh(ack)
    return ack


@router.post("/acknowledgements/{ack_id}/send-reminder")
def send_reminder(ack_id: int, db: Session = Depends(get_db)):
    ack = db.query(models.PolicyAcknowledgement).get(ack_id)
    if not ack:
        raise HTTPException(404, "Acknowledgement record not found")
    ack.reminder_sent = True
    db.commit()
    notify(
        db,
        ack.employee_id,
        "policy_reminder",
        "Reminder: please acknowledge the assigned ESG policy.",
        gate_field="notify_policy_reminder",
    )
    return {"ok": True}


# ---------- Audits ----------

@router.get("/audits", response_model=List[schemas.AuditOut])
def list_audits(department_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.Audit)
    if department_id:
        q = q.filter(models.Audit.department_id == department_id)
    return q.all()


@router.post("/audits", response_model=schemas.AuditOut)
def create_audit(payload: schemas.AuditCreate, db: Session = Depends(get_db)):
    audit = models.Audit(**payload.model_dump())
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


@router.delete("/audits/{audit_id}")
def delete_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(models.Audit).get(audit_id)
    if not audit:
        raise HTTPException(404, "Audit not found")
    db.delete(audit)
    db.commit()
    return {"ok": True}


# ---------- Compliance Issues ----------

@router.get("/compliance-issues", response_model=List[schemas.ComplianceIssueOut])
def list_compliance_issues(status: str = None, db: Session = Depends(get_db)):
    q = db.query(models.ComplianceIssue)
    if status:
        q = q.filter(models.ComplianceIssue.status == status)
    return q.all()


@router.post("/compliance-issues", response_model=schemas.ComplianceIssueOut)
def create_compliance_issue(payload: schemas.ComplianceIssueCreate, db: Session = Depends(get_db)):
    issue = models.ComplianceIssue(**payload.model_dump())
    db.add(issue)
    db.commit()
    db.refresh(issue)

    notify(
        db,
        issue.owner_id,
        "compliance_issue_raised",
        f"A new compliance issue has been assigned to you (severity: {issue.severity}).",
        gate_field="notify_compliance_issue",
    )
    return issue


@router.put("/compliance-issues/{issue_id}", response_model=schemas.ComplianceIssueOut)
def update_compliance_issue(issue_id: int, payload: schemas.ComplianceIssueCreate, db: Session = Depends(get_db)):
    issue = db.query(models.ComplianceIssue).get(issue_id)
    if not issue:
        raise HTTPException(404, "Compliance issue not found")
    for k, v in payload.model_dump().items():
        setattr(issue, k, v)
    db.commit()
    db.refresh(issue)
    return issue


@router.get("/compliance-issues/overdue", response_model=List[schemas.ComplianceIssueOut])
def get_overdue_issues(db: Session = Depends(get_db)):
    """Flags open/in-progress issues whose due_date has passed (feeds Notification System)."""
    issues = db.query(models.ComplianceIssue).filter(
        models.ComplianceIssue.status.in_([models.ComplianceStatus.open, models.ComplianceStatus.in_progress])
    ).all()
    return [i for i in issues if i.is_overdue]
