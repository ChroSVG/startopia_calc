from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from .repository import ActivityLogRepository


class ActivityLogService:
    def __init__(self, repository: ActivityLogRepository):
        self.repository = repository

    async def log(
        self,
        session: AsyncSession,
        user_uid: str,
        action: str,
        message: str,
        reference_type: Optional[str] = None,
        reference_uid: Optional[str] = None,
        data: Optional[dict] = None,
    ):
        log_entry = {
            "user_uid": user_uid,
            "action": action,
            "message": message,
            "reference_type": reference_type,
            "reference_uid": reference_uid,
            "data": data,
        }
        return await self.repository.create(session, log_entry)

    async def get_logs(self, session: AsyncSession, skip: int = 0, limit: int = 100):
        return await self.repository.get_all_with_count(session, skip, limit)
