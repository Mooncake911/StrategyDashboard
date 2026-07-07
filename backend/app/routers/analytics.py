from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.schemas.analytics import KPISummary, QuarterStats, AccountStats, OwnerStats, StatusDistribution
from app.services.analytics_service import (
    get_kpi_summary,
    get_quarter_stats,
    get_account_stats,
    get_owner_stats,
    get_status_distribution,
)
from app.services.auth_config import current_user

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/kpi", response_model=KPISummary)
async def kpi_summary(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await get_kpi_summary(db)


@router.get("/by-quarter", response_model=list[QuarterStats])
async def quarter_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await get_quarter_stats(db)


@router.get("/by-account", response_model=list[AccountStats])
async def account_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await get_account_stats(db)


@router.get("/by-owner", response_model=list[OwnerStats])
async def owner_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await get_owner_stats(db)


@router.get("/status-distribution", response_model=list[StatusDistribution])
async def status_distribution(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(current_user),
):
    return await get_status_distribution(db)
