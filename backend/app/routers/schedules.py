from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.schedule_template import ScheduleTemplate
from app.models.vehicle import Vehicle
from app.schemas.schedule_template import (
    ScheduleTemplateCreate,
    ScheduleTemplateResponse,
    ScheduleTemplateUpdate,
)
from app.services.maintenance_checker import get_applicable_schedules

router = APIRouter(tags=["schedules"])


@router.get(
    "/vehicles/{vehicle_id}/schedule",
    response_model=List[ScheduleTemplateResponse],
)
def get_vehicle_schedule(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    all_templates = db.query(ScheduleTemplate).all()
    return get_applicable_schedules(vehicle, all_templates)


@router.get("/schedules/templates", response_model=List[ScheduleTemplateResponse])
def list_templates(db: Session = Depends(get_db)):
    return db.query(ScheduleTemplate).order_by(ScheduleTemplate.service_type).all()


@router.post(
    "/schedules/templates",
    response_model=ScheduleTemplateResponse,
    status_code=201,
)
def create_template(template: ScheduleTemplateCreate, db: Session = Depends(get_db)):
    db_template = ScheduleTemplate(**template.model_dump(), is_custom=True, source="user")
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.put(
    "/schedules/templates/{template_id}",
    response_model=ScheduleTemplateResponse,
)
def update_template(
    template_id: int,
    update: ScheduleTemplateUpdate,
    db: Session = Depends(get_db),
):
    template = db.query(ScheduleTemplate).filter(ScheduleTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Schedule template not found")

    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)
    return template
