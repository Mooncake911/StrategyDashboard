from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class GroupCreate(BaseModel):
    name: str
    description: str = ""


class GroupRead(BaseModel):
    id: int
    name: str
    description: str
    created_by: int
    member_count: int = 0
    my_status: str | None = None
    my_role: str | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class MemberRead(BaseModel):
    id: int
    user_id: int
    email: str = ""
    full_name: str = ""
    role: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class RoleUpdate(BaseModel):
    role: str


class UserSearchRead(BaseModel):
    id: int
    email: str
    full_name: str

    model_config = ConfigDict(from_attributes=True)
