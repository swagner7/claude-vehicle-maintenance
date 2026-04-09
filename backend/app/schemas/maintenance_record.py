from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class MaintenanceRecordCreate(BaseModel):
    service_type: str = Field(..., max_length=100)
    service_label: str = Field(..., max_length=200)
    performed_at: date
    mileage_at: int = Field(..., ge=0)
    shop_name: Optional[str] = Field(None, max_length=200)
    cost: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None


class MaintenanceRecordUpdate(BaseModel):
    service_type: Optional[str] = Field(None, max_length=100)
    service_label: Optional[str] = Field(None, max_length=200)
    performed_at: Optional[date] = None
    mileage_at: Optional[int] = Field(None, ge=0)
    shop_name: Optional[str] = Field(None, max_length=200)
    cost: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None


class MaintenanceRecordResponse(BaseModel):
    id: int
    vehicle_id: int
    service_type: str
    service_label: str
    performed_at: date
    mileage_at: int
    shop_name: Optional[str]
    cost: Optional[Decimal]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
