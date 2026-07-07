from datetime import datetime
from sqlalchemy import Integer, String, Text, Float, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.constants import InitiativeStatus, Priority
from app.models import Base


class Initiative(Base):
    __tablename__ = "initiatives"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    group_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("groups.id"), nullable=True
    )
    q: Mapped[str] = mapped_column(String(2), default="Q1")
    account: Mapped[str] = mapped_column(String(255), default="")
    unit: Mapped[str] = mapped_column(Text, default="")
    lpr: Mapped[str] = mapped_column(Text, default="")
    action: Mapped[str] = mapped_column(Text, default="")
    kpi: Mapped[str] = mapped_column(Text, default="")
    priority: Mapped[Priority] = mapped_column(Enum(Priority, native_enum=False), default=Priority.HIGH)
    status: Mapped[InitiativeStatus] = mapped_column(Enum(InitiativeStatus, native_enum=False), default=InitiativeStatus.PENDING)
    owner: Mapped[str] = mapped_column(String(255), default="")
    potential: Mapped[float] = mapped_column(Float, default=0.0)
    next_date: Mapped[str] = mapped_column(String(50), default="")
    comment: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=True
    )
