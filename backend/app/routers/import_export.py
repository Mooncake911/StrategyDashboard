from urllib.parse import quote
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.initiative import Initiative
from app.models.contact import Contact
from app.models.user import User
from app.services.excel_service import parse_workbook, generate_workbook
from app.services.auth_config import current_user

router = APIRouter(prefix="/api", tags=["import-export"])


@router.post("/import")
async def import_xlsx(
    file: UploadFile = File(...),
    group_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Only .xlsx files are supported")

    file_bytes = await file.read()
    try:
        initiatives_data, contacts_data = parse_workbook(file_bytes)
    except Exception as e:
        raise HTTPException(400, f"Failed to parse file: {e}")

    if not initiatives_data:
        raise HTTPException(400, "No initiatives found in the file")

    if group_id:
        await db.execute(sa_delete(Initiative).where(Initiative.group_id == group_id))
        await db.execute(sa_delete(Contact).where(Contact.group_id == group_id))
    else:
        await db.execute(sa_delete(Initiative))
        await db.execute(sa_delete(Contact))

    for item in initiatives_data:
        item["group_id"] = group_id
        db.add(Initiative(**item))
    for item in contacts_data:
        item["group_id"] = group_id
        db.add(Contact(**item))

    await db.commit()

    return {
        "imported": len(initiatives_data),
        "contacts": len(contacts_data),
    }


@router.get("/export")
async def export_xlsx(
    group_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    stmt_i = select(Initiative).order_by(Initiative.id)
    stmt_c = select(Contact).order_by(Contact.id)
    if group_id:
        stmt_i = stmt_i.where(Initiative.group_id == group_id)
        stmt_c = stmt_c.where(Contact.group_id == group_id)
    initiatives_result = await db.execute(stmt_i)
    contacts_result = await db.execute(stmt_c)

    initiatives_dict = [
        _row_to_dict(r, ["q", "account", "unit", "lpr", "action", "kpi",
                          "priority", "status", "owner", "potential",
                          "next_date", "comment"])
        for r in initiatives_result.scalars().all()
    ]
    contacts_dict = [
        _row_to_dict(r, ["account", "unit", "name", "email", "phone",
                         "last_date", "topic", "next_step"])
        for r in contacts_result.scalars().all()
    ]

    buf = generate_workbook(initiatives_dict, contacts_dict)

    filename = "Дорожная_карта_Systeme_экспорт.xlsx"
    encoded = quote(filename)
    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded}",
        },
    )


def _row_to_dict(row, fields: list[str]) -> dict:
    return {f: getattr(row, f) for f in fields}
