from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.contact import Contact
from app.models.user import User
from app.schemas.contact import ContactRead, ContactUpdate
from app.services.auth_config import current_user
from app.services.dependencies import get_object_or_404
from app.services.group_service import is_admin, get_membership

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactRead])
async def list_contacts(
        group_id: int | None = Query(None),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
        db: AsyncSession = Depends(get_db),
        user: User = Depends(current_user),
):
    stmt = select(Contact).order_by(Contact.id).offset(skip).limit(limit)
    if group_id is not None:
        member = await get_membership(db, group_id, user.id)
        if not member or member.status != "approved":
            raise HTTPException(403, "You are not a member of this group")
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
    contact = await get_object_or_404(db, Contact, contact_id, "Contact not found")
    if contact.group_id is not None and not await is_admin(db, contact.group_id, user.id):
        raise HTTPException(403, "Only admins can update contacts")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(contact, key, value)
    await db.commit()
    await db.refresh(contact)
    return contact
