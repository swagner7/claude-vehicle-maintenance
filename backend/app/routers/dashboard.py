from dataclasses import asdict
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance_record import MaintenanceRecord
from app.models.schedule_template import ScheduleTemplate
from app.models.vehicle import Vehicle
from app.services.maintenance_checker import get_applicable_schedules, get_vehicle_maintenance_status

router = APIRouter(tags=["dashboard"])


@router.get("/vehicles/{vehicle_id}/status")
def get_vehicle_status(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    records = (
        db.query(MaintenanceRecord)
        .filter(MaintenanceRecord.vehicle_id == vehicle_id)
        .all()
    )
    all_templates = db.query(ScheduleTemplate).all()
    schedules = get_applicable_schedules(vehicle, all_templates)
    statuses = get_vehicle_maintenance_status(vehicle, records, schedules)

    return {
        "vehicle_id": vehicle_id,
        "current_mileage": vehicle.current_mileage,
        "items": [asdict(s) for s in statuses],
    }


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    vehicles = db.query(Vehicle).all()
    all_templates = db.query(ScheduleTemplate).all()

    vehicle_summaries = []
    for vehicle in vehicles:
        records = (
            db.query(MaintenanceRecord)
            .filter(MaintenanceRecord.vehicle_id == vehicle.id)
            .all()
        )
        schedules = get_applicable_schedules(vehicle, all_templates)
        statuses = get_vehicle_maintenance_status(vehicle, records, schedules)

        overdue = [asdict(s) for s in statuses if s.status == "overdue"]
        due_soon = [asdict(s) for s in statuses if s.status == "due_soon"]

        # Recent: maintenance done in the last 90 days
        cutoff = date.today() - timedelta(days=90)
        recent = [
            {
                "service_type": r.service_type,
                "service_label": r.service_label,
                "performed_at": r.performed_at.isoformat(),
                "mileage_at": r.mileage_at,
            }
            for r in sorted(records, key=lambda r: r.performed_at, reverse=True)
            if r.performed_at >= cutoff
        ]

        vehicle_summaries.append(
            {
                "vehicle_id": vehicle.id,
                "year": vehicle.year,
                "make": vehicle.make,
                "model": vehicle.model,
                "nickname": vehicle.nickname,
                "current_mileage": vehicle.current_mileage,
                "overdue_count": len(overdue),
                "due_soon_count": len(due_soon),
                "overdue": overdue,
                "due_soon": due_soon,
                "recent": recent,
            }
        )

    return {"vehicles": vehicle_summaries}
