from typing import List, Tuple

from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.base_repository import BaseRepository
from .models import Mass, MassItem


class MassRepository(BaseRepository[Mass]):
    def __init__(self):
        super().__init__(Mass)

    async def get_user_masses(
        self, session: AsyncSession, user_uid: str, skip: int = 0, limit: int = 100
    ) -> Tuple[List[Mass], int]:
        count_statement = (
            select(func.count()).select_from(Mass).where(Mass.user_uid == user_uid)
        )
        count_result = await session.exec(count_statement)
        total: int = count_result.one() or 0

        statement = (
            select(Mass)
            .where(Mass.user_uid == user_uid)
            .offset(skip)
            .limit(limit)
        )
        result = await session.exec(statement)
        masses: List[Mass] = list(result.all())

        return masses, total


class MassItemRepository(BaseRepository[MassItem]):
    def __init__(self):
        super().__init__(MassItem)

    async def get_by_mass_uid(self, session: AsyncSession, mass_uid: str) -> List[MassItem]:
        statement = select(MassItem).where(MassItem.mass_uid == mass_uid)
        result = await session.exec(statement)
        return list(result.all())

    async def delete_by_mass_uid(self, session: AsyncSession, mass_uid: str) -> None:
        items = await self.get_by_mass_uid(session, mass_uid)
        for item in items:
            await session.delete(item)
        await session.commit()
