from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.group_member import GroupMember


async def get_membership(
    db: AsyncSession, group_id: int, user_id: int
) -> GroupMember | None:
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def is_member(db: AsyncSession, group_id: int, user_id: int) -> bool:
    membership = await get_membership(db, group_id, user_id)
    return membership is not None and membership.status == "approved"


async def is_admin(db: AsyncSession, group_id: int, user_id: int) -> bool:
    membership = await get_membership(db, group_id, user_id)
    return membership is not None and membership.role == "admin" and membership.status == "approved"
