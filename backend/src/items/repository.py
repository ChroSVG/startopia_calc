from typing import List, Tuple, Optional
from sqlmodel import select, func, col
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Item, ItemLink
from src.db.base_repository import BaseRepository


class ItemRepository(BaseRepository[Item]):
    def __init__(self):
        super().__init__(Item)

    async def get_all_with_count(
        self, session: AsyncSession, skip: int = 0, limit: int = 100, search: Optional[str] = None
    ) -> Tuple[List[Item], int]:
        query = select(Item)
        count_query = select(func.count()).select_from(Item)

        if search:
            query = query.where(col(Item.name).ilike(f"%{search}%"))
            count_query = count_query.where(col(Item.name).ilike(f"%{search}%"))

        query = query.offset(skip).limit(limit)

        items_result = await session.exec(query)
        count_result = await session.exec(count_query)

        return list(items_result.all()), (count_result.one() or 0)


class ItemLinkRepository(BaseRepository[ItemLink]):
    def __init__(self):
        super().__init__(ItemLink)

    async def get_by_target_uid(self, session: AsyncSession, target_uid: str) -> List[ItemLink]:
        query = select(ItemLink).where(col(ItemLink.target_uid) == target_uid)
        result = await session.exec(query)
        return list(result.all())
