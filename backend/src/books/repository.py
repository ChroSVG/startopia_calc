from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Book
from src.db.base_repository import BaseRepository

class BookRepository(BaseRepository[Book]):
    def __init__(self):
        super().__init__(Book)

    async def get_user_books(self, session: AsyncSession, user_uid: str) -> List[Book]:
        statement = select(Book).where(Book.user_uid == user_uid)
        result = await session.exec(statement)
        return result.all()
