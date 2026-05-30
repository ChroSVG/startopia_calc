from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import RoleChecker, get_current_user
from src.db.main import get_session
from src.db.models import User

from .schemas import ReviewCreateModel
from .service import ReviewService
from .dependencies import get_review_service
from src.books.service import BookService
from src.books.dependencies import get_book_service
from src.users.service import UserService
from src.users.dependencies import get_user_service


review_router = APIRouter()
admin_role_checker = Depends(RoleChecker(["admin"]))
user_role_checker = Depends(RoleChecker(["user", "admin"]))


@review_router.get("/", dependencies=[admin_role_checker], operation_id="readReviews")
async def get_all_reviews(
    session: AsyncSession = Depends(get_session),
    review_service: ReviewService = Depends(get_review_service),
):
    books = await review_service.get_all_reviews(session)

    return books


@review_router.get("/{review_uid}", dependencies=[user_role_checker], operation_id="readReview")
async def get_review(
    review_uid: str,
    session: AsyncSession = Depends(get_session),
    review_service: ReviewService = Depends(get_review_service),
):
    book = await review_service.get_review(review_uid, session)

    if not book:
        raise


@review_router.post("/book/{book_uid}", dependencies=[user_role_checker], operation_id="createReview")
async def add_review_to_books(
    book_uid: str,
    review_data: ReviewCreateModel,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    review_service: ReviewService = Depends(get_review_service),
    book_service: BookService = Depends(get_book_service),
    user_service: UserService = Depends(get_user_service),
):
    new_review = await review_service.add_review_to_book(
        user_email=current_user.email,
        review_data=review_data,
        book_uid=book_uid,
        session=session,
        book_service=book_service,
        user_service=user_service,
    )

    return new_review


@review_router.delete(
    "/{review_uid}",
    dependencies=[user_role_checker],
    status_code=status.HTTP_204_NO_CONTENT,
    operation_id="deleteReview",
)
async def delete_review(
    review_uid: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    review_service: ReviewService = Depends(get_review_service),
    user_service: UserService = Depends(get_user_service),
):
    await review_service.delete_review_to_from_book(
        review_uid=review_uid,
        user_email=current_user.email,
        session=session,
        user_service=user_service,
    )

    return None
