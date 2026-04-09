from typing import Optional

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ScheduleTemplate(Base):
    __tablename__ = "schedule_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)
    service_label: Mapped[str] = mapped_column(String(200), nullable=False)
    interval_miles: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    interval_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    applies_to_make: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    applies_to_model: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    applies_to_year_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    applies_to_year_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="recommended")
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str] = mapped_column(String(100), default="industry_standard")
