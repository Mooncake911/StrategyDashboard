from fastapi_users.schemas import BaseUser, BaseUserCreate, BaseUserUpdate
from pydantic import ConfigDict


class UserRead(BaseUser[int]):
    full_name: str = ""

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseUserCreate):
    full_name: str = ""


class UserUpdate(BaseUserUpdate):
    full_name: str | None = None
