from typing import List, Tuple
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import InventoryItem
from src.db.base_repository import BaseRepository


class InventoryRepository(BaseRepository[InventoryItem]):
    def __init__(self):
        super().__init__(InventoryItem)

    async def get_user_inventory(
        self, session: AsyncSession, user_uid: str, skip: int = 0, limit: int = 100
    ) -> Tuple[List[InventoryItem], int]:
        count_statement = (
            select(func.count()).select_from(InventoryItem)
            .where(InventoryItem.user_uid == user_uid)
        )
        count_result = await session.exec(count_statement)
        total_count = count_result.one() or 0

        statement = (
            select(InventoryItem)
            .where(InventoryItem.user_uid == user_uid)
            .offset(skip).limit(limit)
        )
        result = await session.exec(statement)
        items = result.all()

        return items, total_count
