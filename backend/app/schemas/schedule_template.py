from typing import Optional

from pydantic import BaseModel, Field


class ScheduleTemplateCreate(BaseModel):
    service_type: str = Field(..., max_length=100)
    service_label: str = Field(..., max_length=200)
    interval_miles: Optional[int] = Field(None, ge=0)
    interval_months: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    applies_to_make: Optional[str] = Field(None, max_length=100)
    applies_to_model: Optional[str] = Field(None, max_length=100)
    applies_to_year_min: Optional[int] = None
    applies_to_year_max: Optional[int] = None
    severity: str = Field("recommended", pattern="^(critical|recommended|optional)$")


class ScheduleTemplateUpdate(BaseModel):
    service_label: Optional[str] = Field(None, max_length=200)
    interval_miles: Optional[int] = Field(None, ge=0)
    interval_months: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    applies_to_make: Optional[str] = Field(None, max_length=100)
    applies_to_model: Optional[str] = Field(None, max_length=100)
    applies_to_year_min: Optional[int] = None
    applies_to_year_max: Optional[int] = None
    severity: Optional[str] = Field(None, pattern="^(critical|recommended|optional)$")


class ScheduleTemplateResponse(BaseModel):
    id: int
    service_type: str
    service_label: str
    interval_miles: Optional[int]
    interval_months: Optional[int]
    description: Optional[str]
    applies_to_make: Optional[str]
    applies_to_model: Optional[str]
    applies_to_year_min: Optional[int]
    applies_to_year_max: Optional[int]
    severity: str
    is_custom: bool
    source: str

    model_config = {"from_attributes": True}
