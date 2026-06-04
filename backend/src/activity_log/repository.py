from typing import List, Tuple
from sqlmodel import desc, select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import ActivityLog
from src.db.base_repository import BaseRepository


class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self):
        super().__init__(ActivityLog)

    async def get_all_with_count(
        self, session: AsyncSession, skip: int = 0, limit: int = 100
    ) -> Tuple[List[ActivityLog], int]:
        total_count = await self.get_count(session)
        statement = (
            select(ActivityLog)
            .order_by(desc(ActivityLog.created_at))
            .offset(skip).limit(limit)
        )
        result = await session.exec(statement)
        items = list(result.all())
        return items, total_count
