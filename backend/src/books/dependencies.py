from fastapi import Depends
from .repository import BookRepository
from .service import BookService

async def get_book_repository():
    return BookRepository()

async def get_book_service(repo: BookRepository = Depends(get_book_repository)):
    return BookService(repo)
