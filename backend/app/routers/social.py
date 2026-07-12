from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime

from .. import models, schemas
from ..database import get_db
from ..services.config_service import get_config
from ..services.badge_service import check_and_award_badges
from ..services.notification_service import notify

router = APIRouter(prefix="/social", tags=["Social"])


# ---------- CSR Activities ----------

@router.get("/activities", response_model=List[schemas.CSRActivityOut])
def list_activities(department_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.CSRActivity)
    if department_id:
        q = q.filter(models.CSRActivity.department_id == department_id)
    return q.all()


@router.post("/activities", response_model=schemas.CSRActivityOut)
def create_activity(payload: schemas.CSRActivityCreate, db: Session = Depends(get_db)):
    activity = models.CSRActivity(**payload.model_dump())
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/activities/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(models.CSRActivity).get(activity_id)
    if not activity:
        raise HTTPException(404, "Activity not found")
    db.delete(activity)
    db.commit()
    return {"ok": True}


# ---------- Employee Participation ----------

@router.get("/participations", response_model=List[schemas.EmployeeParticipationOut])
def list_participations(employee_id: int = None, activity_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.EmployeeParticipation)
    if employee_id:
        q = q.filter(models.EmployeeParticipation.employee_id == employee_id)
    if activity_id:
        q = q.filter(models.EmployeeParticipation.activity_id == activity_id)
    return q.all()


@router.post("/participations", response_model=schemas.EmployeeParticipationOut)
def create_participation(payload: schemas.EmployeeParticipationCreate, db: Session = Depends(get_db)):
    participation = models.EmployeeParticipation(**payload.model_dump())
    participation.approval_status = models.ApprovalStatus.submitted
    db.add(participation)
    db.commit()
    db.refresh(participation)
    return participation


@router.post("/participations/{participation_id}/decision", response_model=schemas.EmployeeParticipationOut)
def decide_participation(participation_id: int, payload: schemas.ParticipationDecision, db: Session = Depends(get_db)):
    participation = db.query(models.EmployeeParticipation).get(participation_id)
    if not participation:
        raise HTTPException(404, "Participation not found")

    config = get_config(db)

    if payload.approve:
        # Evidence Requirement business rule: cannot approve without proof if toggle is on
        activity = db.query(models.CSRActivity).get(participation.activity_id)
        evidence_required = config.evidence_required and activity and activity.evidence_required
        if evidence_required and not participation.proof_url:
            raise HTTPException(400, "Cannot approve: proof file is required for this activity")

        participation.approval_status = models.ApprovalStatus.approved
        participation.points_earned = payload.points_earned or 0
        participation.completion_date = participation.completion_date or datetime.date.today()

        employee = db.query(models.Employee).get(participation.employee_id)
        if employee:
            employee.points_balance = (employee.points_balance or 0) + participation.points_earned
        db.commit()

        check_and_award_badges(db, participation.employee_id)
    else:
        participation.approval_status = models.ApprovalStatus.rejected
        db.commit()

    notify(
        db,
        participation.employee_id,
        "csr_approval_decision",
        f"Your CSR participation was {'approved' if payload.approve else 'rejected'}.",
        gate_field="notify_approval_decision",
    )

    db.refresh(participation)
    return participation


# ---------- Diversity Metrics (computed snapshot) ----------

@router.get("/diversity-metrics")
def diversity_metrics(department_id: int = None, db: Session = Depends(get_db)):
    """
    Lightweight computed snapshot. In a real HR integration this would pull gender,
    age-band, and tenure fields from an HR system; here it summarizes what's
    available on the Employee model (headcount per department) as a starting point.
    """
    q = db.query(models.Employee)
    if department_id:
        q = q.filter(models.Employee.department_id == department_id)
    employees = q.all()
    return {
        "total_employees": len(employees),
        "department_id": department_id,
        "note": "Extend Employee model with gender/age/tenure fields to enrich this metric.",
    }


# ---------- Training Completion ----------

@router.get("/training-completions", response_model=List[schemas.TrainingCompletionOut])
def list_training_completions(employee_id: int = None, status: str = None, db: Session = Depends(get_db)):
    q = db.query(models.TrainingCompletion)
    if employee_id:
        q = q.filter(models.TrainingCompletion.employee_id == employee_id)
    if status:
        q = q.filter(models.TrainingCompletion.status == status)
    return q.order_by(models.TrainingCompletion.due_date.asc().nullslast(), models.TrainingCompletion.id.desc()).all()


@router.post("/training-completions", response_model=schemas.TrainingCompletionOut)
def create_training_completion(payload: schemas.TrainingCompletionCreate, db: Session = Depends(get_db)):
    training = models.TrainingCompletion(**payload.model_dump())
    db.add(training)
    db.commit()
    db.refresh(training)
    return training


@router.put("/training-completions/{training_id}", response_model=schemas.TrainingCompletionOut)
def update_training_completion(training_id: int, payload: schemas.TrainingCompletionCreate, db: Session = Depends(get_db)):
    training = db.query(models.TrainingCompletion).get(training_id)
    if not training:
        raise HTTPException(404, "Training completion not found")
    for k, v in payload.model_dump().items():
        setattr(training, k, v)
    db.commit()
    db.refresh(training)
    return training


@router.delete("/training-completions/{training_id}")
def delete_training_completion(training_id: int, db: Session = Depends(get_db)):
    training = db.query(models.TrainingCompletion).get(training_id)
    if not training:
        raise HTTPException(404, "Training completion not found")
    db.delete(training)
    db.commit()
    return {"ok": True}


# ---------- Social Dashboard ----------

@router.get("/dashboard")
def social_dashboard(department_id: int = None, db: Session = Depends(get_db)):
    employee_q = db.query(models.Employee)
    if department_id:
        employee_q = employee_q.filter(models.Employee.department_id == department_id)
    employees = employee_q.all()
    employee_ids = [e.id for e in employees]

    activity_q = db.query(models.CSRActivity)
    if department_id:
        activity_q = activity_q.filter(models.CSRActivity.department_id == department_id)
    activities = activity_q.all()

    participation_q = db.query(models.EmployeeParticipation)
    if employee_ids:
        participation_q = participation_q.filter(models.EmployeeParticipation.employee_id.in_(employee_ids))
    elif department_id:
        participation_q = participation_q.filter(models.EmployeeParticipation.employee_id == -1)
    participations = participation_q.all()

    training_q = db.query(models.TrainingCompletion)
    if employee_ids:
        training_q = training_q.filter(models.TrainingCompletion.employee_id.in_(employee_ids))
    elif department_id:
        training_q = training_q.filter(models.TrainingCompletion.employee_id == -1)
    trainings = training_q.all()

    completed_training = [t for t in trainings if t.status == "completed"]
    approved_participations = [p for p in participations if p.approval_status == models.ApprovalStatus.approved]

    status_counts = {}
    for p in participations:
        key = p.approval_status.value if hasattr(p.approval_status, "value") else p.approval_status
        status_counts[key] = status_counts.get(key, 0) + 1

    training_status_counts = {}
    for t in trainings:
        training_status_counts[t.status] = training_status_counts.get(t.status, 0) + 1

    department_breakdown = []
    for dept in db.query(models.Department).all():
        dept_employee_ids = [e.id for e in employees if e.department_id == dept.id]
        dept_participations = [p for p in participations if p.employee_id in dept_employee_ids]
        department_breakdown.append({
            "department_id": dept.id,
            "department_name": dept.name,
            "employees": len(dept_employee_ids),
            "csr_participations": len(dept_participations),
            "points_earned": sum(p.points_earned or 0 for p in dept_participations),
        })

    return {
        "total_csr_activities": len(activities),
        "total_participations": len(participations),
        "approved_participations": len(approved_participations),
        "pending_participations": status_counts.get("submitted", 0),
        "csr_points_awarded": sum(p.points_earned or 0 for p in approved_participations),
        "training_records": len(trainings),
        "training_completed": len(completed_training),
        "training_completion_rate": round((len(completed_training) / len(trainings)) * 100, 2) if trainings else 0,
        "participation_status_counts": status_counts,
        "training_status_counts": training_status_counts,
        "department_breakdown": department_breakdown,
        "recent_activities": [
            {"id": a.id, "title": a.title, "date": a.date, "department_id": a.department_id}
            for a in sorted(activities, key=lambda x: x.date or datetime.date.min, reverse=True)[:5]
        ],
    }
