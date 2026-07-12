from sqlalchemy.orm import Session
from .. import models
from .config_service import get_config
from .notification_service import notify

COMPARATORS = {
    ">=": lambda a, b: a >= b,
    ">": lambda a, b: a > b,
    "==": lambda a, b: a == b,
    "<=": lambda a, b: a <= b,
    "<": lambda a, b: a < b,
}


def _metric_value(db: Session, employee: models.Employee, metric: str) -> float:
    if metric == "xp_total":
        return employee.xp_total or 0
    if metric == "completed_challenges":
        return db.query(models.ChallengeParticipation).filter(
            models.ChallengeParticipation.employee_id == employee.id,
            models.ChallengeParticipation.approval_status == models.ApprovalStatus.approved,
        ).count()
    if metric == "csr_participations":
        return db.query(models.EmployeeParticipation).filter(
            models.EmployeeParticipation.employee_id == employee.id,
            models.EmployeeParticipation.approval_status == models.ApprovalStatus.approved,
        ).count()
    return 0


def check_and_award_badges(db: Session, employee_id: int):
    """Check all badges against the employee's current metrics and auto-award any
    newly-qualified badges. Controlled by ESGConfig.badge_auto_award toggle."""
    config = get_config(db)
    if not config.badge_auto_award:
        return []

    employee = db.query(models.Employee).get(employee_id)
    if not employee:
        return []

    already_earned_ids = {
        eb.badge_id for eb in db.query(models.EmployeeBadge).filter(
            models.EmployeeBadge.employee_id == employee_id
        ).all()
    }

    newly_awarded = []
    for badge in db.query(models.Badge).all():
        if badge.id in already_earned_ids:
            continue
        current_value = _metric_value(db, employee, badge.unlock_metric)
        comparator_fn = COMPARATORS.get(badge.unlock_comparator, COMPARATORS[">="])
        if comparator_fn(current_value, badge.unlock_threshold):
            award = models.EmployeeBadge(employee_id=employee_id, badge_id=badge.id)
            db.add(award)
            db.commit()
            db.refresh(award)
            newly_awarded.append(award)
            notify(
                db,
                employee_id,
                "badge_unlock",
                f"Congratulations! You unlocked the badge '{badge.name}'.",
                gate_field="notify_badge_unlock",
            )
    return newly_awarded
