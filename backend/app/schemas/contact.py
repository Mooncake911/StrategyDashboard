from pydantic import BaseModel, ConfigDict
from typing import Optional


class ContactBase(BaseModel):
    account: str = ""
    unit: str = ""
    name: str = ""
    email: str = ""
    phone: str = ""
    last_date: str = ""
    topic: str = ""
    next_step: str = ""


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    account: Optional[str] = None
    unit: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    last_date: Optional[str] = None
    topic: Optional[str] = None
    next_step: Optional[str] = None


class ContactRead(ContactBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
