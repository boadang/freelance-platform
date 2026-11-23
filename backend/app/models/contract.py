import enum
from datetime import datetime, timezone
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ContractStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    proposal_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("proposals.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    freelancer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    agreed_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[ContractStatus] = mapped_column(
        Enum(ContractStatus, name="contract_status"),
        default=ContractStatus.ACTIVE,
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    project = relationship("Project", backref="contract")
    proposal = relationship("Proposal", backref="contract")
    client = relationship("User", foreign_keys=[client_id])
    freelancer = relationship("User", foreign_keys=[freelancer_id])