import logging
from fastapi import status
from fastapi.exceptions import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from src.auth.service import UserService
from src.books.service import BookService
from src.db.models import Review
from .repository import ReviewRepository

class ReviewService:
    def __init__(self, repository: ReviewRepository):
        self.repository = repository

    async def add_review_to_book(
        self,
        user_email: str,
        book_uid: str,
        review_data,
        session: AsyncSession,
        book_service: BookService,
        user_service: UserService,
    ):
        try:
            book = await book_service.get_book(book_uid=book_uid, session=session)
            user = await user_service.get_user_by_email(email=user_email, session=session)
            
            if not book:
                raise HTTPException(detail="Book not found", status_code=status.HTTP_404_NOT_FOUND)
            if not user:
                raise HTTPException(detail="User not found", status_code=status.HTTP_404_NOT_FOUND)

            review_data_dict = review_data.model_dump()
            review_data_dict["user"] = user
            review_data_dict["book"] = book
            
            # Using model directly since BaseRepository.create expects a dict for model init
            new_review = Review(**review_data_dict)
            session.add(new_review)
            await session.commit()
            return new_review

        except HTTPException:
            raise
        except Exception as e:
            logging.exception(e)
            raise HTTPException(detail="Something went wrong", status_code=500)

    async def get_review(self, review_uid: str, session: AsyncSession):
        return await self.repository.get_by_uid(session, review_uid)

    async def get_all_reviews(self, session: AsyncSession):
        return await self.repository.get_all_ordered(session)

    async def delete_review_to_from_book(
        self, review_uid: str, user_email: str, session: AsyncSession, user_service: UserService
    ):
        user = await user_service.get_user_by_email(user_email, session)
        review = await self.get_review(review_uid, session)

        if not review or (review.user != user):
            raise HTTPException(detail="Cannot delete this review", status_code=status.HTTP_403_FORBIDDEN)

        await self.repository.delete(session, review)
