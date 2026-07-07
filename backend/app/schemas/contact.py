from pydantic import BaseModel, ConfigDict


class ContactBase(BaseModel):
    account: str = ""
    unit: str = ""
    name: str = ""
    email: str = ""
    phone: str = ""
    last_date: str = ""
    topic: str = ""
    next_step: str = ""


class ContactUpdate(BaseModel):
    account: str | None = None
    unit: str | None = None
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    last_date: str | None = None
    topic: str | None = None
    next_step: str | None = None


class ContactRead(ContactBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
