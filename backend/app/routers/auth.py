from fastapi import APIRouter
from app.services.auth_config import fastapi_users, auth_backend
from app.schemas.user import UserRead, UserCreate, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["auth"])

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="",
)
router.include_router(fastapi_users.get_auth_router(auth_backend), prefix="")
router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="",
)
