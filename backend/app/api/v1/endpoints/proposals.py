from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.contract import Contract, ContractStatus
from app.models.project import Project, ProjectStatus
from app.models.proposal import Proposal, ProposalStatus
from app.models.user import User, UserRole
from app.schemas.proposal import ProposalCreate, ProposalResponse

router = APIRouter(tags=["Proposals"])


@router.post(
    "/projects/{project_id}/proposals",
    response_model=ProposalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_proposal(
    project_id: int,
    payload: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FREELANCER)),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy dự án")

    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dự án hiện không mở nhận chào giá",
        )

    existing = (
        db.query(Proposal)
        .filter(
            Proposal.project_id == project_id,
            Proposal.freelancer_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bạn đã gửi proposal cho dự án này rồi",
        )

    proposal = Proposal(
        project_id=project_id,
        freelancer_id=current_user.id,
        proposed_amount=payload.proposed_amount,
        estimated_days=payload.estimated_days,
        cover_letter=payload.cover_letter.strip(),
        status=ProposalStatus.PENDING,
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/projects/{project_id}/proposals", response_model=list[ProposalResponse])
def list_project_proposals(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy dự án")

    if current_user.role == UserRole.CLIENT and project.client_id == current_user.id:
        return (
            db.query(Proposal)
            .filter(Proposal.project_id == project_id)
            .order_by(Proposal.created_at.desc())
            .all()
        )

    if current_user.role == UserRole.FREELANCER:
        return (
            db.query(Proposal)
            .filter(
                Proposal.project_id == project_id,
                Proposal.freelancer_id == current_user.id,
            )
            .all()
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Bạn không có quyền xem danh sách proposal của dự án này",
    )


@router.post("/proposals/{proposal_id}/accept", response_model=ProposalResponse)
def accept_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.CLIENT)),
):
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy proposal")

    project = db.query(Project).filter(Project.id == proposal.project_id).first()
    if not project or project.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ chủ dự án mới được chấp nhận proposal",
        )

    if project.status != ProjectStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dự án đã có freelancer được chọn hoặc đã đóng",
        )

    if proposal.status != ProposalStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể chấp nhận proposal đang ở trạng thái pending",
        )

    proposal.status = ProposalStatus.ACCEPTED
    project.status = ProjectStatus.IN_PROGRESS

    # Từ chối các proposal pending khác của cùng dự án
    db.query(Proposal).filter(
        Proposal.project_id == project.id,
        Proposal.id != proposal.id,
        Proposal.status == ProposalStatus.PENDING,
    ).update({Proposal.status: ProposalStatus.REJECTED}, synchronize_session=False)

    # Tạo hợp đồng khởi đầu cho Bước 4
    contract = Contract(
        project_id=project.id,
        proposal_id=proposal.id,
        client_id=project.client_id,
        freelancer_id=proposal.freelancer_id,
        agreed_amount=proposal.proposed_amount,
        status=ContractStatus.ACTIVE,
    )
    db.add(contract)
    db.commit()
    db.refresh(proposal)
    return proposal