from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.initiative import Initiative
from app.models.user import User
from app.schemas.initiative import (
    InitiativeCreate, InitiativeRead, InitiativeUpdate, StatusUpdate,
)
from app.services.auth_config import current_user
from app.services.group_service import is_admin

router = APIRouter(prefix="/api/initiatives", tags=["initiatives"])


@router.get("", response_model=list[InitiativeRead])
async def list_initiatives(
    group_id: int | None = Query(None),
    q: str | None = Query(None),
    account: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    stmt = select(Initiative).order_by(Initiative.id)

    if group_id is not None:
        stmt = stmt.where(Initiative.group_id == group_id)

    if q:
        stmt = stmt.where(Initiative.q == q)
    if account:
        stmt = stmt.where(Initiative.account == account)
    if status:
        stmt = stmt.where(Initiative.status == status)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            Initiative.account.ilike(pattern)
            | Initiative.unit.ilike(pattern)
            | Initiative.lpr.ilike(pattern)
            | Initiative.action.ilike(pattern)
            | Initiative.kpi.ilike(pattern)
            | Initiative.comment.ilike(pattern)
            | Initiative.owner.ilike(pattern)
        )

    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("", response_model=InitiativeRead, status_code=201)
async def create_initiative(
    body: InitiativeCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if body.group_id is not None and not await is_admin(db, body.group_id, user.id):
        raise HTTPException(403, "Only admins can create initiatives")
    initiative = Initiative(**body.model_dump())
    db.add(initiative)
    await db.commit()
    await db.refresh(initiative)
    return initiative


@router.get("/{initiative_id}", response_model=InitiativeRead)
async def get_initiative(
    initiative_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    return initiative


@router.put("/{initiative_id}", response_model=InitiativeRead)
async def update_initiative(
    initiative_id: int,
    body: InitiativeUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    if initiative.group_id is not None and not await is_admin(db, initiative.group_id, user.id):
        raise HTTPException(403, "Only admins can update initiatives")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(initiative, key, value)
    await db.commit()
    await db.refresh(initiative)
    return initiative


@router.delete("/{initiative_id}", status_code=204)
async def delete_initiative(
    initiative_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    if initiative.group_id is not None and not await is_admin(db, initiative.group_id, user.id):
        raise HTTPException(403, "Only admins can delete initiatives")
    await db.delete(initiative)
    await db.commit()


@router.patch("/{initiative_id}/status", response_model=InitiativeRead)
async def set_initiative_status(
    initiative_id: int,
    body: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    if initiative.group_id is not None and not await is_admin(db, initiative.group_id, user.id):
        raise HTTPException(403, "Only admins can change status")
    initiative.status = body.status
    await db.commit()
    await db.refresh(initiative)
    return initiative
