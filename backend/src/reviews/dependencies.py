from fastapi import Depends
from .repository import ReviewRepository
from .service import ReviewService

async def get_review_repository():
    return ReviewRepository()

async def get_review_service(repo: ReviewRepository = Depends(get_review_repository)):
    return ReviewService(repo)
