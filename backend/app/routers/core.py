from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["Core"])


# ---------- Employees ----------

@router.get("/employees", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()


@router.post("/employees", response_model=schemas.EmployeeOut)
def create_employee(payload: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    emp = models.Employee(**payload.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@router.get("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(models.Employee).get(employee_id)
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp


# ---------- Departments ----------

@router.get("/departments", response_model=List[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()


@router.post("/departments", response_model=schemas.DepartmentOut)
def create_department(payload: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    dept = models.Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.put("/departments/{department_id}", response_model=schemas.DepartmentOut)
def update_department(department_id: int, payload: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    dept = db.query(models.Department).get(department_id)
    if not dept:
        raise HTTPException(404, "Department not found")
    for k, v in payload.model_dump().items():
        setattr(dept, k, v)
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/departments/{department_id}")
def delete_department(department_id: int, db: Session = Depends(get_db)):
    dept = db.query(models.Department).get(department_id)
    if not dept:
        raise HTTPException(404, "Department not found")
    db.delete(dept)
    db.commit()
    return {"ok": True}


# ---------- Categories ----------

@router.get("/categories", response_model=List[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.post("/categories", response_model=schemas.CategoryOut)
def create_category(payload: schemas.CategoryCreate, db: Session = Depends(get_db)):
    cat = models.Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(models.Category).get(category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    db.delete(cat)
    db.commit()
    return {"ok": True}


# ---------- Notifications ----------

@router.get("/notifications", response_model=List[schemas.NotificationOut])
def list_notifications(employee_id: int = None, db: Session = Depends(get_db)):
    q = db.query(models.Notification)
    if employee_id is not None:
        q = q.filter(
            (models.Notification.employee_id == employee_id) | (models.Notification.employee_id.is_(None))
        )
    return q.order_by(models.Notification.created_at.desc()).limit(100).all()


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Notification).get(notification_id)
    if not note:
        raise HTTPException(404, "Notification not found")
    note.read = True
    db.commit()
    return {"ok": True}


# ---------- Settings / Config ----------

@router.get("/config", response_model=schemas.ESGConfigOut)
def get_config_endpoint(db: Session = Depends(get_db)):
    from ..services.config_service import get_config
    return get_config(db)


@router.put("/config", response_model=schemas.ESGConfigOut)
def update_config(payload: schemas.ESGConfigUpdate, db: Session = Depends(get_db)):
    from ..services.config_service import get_config
    config = get_config(db)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(config, k, v)
    db.commit()
    db.refresh(config)
    return config
