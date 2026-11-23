import enum
from datetime import datetime, timezone
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ProposalStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Proposal(Base):
    __tablename__ = "proposals"
    __table_args__ = (
        UniqueConstraint("project_id", "freelancer_id", name="uq_proposal_project_freelancer"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    freelancer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    proposed_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    estimated_days: Mapped[int] = mapped_column(Integer, nullable=False)
    cover_letter: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ProposalStatus] = mapped_column(
        Enum(ProposalStatus, name="proposal_status"),
        default=ProposalStatus.PENDING,
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    project = relationship("Project", back_populates="proposals")
    freelancer = relationship("User", backref="proposals")