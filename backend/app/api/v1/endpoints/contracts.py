from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.contract import Contract, ContractStatus
from app.models.milestone import Milestone, MilestoneStatus
from app.models.project import ProjectStatus
from app.models.review import Review
from app.models.user import User, UserRole
from app.schemas.contract import (
    ContractResponse,
    MilestoneCreate,
    MilestoneResponse,
    MilestoneSubmit,
    ReviewCreate,
    ReviewResponse,
)

router = APIRouter(tags=["Contracts, Milestones & Reviews"])


def _get_authorized_contract(db: Session, contract_id: int, user: User) -> Contract:
    contract = (
        db.query(Contract)
        .options(joinedload(Contract.milestones), joinedload(Contract.project))
        .filter(Contract.id == contract_id)
        .first()
    )
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy hợp đồng")
    if user.id not in (contract.client_id, contract.freelancer_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không thuộc hợp đồng này",
        )
    return contract


@router.get("/contracts", response_model=list[ContractResponse])
def list_my_contracts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Contract)
        .options(joinedload(Contract.milestones))
        .filter(
            (Contract.client_id == current_user.id)
            | (Contract.freelancer_id == current_user.id)
        )
        .order_by(Contract.started_at.desc())
        .all()
    )


@router.get("/contracts/{contract_id}", response_model=ContractResponse)
def get_contract_detail(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_authorized_contract(db, contract_id, current_user)


@router.post(
    "/contracts/{contract_id}/milestones",
    response_model=MilestoneResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_milestone(
    contract_id: int,
    payload: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.CLIENT)),
):
    contract = _get_authorized_contract(db, contract_id, current_user)
    if contract.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Client mới được tạo milestone",
        )
    if contract.status != ContractStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hợp đồng đã kết thúc, không thể thêm milestone",
        )

    current_total = sum(float(m.amount) for m in contract.milestones)
    if current_total + payload.amount > float(contract.agreed_amount) + 1e-6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tổng tiền milestone vượt quá giá trị hợp đồng ({contract.agreed_amount})",
        )

    milestone = Milestone(
        contract_id=contract.id,
        title=payload.title.strip(),
        description=payload.description.strip(),
        amount=payload.amount,
        status=MilestoneStatus.PENDING,
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.post("/milestones/{milestone_id}/submit", response_model=MilestoneResponse)
def submit_milestone(
    milestone_id: int,
    payload: MilestoneSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FREELANCER)),
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy milestone")

    contract = _get_authorized_contract(db, milestone.contract_id, current_user)
    if contract.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Freelancer của hợp đồng mới được nộp milestone",
        )
    if contract.status != ContractStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hợp đồng không còn hoạt động")
    if milestone.status not in (MilestoneStatus.PENDING, MilestoneStatus.SUBMITTED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Milestone đã được duyệt",
        )

    milestone.submission_note = payload.submission_note.strip()
    milestone.status = MilestoneStatus.SUBMITTED
    db.commit()
    db.refresh(milestone)
    return milestone


@router.post("/milestones/{milestone_id}/approve", response_model=MilestoneResponse)
def approve_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.CLIENT)),
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy milestone")

    contract = _get_authorized_contract(db, milestone.contract_id, current_user)
    if contract.client_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Client mới được duyệt milestone",
        )
    if milestone.status != MilestoneStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể duyệt milestone ở trạng thái submitted",
        )

    milestone.status = MilestoneStatus.APPROVED
    db.flush()

    # Nếu hợp đồng có ít nhất 1 milestone và tất cả đều đã approved -> hoàn tất hợp đồng & dự án
    all_milestones = db.query(Milestone).filter(Milestone.contract_id == contract.id).all()
    if all_milestones and all(m.status == MilestoneStatus.APPROVED for m in all_milestones):
        contract.status = ContractStatus.COMPLETED
        if contract.project:
            contract.project.status = ProjectStatus.COMPLETED

    db.commit()
    db.refresh(milestone)
    return milestone


@router.post(
    "/contracts/{contract_id}/reviews",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    contract_id: int,
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = _get_authorized_contract(db, contract_id, current_user)
    if contract.status != ContractStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chỉ có thể đánh giá sau khi hợp đồng hoàn tất (completed)",
        )

    existing = (
        db.query(Review)
        .filter(
            Review.contract_id == contract.id,
            Review.reviewer_id == current_user.id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bạn đã đánh giá cho hợp đồng này rồi",
        )

    reviewee_id = (
        contract.freelancer_id
        if current_user.id == contract.client_id
        else contract.client_id
    )

    review = Review(
        contract_id=contract.id,
        reviewer_id=current_user.id,
        reviewee_id=reviewee_id,
        rating=payload.rating,
        comment=payload.comment.strip(),
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/contracts/{contract_id}/reviews", response_model=list[ReviewResponse])
def list_contract_reviews(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_authorized_contract(db, contract_id, current_user)
    return (
        db.query(Review)
        .filter(Review.contract_id == contract_id)
        .order_by(Review.created_at.desc())
        .all()
    )