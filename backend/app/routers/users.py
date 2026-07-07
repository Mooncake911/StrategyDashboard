from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.group import UserSearchRead
from app.services.auth_config import current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/search", response_model=list[UserSearchRead])
async def search_users(
        q: str = Query("", min_length=1),
        db: AsyncSession = Depends(get_db),
        user: User = Depends(current_user),
):
    pattern = f"%{q}%"
    stmt = (
        select(User)
        .where(
            or_(
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
            )
        )
        .limit(20)
    )
    result = await db.execute(stmt)
    return result.scalars().all()
