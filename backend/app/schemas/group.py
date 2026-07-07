from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from app.constants import MemberRole, MemberStatus


class GroupCreate(BaseModel):
    name: str
    description: str = ""

    @field_validator("name")
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()


class GroupRead(BaseModel):
    id: int
    name: str
    description: str
    created_by: int
    member_count: int = 0
    my_status: MemberStatus | None = None
    my_role: MemberRole | None = None
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class MemberRead(BaseModel):
    id: int
    user_id: int
    email: str = ""
    full_name: str = ""
    role: MemberRole
    status: MemberStatus

    model_config = ConfigDict(from_attributes=True)


class RoleUpdate(BaseModel):
    role: MemberRole


class UserSearchRead(BaseModel):
    id: int
    email: str
    full_name: str

    model_config = ConfigDict(from_attributes=True)
