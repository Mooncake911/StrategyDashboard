from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.initiative import Initiative
from app.models.contact import Contact
from app.schemas.group import GroupCreate, GroupRead, MemberRead, RoleUpdate
from app.services.auth_config import current_user
from app.services.group_service import is_admin, get_membership

router = APIRouter(prefix="/api/groups", tags=["groups"])


async def get_membership_or_404(db: AsyncSession, group_id: int, user_id: int):
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member or member.status != "approved":
        raise HTTPException(403, "You are not a member of this group")
    return member


@router.get("", response_model=list[GroupRead])
async def list_groups(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(
        select(
            Group.id,
            Group.name,
            Group.description,
            Group.created_by,
            Group.created_at,
            func.count(GroupMember.id).label("member_count"),
        )
        .outerjoin(GroupMember, GroupMember.group_id == Group.id)
        .group_by(Group.id)
        .order_by(Group.id)
    )
    rows = result.all()

    memberships = await db.execute(
        select(GroupMember.group_id, GroupMember.status, GroupMember.role)
        .where(GroupMember.user_id == user.id)
    )
    membership_map = {
        m.group_id: {"status": m.status, "role": m.role}
        for m in memberships.all()
    }

    return [
        GroupRead(
            id=row.id,
            name=row.name,
            description=row.description,
            created_by=row.created_by,
            created_at=row.created_at,
            member_count=row.member_count,
            my_status=membership_map.get(row.id, {}).get("status"),
            my_role=membership_map.get(row.id, {}).get("role"),
        )
        for row in rows
    ]


@router.post("", response_model=GroupRead, status_code=201)
async def create_group(
    body: GroupCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    group = Group(name=body.name, description=body.description, created_by=user.id)
    db.add(group)
    await db.commit()
    await db.refresh(group)

    member = GroupMember(
        group_id=group.id,
        user_id=user.id,
        role="admin",
        status="approved",
    )
    db.add(member)
    await db.commit()

    return GroupRead(
        id=group.id,
        name=group.name,
        description=group.description,
        created_by=group.created_by,
        created_at=group.created_at,
        member_count=1,
    )


@router.get("/{group_id}", response_model=GroupRead)
async def get_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(404, "Group not found")

    count_result = await db.execute(
        select(func.count(GroupMember.id)).where(
            GroupMember.group_id == group_id,
            GroupMember.status == "approved",
        )
    )
    member_count = count_result.scalar() or 0

    return GroupRead(
        id=group.id,
        name=group.name,
        description=group.description,
        created_by=group.created_by,
        created_at=group.created_at,
        member_count=member_count,
    )


@router.put("/{group_id}")
async def update_group(
    group_id: int,
    body: GroupCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can update the group")
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(404, "Group not found")
    group.name = body.name
    group.description = body.description
    await db.commit()
    return {"ok": True}


@router.delete("/{group_id}", status_code=204)
async def delete_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(404, "Group not found")
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can delete the group")
    await db.execute(sa_delete(GroupMember).where(GroupMember.group_id == group_id))
    await db.execute(sa_delete(Initiative).where(Initiative.group_id == group_id))
    await db.execute(sa_delete(Contact).where(Contact.group_id == group_id))
    await db.delete(group)
    await db.commit()


@router.post("/{group_id}/invite")
async def invite_user(
    group_id: int,
    user_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can invite users")

    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(404, "Group not found")

    existing = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "User is already in the group or has a pending request")

    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(404, "User not found")

    member = GroupMember(
        group_id=group_id,
        user_id=user_id,
        role="member",
        status="approved",
    )
    db.add(member)
    await db.commit()
    return {"ok": True, "invited": target.email}


@router.post("/{group_id}/join")
async def join_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(404, "Group not found")

    existing = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Already joined or pending")

    member = GroupMember(
        group_id=group_id,
        user_id=user.id,
        role="member",
        status="pending",
    )
    db.add(member)
    await db.commit()
    return {"ok": True, "status": "pending"}


@router.post("/{group_id}/leave")
async def leave_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    member = await get_membership_or_404(db, group_id, user.id)

    if member.role == "admin":
        admin_count = await db.scalar(
            select(func.count(GroupMember.id)).where(
                GroupMember.group_id == group_id,
                GroupMember.role == "admin",
                GroupMember.status == "approved",
            )
        )
        if admin_count and admin_count <= 1:
            result = await db.execute(select(Group).where(Group.id == group_id))
            group = result.scalar_one_or_none()
            raise HTTPException(
                400,
                detail={
                    "code": "last_admin",
                    "group_name": group.name if group else "",
                    "message": "Вы последний администратор. Если вы выйдете, группа будет удалена.",
                },
            )

    await db.delete(member)
    await db.commit()
    return {"ok": True}


@router.get("/{group_id}/members", response_model=list[MemberRead])
async def list_members(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    await get_membership_or_404(db, group_id, user.id)

    result = await db.execute(
        select(GroupMember, User.email, User.full_name)
        .join(User, User.id == GroupMember.user_id)
        .where(GroupMember.group_id == group_id)
        .order_by(GroupMember.id)
    )
    rows = result.all()
    return [
        MemberRead(
            id=gm.GroupMember.id,
            user_id=gm.GroupMember.user_id,
            email=gm.email,
            full_name=gm.full_name,
            role=gm.GroupMember.role,
            status=gm.GroupMember.status,
        )
        for gm in rows
    ]


@router.patch("/{group_id}/members/{user_id}/approve")
async def approve_member(
    group_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can approve members")
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(404, "Membership request not found")
    member.status = "approved"
    await db.commit()
    return {"ok": True}


@router.patch("/{group_id}/members/{user_id}/reject")
async def reject_member(
    group_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can reject members")
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(404, "Membership request not found")
    member.status = "rejected"
    await db.commit()
    return {"ok": True}


@router.delete("/{group_id}/members/{user_id}", status_code=204)
async def kick_member(
    group_id: int,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can kick members")
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(404, "Member not found")
    if member.role == "admin" and member.user_id == user_id:
        raise HTTPException(400, "Cannot remove yourself")
    await db.delete(member)
    await db.commit()


@router.put("/{group_id}/members/{user_id}/role")
async def change_role(
    group_id: int,
    user_id: int,
    body: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if body.role not in ("admin", "member"):
        raise HTTPException(400, "Invalid role")

    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(404, "Group not found")
    if not await is_admin(db, group_id, user.id):
        raise HTTPException(403, "Only admins can change roles")

    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member or member.status != "approved":
        raise HTTPException(404, "Approved member not found")

    member.role = body.role
    await db.commit()
    return {"ok": True}
