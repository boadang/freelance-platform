from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=15)
    budget_min: float = Field(gt=0)
    budget_max: float = Field(gt=0)
    skills_required: str = Field(default="", max_length=255)

    @model_validator(mode="after")
    def validate_budget(self):
        if self.budget_max < self.budget_min:
            raise ValueError("Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu")
        return self


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    title: str
    description: str
    budget_min: float
    budget_max: float
    skills_required: str
    status: ProjectStatus
    created_at: datetime