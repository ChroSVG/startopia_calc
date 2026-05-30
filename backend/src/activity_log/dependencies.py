from fastapi import Depends
from .repository import ActivityLogRepository
from .service import ActivityLogService


async def get_activity_log_repository():
    return ActivityLogRepository()


async def get_activity_log_service(repo: ActivityLogRepository = Depends(get_activity_log_repository)):
    return ActivityLogService(repo)
