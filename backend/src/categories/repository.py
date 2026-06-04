from typing import List, Tuple
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.models import Category
from src.db.base_repository import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self):
        super().__init__(Category)

    async def get_user_categories(
        self, session: AsyncSession, user_uid: str, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Category], int]:
        count_statement = (
            select(Category).where(Category.user_uid == user_uid)
        )
        count_result = await session.exec(count_statement)
        total = len(count_result.all())

        statement = (
            select(Category)
            .where(Category.user_uid == user_uid)
            .offset(skip)
            .limit(limit)
        )
        result = await session.exec(statement)
        categories = list(result.all())

        return categories, total
