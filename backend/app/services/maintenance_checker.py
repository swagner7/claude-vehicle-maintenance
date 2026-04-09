from dataclasses import dataclass
from datetime import date, timedelta
from typing import Dict, List, Optional

from app.models.maintenance_record import MaintenanceRecord
from app.models.schedule_template import ScheduleTemplate
from app.models.vehicle import Vehicle


@dataclass
class ServiceStatus:
    service_type: str
    service_label: str
    severity: str
    description: Optional[str]
    status: str  # "overdue", "due_soon", "ok", "unknown"
    last_performed_date: Optional[date]
    last_performed_mileage: Optional[int]
    next_due_mileage: Optional[int]
    next_due_date: Optional[date]
    miles_remaining: Optional[int]
    days_remaining: Optional[int]
    interval_miles: Optional[int]
    interval_months: Optional[int]


def get_applicable_schedules(
    vehicle: Vehicle,
    all_templates: List[ScheduleTemplate],
) -> List[ScheduleTemplate]:
    """Filter and prioritize schedule templates for a specific vehicle.

    More specific matches (make+model) override generic ones for the same service_type.
    """
    candidates: Dict[str, tuple] = {}

    for template in all_templates:
        # Check year range
        if template.applies_to_year_min and vehicle.year < template.applies_to_year_min:
            continue
        if template.applies_to_year_max and vehicle.year > template.applies_to_year_max:
            continue

        # Calculate specificity score
        specificity = 0
        if template.applies_to_make:
            if template.applies_to_make.lower() != vehicle.make.lower():
                continue
            specificity += 1
        if template.applies_to_model:
            if template.applies_to_model.lower() != vehicle.model.lower():
                continue
            specificity += 1

        # Keep the most specific match for each service_type
        existing = candidates.get(template.service_type)
        if existing is None or specificity > existing[0]:
            candidates[template.service_type] = (specificity, template)

    return [template for _, template in candidates.values()]


def get_vehicle_maintenance_status(
    vehicle: Vehicle,
    records: List[MaintenanceRecord],
    schedules: List[ScheduleTemplate],
) -> List[ServiceStatus]:
    """Calculate maintenance status for each applicable schedule item."""
    # Index most recent record per service_type
    latest_by_type: Dict[str, MaintenanceRecord] = {}
    for record in records:
        existing = latest_by_type.get(record.service_type)
        if existing is None or record.performed_at > existing.performed_at:
            latest_by_type[record.service_type] = record

    today = date.today()
    statuses: List[ServiceStatus] = []

    for schedule in schedules:
        last_record = latest_by_type.get(schedule.service_type)

        if last_record is None:
            statuses.append(
                ServiceStatus(
                    service_type=schedule.service_type,
                    service_label=schedule.service_label,
                    severity=schedule.severity,
                    description=schedule.description,
                    status="unknown",
                    last_performed_date=None,
                    last_performed_mileage=None,
                    next_due_mileage=None,
                    next_due_date=None,
                    miles_remaining=None,
                    days_remaining=None,
                    interval_miles=schedule.interval_miles,
                    interval_months=schedule.interval_months,
                )
            )
            continue

        # Calculate next due by mileage
        next_due_mileage = None
        miles_remaining = None
        if schedule.interval_miles:
            next_due_mileage = last_record.mileage_at + schedule.interval_miles
            miles_remaining = next_due_mileage - vehicle.current_mileage

        # Calculate next due by date
        next_due_date = None
        days_remaining = None
        if schedule.interval_months:
            next_due_date = last_record.performed_at + timedelta(
                days=schedule.interval_months * 30
            )
            days_remaining = (next_due_date - today).days

        # Determine status — whichever threshold is hit first
        status = "ok"
        if miles_remaining is not None and miles_remaining <= 0:
            status = "overdue"
        elif days_remaining is not None and days_remaining <= 0:
            status = "overdue"
        elif miles_remaining is not None and miles_remaining <= 500:
            status = "due_soon"
        elif days_remaining is not None and days_remaining <= 30:
            status = "due_soon"

        statuses.append(
            ServiceStatus(
                service_type=schedule.service_type,
                service_label=schedule.service_label,
                severity=schedule.severity,
                description=schedule.description,
                status=status,
                last_performed_date=last_record.performed_at,
                last_performed_mileage=last_record.mileage_at,
                next_due_mileage=next_due_mileage,
                next_due_date=next_due_date,
                miles_remaining=miles_remaining,
                days_remaining=days_remaining,
                interval_miles=schedule.interval_miles,
                interval_months=schedule.interval_months,
            )
        )

    # Sort: overdue first, then due_soon, then unknown, then ok
    priority = {"overdue": 0, "due_soon": 1, "unknown": 2, "ok": 3}
    statuses.sort(key=lambda s: priority.get(s.status, 4))

    return statuses
