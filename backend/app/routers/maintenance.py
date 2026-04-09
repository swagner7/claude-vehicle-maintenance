from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance_record import MaintenanceRecord
from app.models.vehicle import Vehicle
from app.schemas.maintenance_record import (
    MaintenanceRecordCreate,
    MaintenanceRecordResponse,
    MaintenanceRecordUpdate,
)

router = APIRouter(tags=["maintenance"])


def _get_vehicle_or_404(vehicle_id: int, db: Session) -> Vehicle:
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.get(
    "/vehicles/{vehicle_id}/maintenance",
    response_model=List[MaintenanceRecordResponse],
)
def list_maintenance(vehicle_id: int, db: Session = Depends(get_db)):
    _get_vehicle_or_404(vehicle_id, db)
    return (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.vehicle_id == vehicle_id)
        .order_by(MaintenanceRecord.performed_at.desc())
        .all()
    )


@router.post(
    "/vehicles/{vehicle_id}/maintenance",
    response_model=MaintenanceRecordResponse,
    status_code=201,
)
def create_maintenance(
    vehicle_id: int,
    record: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
):
    _get_vehicle_or_404(vehicle_id, db)
    db_record = MaintenanceRecord(vehicle_id=vehicle_id, **record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.get(
    "/vehicles/{vehicle_id}/maintenance/{record_id}",
    response_model=MaintenanceRecordResponse,
)
def get_maintenance(vehicle_id: int, record_id: int, db: Session = Depends(get_db)):
    _get_vehicle_or_404(vehicle_id, db)
    record = (
        db.query(MaintenanceRecord)
        .filter(
            MaintenanceRecord.id == record_id,
            MaintenanceRecord.vehicle_id == vehicle_id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


@router.put(
    "/vehicles/{vehicle_id}/maintenance/{record_id}",
    response_model=MaintenanceRecordResponse,
)
def update_maintenance(
    vehicle_id: int,
    record_id: int,
    update: MaintenanceRecordUpdate,
    db: Session = Depends(get_db),
):
    _get_vehicle_or_404(vehicle_id, db)
    record = (
        db.query(MaintenanceRecord)
        .filter(
            MaintenanceRecord.id == record_id,
            MaintenanceRecord.vehicle_id == vehicle_id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    for key, value in update.model_dump(exclude_unset=True).items():
        setattr(record, key, value)

    db.commit()
    db.refresh(record)
    return record


@router.delete("/vehicles/{vehicle_id}/maintenance/{record_id}", status_code=204)
def delete_maintenance(vehicle_id: int, record_id: int, db: Session = Depends(get_db)):
    _get_vehicle_or_404(vehicle_id, db)
    record = (
        db.query(MaintenanceRecord)
        .filter(
            MaintenanceRecord.id == record_id,
            MaintenanceRecord.vehicle_id == vehicle_id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    db.delete(record)
    db.commit()
