from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..services.badge_service import check_and_award_badges
from ..services.notification_service import notify

router = APIRouter(prefix="/gamification", tags=["Gamification"])


# ---------- Badges ----------

@router.get("/badges", response_model=List[schemas.BadgeOut])
def list_badges(db: Session = Depends(get_db)):
    return db.query(models.Badge).all()


@router.post("/badges", response_model=schemas.BadgeOut)
def create_badge(payload: schemas.BadgeCreate, db: Session = Depends(get_db)):
    badge = models.Badge(**payload.model_dump())
    db.add(badge)
    db.commit()
    db.refresh(badge)
    return badge


@router.delete("/badges/{badge_id}")
def delete_badge(badge_id: int, db: Session = Depends(get_db)):
    badge = db.query(models.Badge).get(badge_id)
    if not badge:
        raise HTTPException(404, "Badge not found")
    db.delete(badge)
    db.commit()
    return {"ok": True}


@router.get("/employees/{employee_id}/badges", response_model=List[schemas.EmployeeBadgeOut])
def employee_badges(employee_id: int, db: Session = Depends(get_db)):
    return db.query(models.EmployeeBadge).filter(models.EmployeeBadge.employee_id == employee_id).all()


@router.post("/employees/{employee_id}/check-badges", response_model=List[schemas.EmployeeBadgeOut])
def force_check_badges(employee_id: int, db: Session = Depends(get_db)):
    """Manually re-run badge auto-award check (also runs automatically after approvals)."""
    return check_and_award_badges(db, employee_id)


# ---------- Rewards ----------

@router.get("/rewards", response_model=List[schemas.RewardOut])
def list_rewards(db: Session = Depends(get_db)):
    return db.query(models.Reward).all()


@router.post("/rewards", response_model=schemas.RewardOut)
def create_reward(payload: schemas.RewardCreate, db: Session = Depends(get_db)):
    reward = models.Reward(**payload.model_dump())
    db.add(reward)
    db.commit()
    db.refresh(reward)
    return reward


@router.put("/rewards/{reward_id}", response_model=schemas.RewardOut)
def update_reward(reward_id: int, payload: schemas.RewardCreate, db: Session = Depends(get_db)):
    reward = db.query(models.Reward).get(reward_id)
    if not reward:
        raise HTTPException(404, "Reward not found")
    for k, v in payload.model_dump().items():
        setattr(reward, k, v)
    db.commit()
    db.refresh(reward)
    return reward


@router.delete("/rewards/{reward_id}")
def delete_reward(reward_id: int, db: Session = Depends(get_db)):
    reward = db.query(models.Reward).get(reward_id)
    if not reward:
        raise HTTPException(404, "Reward not found")
    db.delete(reward)
    db.commit()
    return {"ok": True}


@router.post("/rewards/redeem", response_model=schemas.RewardRedemptionOut)
def redeem_reward(payload: schemas.RewardRedemptionCreate, db: Session = Depends(get_db)):
    reward = db.query(models.Reward).get(payload.reward_id)
    employee = db.query(models.Employee).get(payload.employee_id)
    if not reward or not employee:
        raise HTTPException(404, "Reward or employee not found")
    if reward.status != models.RewardStatus.active:
        raise HTTPException(400, "Reward is not active")
    if reward.stock <= 0:
        raise HTTPException(400, "Reward is out of stock")
    if employee.points_balance < reward.points_required:
        raise HTTPException(400, "Insufficient points balance")

    reward.stock -= 1
    employee.points_balance -= reward.points_required

    redemption = models.RewardRedemption(
        employee_id=employee.id,
        reward_id=reward.id,
        points_deducted=reward.points_required,
    )
    db.add(redemption)
    db.commit()
    db.refresh(redemption)
    return redemption


@router.get("/redemptions", response_model=List[schemas.RewardRedemptionOut])
def list_redemptions(employee_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.RewardRedemption)
    if employee_id:
        q = q.filter(models.RewardRedemption.employee_id == employee_id)
    return q.order_by(models.RewardRedemption.date.desc()).all()


# ---------- Challenges ----------

@router.get("/challenges", response_model=List[schemas.ChallengeOut])
def list_challenges(status: str = None, db: Session = Depends(get_db)):
    q = db.query(models.Challenge)
    if status:
        q = q.filter(models.Challenge.status == status)
    return q.all()


@router.post("/challenges", response_model=schemas.ChallengeOut)
def create_challenge(payload: schemas.ChallengeCreate, db: Session = Depends(get_db)):
    challenge = models.Challenge(**payload.model_dump())
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge


VALID_TRANSITIONS = {
    "draft": {"active", "archived"},
    "active": {"under_review", "archived"},
    "under_review": {"completed", "active", "archived"},
    "completed": {"archived"},
    "archived": set(),
}


@router.put("/challenges/{challenge_id}/status", response_model=schemas.ChallengeOut)
def update_challenge_status(challenge_id: int, payload: schemas.ChallengeStatusUpdate, db: Session = Depends(get_db)):
    challenge = db.query(models.Challenge).get(challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    current = challenge.status.value if hasattr(challenge.status, "value") else challenge.status
    allowed = VALID_TRANSITIONS.get(current, set())
    if payload.status != current and payload.status not in allowed and payload.status != "archived":
        raise HTTPException(400, f"Cannot move challenge from '{current}' to '{payload.status}'")
    challenge.status = payload.status
    db.commit()
    db.refresh(challenge)
    return challenge


@router.put("/challenges/{challenge_id}", response_model=schemas.ChallengeOut)
def update_challenge(challenge_id: int, payload: schemas.ChallengeCreate, db: Session = Depends(get_db)):
    challenge = db.query(models.Challenge).get(challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    for k, v in payload.model_dump().items():
        setattr(challenge, k, v)
    db.commit()
    db.refresh(challenge)
    return challenge


@router.delete("/challenges/{challenge_id}")
def delete_challenge(challenge_id: int, db: Session = Depends(get_db)):
    challenge = db.query(models.Challenge).get(challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    db.delete(challenge)
    db.commit()
    return {"ok": True}


# ---------- Challenge Participation ----------

@router.get("/challenge-participations", response_model=List[schemas.ChallengeParticipationOut])
def list_challenge_participations(challenge_id: int = None, employee_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.ChallengeParticipation)
    if challenge_id:
        q = q.filter(models.ChallengeParticipation.challenge_id == challenge_id)
    if employee_id:
        q = q.filter(models.ChallengeParticipation.employee_id == employee_id)
    return q.all()


@router.post("/challenge-participations", response_model=schemas.ChallengeParticipationOut)
def create_challenge_participation(payload: schemas.ChallengeParticipationCreate, db: Session = Depends(get_db)):
    participation = models.ChallengeParticipation(**payload.model_dump())
    participation.approval_status = models.ApprovalStatus.submitted
    db.add(participation)
    db.commit()
    db.refresh(participation)
    return participation


@router.post(
    "/challenge-participations/{participation_id}/decision",
    response_model=schemas.ChallengeParticipationOut,
)
def decide_challenge_participation(
    participation_id: int, payload: schemas.ChallengeParticipationDecision, db: Session = Depends(get_db)
):
    participation = db.query(models.ChallengeParticipation).get(participation_id)
    if not participation:
        raise HTTPException(404, "Challenge participation not found")

    challenge = db.query(models.Challenge).get(participation.challenge_id)

    if payload.approve:
        if challenge.evidence_required and not participation.proof_url:
            raise HTTPException(400, "Cannot approve: proof file is required for this challenge")
        participation.approval_status = models.ApprovalStatus.approved
        participation.xp_awarded = challenge.xp
        participation.progress = 100

        employee = db.query(models.Employee).get(participation.employee_id)
        if employee:
            employee.xp_total = (employee.xp_total or 0) + challenge.xp
            employee.points_balance = (employee.points_balance or 0) + challenge.xp
        db.commit()

        check_and_award_badges(db, participation.employee_id)
    else:
        participation.approval_status = models.ApprovalStatus.rejected
        db.commit()

    notify(
        db,
        participation.employee_id,
        "challenge_approval_decision",
        f"Your challenge submission was {'approved' if payload.approve else 'rejected'}.",
        gate_field="notify_approval_decision",
    )

    db.refresh(participation)
    return participation


# ---------- Leaderboard ----------

@router.get("/leaderboard")
def leaderboard(department_id: int = None, limit: int = 20, db: Session = Depends(get_db)):
    q = db.query(models.Employee)
    if department_id:
        q = q.filter(models.Employee.department_id == department_id)
    employees = q.order_by(models.Employee.xp_total.desc()).limit(limit).all()
    return [
        {
            "rank": idx + 1,
            "employee_id": e.id,
            "name": e.name,
            "department_id": e.department_id,
            "xp_total": e.xp_total,
            "points_balance": e.points_balance,
        }
        for idx, e in enumerate(employees)
    ]
