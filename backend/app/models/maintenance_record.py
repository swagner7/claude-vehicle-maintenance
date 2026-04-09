from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False
    )
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)
    service_label: Mapped[str] = mapped_column(String(200), nullable=False)
    performed_at: Mapped[date] = mapped_column(Date, nullable=False)
    mileage_at: Mapped[int] = mapped_column(Integer, nullable=False)
    shop_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="maintenance_records")
