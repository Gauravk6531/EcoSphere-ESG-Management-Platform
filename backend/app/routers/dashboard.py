import io
import csv
import datetime
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas
from ..database import get_db
from ..services import scoring_service

router = APIRouter(tags=["Dashboard & Reports"])


@router.post("/dashboard/recalculate")
def recalculate_scores(db: Session = Depends(get_db)):
    """Recomputes Department Scores for every department (normally an ir.cron-style nightly job)."""
    records = scoring_service.compute_all_department_scores(db)
    return {"recalculated": len(records)}


@router.get("/dashboard/overview")
def dashboard_overview(db: Session = Depends(get_db)):
    departments = db.query(models.Department).all()
    dept_summaries = []
    for d in departments:
        latest = db.query(models.DepartmentScore).filter(
            models.DepartmentScore.department_id == d.id
        ).order_by(models.DepartmentScore.period.desc(), models.DepartmentScore.id.desc()).first()
        dept_summaries.append({
            "department_id": d.id,
            "department_name": d.name,
            "environmental_score": latest.environmental_score if latest else None,
            "social_score": latest.social_score if latest else None,
            "governance_score": latest.governance_score if latest else None,
            "total_score": latest.total_score if latest else None,
        })

    overall = scoring_service.compute_overall_esg_score(db)
    open_issues = db.query(models.ComplianceIssue).filter(
        models.ComplianceIssue.status.in_([models.ComplianceStatus.open, models.ComplianceStatus.in_progress])
    ).all()
    overdue_count = sum(1 for i in open_issues if i.is_overdue)

    return {
        "overall_esg_score": overall,
        "departments": dept_summaries,
        "open_compliance_issues": len(open_issues),
        "overdue_compliance_issues": overdue_count,
        "total_employees": db.query(models.Employee).count(),
        "total_carbon_transactions": db.query(models.CarbonTransaction).count(),
        "active_challenges": db.query(models.Challenge).filter(
            models.Challenge.status == models.ChallengeStatus.active
        ).count(),
    }


@router.get("/dashboard/department-scores", response_model=List[schemas.DepartmentScoreOut])
def department_score_history(department_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.DepartmentScore)
    if department_id:
        q = q.filter(models.DepartmentScore.department_id == department_id)
    return q.order_by(models.DepartmentScore.period.asc()).all()


# ---------- Reports (Custom Report Builder) ----------

REPORT_TYPES = {
    "environmental": lambda db: db.query(models.CarbonTransaction).all(),
    "social": lambda db: db.query(models.EmployeeParticipation).all(),
    "social_training": lambda db: db.query(models.TrainingCompletion).all(),
    "social_challenges": lambda db: db.query(models.ChallengeParticipation).all(),
    "governance": lambda db: db.query(models.ComplianceIssue).all(),
}


def _row_to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}


@router.get("/reports/custom")
def custom_report(
    module: str = Query(..., description="environmental | social | social_training | social_challenges | governance | esg_summary"),
    department_id: Optional[int] = None,
    employee_id: Optional[int] = None,
    challenge_id: Optional[int] = None,
    date_from: Optional[datetime.date] = None,
    date_to: Optional[datetime.date] = None,
    export: Optional[str] = Query(None, description="csv to download as CSV, omit for JSON"),
    db: Session = Depends(get_db),
):
    """Custom Report Builder: filter by department / date range / module / employee / challenge."""
    rows = []

    if module == "environmental":
        q = db.query(models.CarbonTransaction)
        if department_id:
            q = q.filter(models.CarbonTransaction.department_id == department_id)
        if date_from:
            q = q.filter(models.CarbonTransaction.date >= date_from)
        if date_to:
            q = q.filter(models.CarbonTransaction.date <= date_to)
        rows = [_row_to_dict(r) for r in q.all()]

    elif module == "social":
        q = db.query(models.EmployeeParticipation)
        if employee_id:
            q = q.filter(models.EmployeeParticipation.employee_id == employee_id)
        if department_id:
            activity_ids = [
                a.id for a in db.query(models.CSRActivity.id).filter(models.CSRActivity.department_id == department_id).all()
            ]
            q = q.filter(models.EmployeeParticipation.activity_id.in_(activity_ids))
        if date_from:
            q = q.filter(models.EmployeeParticipation.completion_date >= date_from)
        if date_to:
            q = q.filter(models.EmployeeParticipation.completion_date <= date_to)
        rows = [_row_to_dict(r) for r in q.all()]

    elif module == "social_training":
        q = db.query(models.TrainingCompletion)
        if employee_id:
            q = q.filter(models.TrainingCompletion.employee_id == employee_id)
        if department_id:
            employee_ids = [
                e.id for e in db.query(models.Employee.id).filter(models.Employee.department_id == department_id).all()
            ]
            q = q.filter(models.TrainingCompletion.employee_id.in_(employee_ids))
        if date_from:
            q = q.filter(models.TrainingCompletion.completion_date >= date_from)
        if date_to:
            q = q.filter(models.TrainingCompletion.completion_date <= date_to)
        rows = [_row_to_dict(r) for r in q.all()]

    elif module == "social_challenges":
        q = db.query(models.ChallengeParticipation)
        if employee_id:
            q = q.filter(models.ChallengeParticipation.employee_id == employee_id)
        if challenge_id:
            q = q.filter(models.ChallengeParticipation.challenge_id == challenge_id)
        rows = [_row_to_dict(r) for r in q.all()]

    elif module == "governance":
        q = db.query(models.ComplianceIssue)
        if date_from:
            q = q.filter(models.ComplianceIssue.due_date >= date_from)
        if date_to:
            q = q.filter(models.ComplianceIssue.due_date <= date_to)
        rows = [_row_to_dict(r) for r in q.all()]

    elif module == "esg_summary":
        q = db.query(models.DepartmentScore)
        if department_id:
            q = q.filter(models.DepartmentScore.department_id == department_id)
        rows = [_row_to_dict(r) for r in q.all()]

    else:
        return {"error": f"Unknown module '{module}'. Use environmental, social, social_training, social_challenges, governance, or esg_summary."}

    if export == "csv":
        buffer = io.StringIO()
        if rows:
            writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        buffer.seek(0)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={module}_report.csv"},
        )

    return {"module": module, "count": len(rows), "rows": rows}
