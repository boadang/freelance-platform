from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.proposal import ProposalStatus


class ProposalCreate(BaseModel):
    proposed_amount: float = Field(gt=0)
    estimated_days: int = Field(gt=0, le=365)
    cover_letter: str = Field(min_length=10)


class ProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    freelancer_id: int
    proposed_amount: float
    estimated_days: int
    cover_letter: str
    status: ProposalStatus
    created_at: datetime