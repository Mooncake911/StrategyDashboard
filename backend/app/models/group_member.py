from datetime import datetime
from sqlalchemy import Integer, DateTime, ForeignKey, UniqueConstraint, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.constants import MemberRole, MemberStatus
from app.models import Base


class GroupMember(Base):
    __tablename__ = "group_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    role: Mapped[MemberRole] = mapped_column(Enum(MemberRole, native_enum=False), default=MemberRole.MEMBER)
    status: Mapped[MemberStatus] = mapped_column(Enum(MemberStatus, native_enum=False), default=MemberStatus.APPROVED)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_group_user"),)
