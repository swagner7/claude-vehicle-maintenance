from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import MileageUpdate, VehicleCreate, VehicleResponse, VehicleUpdate

router = APIRouter(tags=["vehicles"])


@router.get("/vehicles", response_model=List[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).order_by(Vehicle.created_at.desc()).all()


@router.post("/vehicles", response_model=VehicleResponse, status_code=201)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = Vehicle(
        **vehicle.model_dump(),
        mileage_updated_at=datetime.now(timezone.utc),
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, update: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    update_data = update.model_dump(exclude_unset=True)
    if "current_mileage" in update_data:
        update_data["mileage_updated_at"] = datetime.now(timezone.utc)

    for key, value in update_data.items():
        setattr(vehicle, key, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/vehicles/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()


@router.patch("/vehicles/{vehicle_id}/mileage", response_model=VehicleResponse)
def update_mileage(vehicle_id: int, update: MileageUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    vehicle.current_mileage = update.current_mileage
    vehicle.mileage_updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(vehicle)
    return vehicle
