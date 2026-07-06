from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.initiative import Initiative
from app.schemas.initiative import (
    InitiativeCreate, InitiativeRead, InitiativeUpdate, StatusUpdate,
)

router = APIRouter(prefix="/api/initiatives", tags=["initiatives"])


@router.get("", response_model=list[InitiativeRead])
async def list_initiatives(
    q: str | None = Query(None),
    account: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Initiative).order_by(Initiative.id)

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
async def create_initiative(body: InitiativeCreate, db: AsyncSession = Depends(get_db)):
    initiative = Initiative(**body.model_dump())
    db.add(initiative)
    await db.commit()
    await db.refresh(initiative)
    return initiative


@router.get("/{initiative_id}", response_model=InitiativeRead)
async def get_initiative(initiative_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    return initiative


@router.put("/{initiative_id}", response_model=InitiativeRead)
async def update_initiative(
    initiative_id: int, body: InitiativeUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(initiative, key, value)
    await db.commit()
    await db.refresh(initiative)
    return initiative


@router.delete("/{initiative_id}", status_code=204)
async def delete_initiative(initiative_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    await db.delete(initiative)
    await db.commit()


@router.patch("/{initiative_id}/status", response_model=InitiativeRead)
async def set_initiative_status(
    initiative_id: int, body: StatusUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Initiative).where(Initiative.id == initiative_id))
    initiative = result.scalar_one_or_none()
    if not initiative:
        raise HTTPException(404, "Initiative not found")
    initiative.status = body.status
    await db.commit()
    await db.refresh(initiative)
    return initiative
