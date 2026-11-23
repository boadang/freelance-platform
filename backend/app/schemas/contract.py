from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.models.contract import ContractStatus
from app.models.milestone import MilestoneStatus


class MilestoneCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(default="")
    amount: float = Field(gt=0)


class MilestoneSubmit(BaseModel):
    submission_note: str = Field(min_length=3)


class MilestoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    contract_id: int
    title: str
    description: str
    amount: float
    submission_note: str
    status: MilestoneStatus
    created_at: datetime


class ContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    proposal_id: int
    client_id: int
    freelancer_id: int
    agreed_amount: float
    status: ContractStatus
    started_at: datetime
    milestones: list[MilestoneResponse] = []


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=5)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    contract_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: str
    created_at: datetime