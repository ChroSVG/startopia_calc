from typing import List, Optional
from sqlmodel import select, desc
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Tag
from src.db.base_repository import BaseRepository

class TagRepository(BaseRepository[Tag]):
    def __init__(self):
        super().__init__(Tag)

    async def get_all_ordered(self, session: AsyncSession) -> List[Tag]:
        statement = select(Tag).order_by(desc(Tag.created_at))
        result = await session.exec(statement)
        return result.all()

    async def get_by_name(self, session: AsyncSession, name: str) -> Optional[Tag]:
        statement = select(Tag).where(Tag.name == name)
        result = await session.exec(statement)
        return result.first()
