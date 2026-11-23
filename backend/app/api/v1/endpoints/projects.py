from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.project import Project, ProjectStatus
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.CLIENT)),
):
    project = Project(
        client_id=current_user.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        budget_min=payload.budget_min,
        budget_max=payload.budget_max,
        skills_required=payload.skills_required.strip(),
        status=ProjectStatus.OPEN,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    q: str | None = Query(default=None),
    skill: str | None = Query(default=None),
    status_filter: ProjectStatus | None = Query(default=None, alias="status"),
    mine: bool = Query(default=False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Project)

    if mine:
        query = query.filter(Project.client_id == current_user.id)
    elif status_filter:
        query = query.filter(Project.status == status_filter)
    elif current_user.role == UserRole.FREELANCER:
        query = query.filter(Project.status == ProjectStatus.OPEN)

    if q and q.strip():
        keyword = f"%{q.strip()}%"
        query = query.filter(
            (Project.title.ilike(keyword)) | (Project.description.ilike(keyword))
        )

    if skill and skill.strip():
        query = query.filter(Project.skills_required.ilike(f"%{skill.strip()}%"))

    return query.order_by(Project.created_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project_detail(
    project_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy dự án")
    return project