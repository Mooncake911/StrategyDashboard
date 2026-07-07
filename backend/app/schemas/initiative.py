from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.constants import InitiativeStatus, Priority


class InitiativeBase(BaseModel):
    q: str = "Q1"
    account: str = ""
    unit: str = ""
    lpr: str = ""
    action: str = ""
    kpi: str = ""
    priority: Priority = Priority.HIGH
    status: InitiativeStatus = InitiativeStatus.PENDING
    owner: str = ""
    potential: float = 0.0
    next_date: str = ""
    comment: str = ""
    group_id: int | None = None


class InitiativeCreate(InitiativeBase):
    pass


class InitiativeUpdate(BaseModel):
    q: str | None = None
    account: str | None = None
    unit: str | None = None
    lpr: str | None = None
    action: str | None = None
    kpi: str | None = None
    priority: Priority | None = None
    status: InitiativeStatus | None = None
    owner: str | None = None
    potential: float | None = None
    next_date: str | None = None
    comment: str | None = None


class StatusUpdate(BaseModel):
    status: InitiativeStatus


class InitiativeRead(InitiativeBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
