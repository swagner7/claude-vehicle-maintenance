from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class VehicleCreate(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    make: str = Field(..., max_length=100)
    model: str = Field(..., max_length=100)
    trim: Optional[str] = Field(None, max_length=100)
    current_mileage: int = Field(..., ge=0)
    nickname: Optional[str] = Field(None, max_length=100)


class VehicleUpdate(BaseModel):
    year: Optional[int] = Field(None, ge=1900, le=2100)
    make: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    trim: Optional[str] = Field(None, max_length=100)
    current_mileage: Optional[int] = Field(None, ge=0)
    nickname: Optional[str] = Field(None, max_length=100)


class MileageUpdate(BaseModel):
    current_mileage: int = Field(..., ge=0)


class VehicleResponse(BaseModel):
    id: int
    year: int
    make: str
    model: str
    trim: Optional[str]
    current_mileage: int
    mileage_updated_at: datetime
    nickname: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
