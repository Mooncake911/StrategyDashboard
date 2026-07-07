from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.services.auth_config import current_user
from app.services.group_service import is_admin


async def get_object_or_404(
    db: AsyncSession,
    model,
    model_id: int,
    detail: str = "Not found",
):
    result = await db.execute(select(model).where(model.id == model_id))
    obj = result.scalar_one_or_none()
    if not obj:
        raise HTTPException(404, detail)
    return obj


async def require_admin(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can perform this action")
    return user
