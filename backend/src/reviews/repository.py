from typing import List
from sqlmodel import select, desc
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Review
from src.db.base_repository import BaseRepository

class ReviewRepository(BaseRepository[Review]):
    def __init__(self):
        super().__init__(Review)

    async def get_all_ordered(self, session: AsyncSession) -> List[Review]:
        statement = select(Review).order_by(desc(Review.created_at))
        result = await session.exec(statement)
        return list(result.all())
