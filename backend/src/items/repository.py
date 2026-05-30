from typing import List, Tuple
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Item, ItemLink
from src.db.base_repository import BaseRepository


class ItemRepository(BaseRepository[Item]):
    def __init__(self):
        super().__init__(Item)

    async def get_all_with_count(
        self, session: AsyncSession, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Item], int]:
        total_count = await self.get_count(session)
        items = await self.get_all(session, skip, limit)
        return items, total_count


class ItemLinkRepository(BaseRepository[ItemLink]):
    def __init__(self):
        super().__init__(ItemLink)
