from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.contact import Contact
from app.models.user import User
from app.schemas.contact import ContactRead, ContactUpdate
from app.services.auth_config import current_user
from app.services.group_service import is_admin

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactRead])
async def list_contacts(
    group_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    stmt = select(Contact).order_by(Contact.id)
    if group_id is not None:
        stmt = stmt.where(Contact.group_id == group_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.put("/{contact_id}", response_model=ContactRead)
async def update_contact(
    contact_id: int,
    body: ContactUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    contact = result.scalar_one_or_none()
    if not contact:
        raise HTTPException(404, "Contact not found")
    if contact.group_id is not None and not await is_admin(db, contact.group_id, user.id):
        raise HTTPException(403, "Only admins can update contacts")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(contact, key, value)
    await db.commit()
    await db.refresh(contact)
    return contact
