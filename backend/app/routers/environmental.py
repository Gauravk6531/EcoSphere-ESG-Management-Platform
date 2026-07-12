from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..services.config_service import get_config

router = APIRouter(prefix="/environmental", tags=["Environmental"])


# ---------- Emission Factors ----------

@router.get("/emission-factors", response_model=List[schemas.EmissionFactorOut])
def list_emission_factors(db: Session = Depends(get_db)):
    return db.query(models.EmissionFactor).all()


@router.post("/emission-factors", response_model=schemas.EmissionFactorOut)
def create_emission_factor(payload: schemas.EmissionFactorCreate, db: Session = Depends(get_db)):
    ef = models.EmissionFactor(**payload.model_dump())
    db.add(ef)
    db.commit()
    db.refresh(ef)
    return ef


@router.delete("/emission-factors/{factor_id}")
def delete_emission_factor(factor_id: int, db: Session = Depends(get_db)):
    ef = db.query(models.EmissionFactor).get(factor_id)
    if not ef:
        raise HTTPException(404, "Emission factor not found")
    db.delete(ef)
    db.commit()
    return {"ok": True}


# ---------- Carbon Transactions ----------

@router.get("/carbon-transactions", response_model=List[schemas.CarbonTransactionOut])
def list_carbon_transactions(department_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.CarbonTransaction)
    if department_id:
        q = q.filter(models.CarbonTransaction.department_id == department_id)
    return q.order_by(models.CarbonTransaction.date.desc()).all()


@router.post("/carbon-transactions", response_model=schemas.CarbonTransactionOut)
def create_carbon_transaction(payload: schemas.CarbonTransactionCreate, db: Session = Depends(get_db)):
    factor = db.query(models.EmissionFactor).get(payload.emission_factor_id)
    if not factor:
        raise HTTPException(404, "Emission factor not found")

    data = payload.model_dump()
    tx = models.CarbonTransaction(**data)
    # CO2e is always calculated server-side from the emission factor (manual or auto-triggered).
    tx.co2e_calculated = round(payload.quantity * factor.co2e_value, 4)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.post("/carbon-transactions/auto-calculate", response_model=schemas.CarbonTransactionOut)
def auto_calculate_carbon_transaction(payload: schemas.CarbonTransactionCreate, db: Session = Depends(get_db)):
    """
    Simulates the 'Auto Emission Calculation' feature: when the ESGConfig toggle is on,
    ERP source documents (purchase/manufacturing/expense/fleet) can push quantities here
    and a Carbon Transaction is generated automatically using the linked Emission Factor.
    """
    config = get_config(db)
    if not config.auto_emission_calculation:
        raise HTTPException(400, "Auto Emission Calculation is disabled in Settings")
    return create_carbon_transaction(payload, db)


# ---------- Product ESG Profiles ----------

@router.get("/product-profiles", response_model=List[schemas.ProductESGProfileOut])
def list_product_profiles(db: Session = Depends(get_db)):
    return db.query(models.ProductESGProfile).all()


@router.post("/product-profiles", response_model=schemas.ProductESGProfileOut)
def create_product_profile(payload: schemas.ProductESGProfileCreate, db: Session = Depends(get_db)):
    profile = models.ProductESGProfile(**payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


# ---------- Environmental Goals ----------

@router.get("/goals", response_model=List[schemas.EnvironmentalGoalOut])
def list_goals(department_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.EnvironmentalGoal)
    if department_id:
        q = q.filter(models.EnvironmentalGoal.department_id == department_id)
    return q.all()


@router.post("/goals", response_model=schemas.EnvironmentalGoalOut)
def create_goal(payload: schemas.EnvironmentalGoalCreate, db: Session = Depends(get_db)):
    goal = models.EnvironmentalGoal(**payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.put("/goals/{goal_id}", response_model=schemas.EnvironmentalGoalOut)
def update_goal(goal_id: int, payload: schemas.EnvironmentalGoalCreate, db: Session = Depends(get_db)):
    goal = db.query(models.EnvironmentalGoal).get(goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    for k, v in payload.model_dump().items():
        setattr(goal, k, v)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.EnvironmentalGoal).get(goal_id)
    if not goal:
        raise HTTPException(404, "Goal not found")
    db.delete(goal)
    db.commit()
    return {"ok": True}
