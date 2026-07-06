from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class InitiativeBase(BaseModel):
    q: str = "Q1"
    account: str = ""
    unit: str = ""
    lpr: str = ""
    action: str = ""
    kpi: str = ""
    priority: str = "high"
    status: str = "pending"
    owner: str = ""
    potential: float = 0.0
    next_date: str = ""
    comment: str = ""


class InitiativeCreate(InitiativeBase):
    pass


class InitiativeUpdate(BaseModel):
    q: Optional[str] = None
    account: Optional[str] = None
    unit: Optional[str] = None
    lpr: Optional[str] = None
    action: Optional[str] = None
    kpi: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    owner: Optional[str] = None
    potential: Optional[float] = None
    next_date: Optional[str] = None
    comment: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


class InitiativeRead(InitiativeBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
