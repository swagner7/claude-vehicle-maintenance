from app.database import SessionLocal
from app.models.schedule_template import ScheduleTemplate

DEFAULT_SCHEDULES = [
    {
        "service_type": "oil_change",
        "service_label": "Oil & Filter Change",
        "interval_miles": 5000,
        "interval_months": 6,
        "description": "Replace engine oil and oil filter. Essential for engine longevity. Modern synthetic oils may allow 7,500-10,000 mile intervals — check your owner's manual.",
        "severity": "critical",
    },
    {
        "service_type": "tire_rotation",
        "service_label": "Tire Rotation",
        "interval_miles": 5000,
        "interval_months": 6,
        "description": "Rotate tires to promote even wear and extend tire life. Often done at the same time as an oil change.",
        "severity": "recommended",
    },
    {
        "service_type": "engine_air_filter",
        "service_label": "Engine Air Filter",
        "interval_miles": 20000,
        "interval_months": 24,
        "description": "Replace the engine air filter to ensure proper airflow and fuel efficiency. Easy to inspect visually — if it looks dirty, replace it.",
        "severity": "recommended",
    },
    {
        "service_type": "cabin_air_filter",
        "service_label": "Cabin Air Filter",
        "interval_miles": 15000,
        "interval_months": 12,
        "description": "Replace the cabin air filter for clean air inside the vehicle. Affects A/C performance and air quality.",
        "severity": "optional",
    },
    {
        "service_type": "brake_fluid",
        "service_label": "Brake Fluid Flush",
        "interval_miles": 30000,
        "interval_months": 24,
        "description": "Replace brake fluid to maintain braking performance. Brake fluid absorbs moisture over time, which lowers its boiling point.",
        "severity": "recommended",
    },
    {
        "service_type": "transmission_fluid",
        "service_label": "Transmission Fluid",
        "interval_miles": 50000,
        "interval_months": 48,
        "description": "Replace transmission fluid to protect the transmission. Intervals vary significantly — some modern transmissions use 'lifetime' fluid. Check your owner's manual.",
        "severity": "recommended",
    },
    {
        "service_type": "coolant_flush",
        "service_label": "Coolant Flush",
        "interval_miles": 30000,
        "interval_months": 24,
        "description": "Replace engine coolant to prevent overheating and corrosion. Some newer coolants last up to 100,000 miles.",
        "severity": "recommended",
    },
    {
        "service_type": "spark_plugs",
        "service_label": "Spark Plugs",
        "interval_miles": 60000,
        "interval_months": 60,
        "description": "Replace spark plugs for proper ignition and fuel efficiency. Iridium/platinum plugs can last 60,000-100,000 miles.",
        "severity": "recommended",
    },
    {
        "service_type": "serpentine_belt",
        "service_label": "Serpentine Belt",
        "interval_miles": 60000,
        "interval_months": 60,
        "description": "Inspect and replace the serpentine belt. A broken belt can cause loss of power steering, A/C, and alternator function.",
        "severity": "recommended",
    },
    {
        "service_type": "brake_pads",
        "service_label": "Brake Pads",
        "interval_miles": 40000,
        "interval_months": 48,
        "description": "Inspect and replace brake pads. Wear varies greatly based on driving habits. Listen for squealing or grinding noises.",
        "severity": "critical",
    },
    {
        "service_type": "battery",
        "service_label": "Battery Replacement",
        "interval_miles": None,
        "interval_months": 48,
        "description": "Test and replace the vehicle battery. Most batteries last 3-5 years. Extreme temperatures reduce lifespan.",
        "severity": "recommended",
    },
    {
        "service_type": "wiper_blades",
        "service_label": "Wiper Blades",
        "interval_miles": None,
        "interval_months": 12,
        "description": "Replace windshield wiper blades for clear visibility. Replace sooner if streaking or skipping.",
        "severity": "optional",
    },
    {
        "service_type": "power_steering_fluid",
        "service_label": "Power Steering Fluid",
        "interval_miles": 50000,
        "interval_months": 48,
        "description": "Replace power steering fluid. Not all vehicles require this — many newer vehicles have electric power steering.",
        "severity": "optional",
    },
    {
        "service_type": "differential_fluid",
        "service_label": "Differential Fluid",
        "interval_miles": 50000,
        "interval_months": 48,
        "description": "Replace differential fluid (rear-wheel and all-wheel drive vehicles). Protects the differential gears.",
        "severity": "optional",
    },
    {
        "service_type": "tire_alignment",
        "service_label": "Wheel Alignment",
        "interval_miles": 15000,
        "interval_months": 12,
        "description": "Check and adjust wheel alignment. Misalignment causes uneven tire wear and pulling. Recommended after hitting potholes or curbs.",
        "severity": "optional",
    },
]


def seed_schedule_templates():
    """Seed the database with default schedule templates if empty."""
    db = SessionLocal()
    try:
        existing = db.query(ScheduleTemplate).count()
        if existing > 0:
            return

        for schedule_data in DEFAULT_SCHEDULES:
            template = ScheduleTemplate(
                **schedule_data,
                is_custom=False,
                source="industry_standard",
            )
            db.add(template)
        db.commit()
    finally:
        db.close()
