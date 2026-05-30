from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import get_current_superuser
from src.db.main import get_session
from src.db.models import User
from .schemas import ActivityLogsPublicModel
from .service import ActivityLogService
from .dependencies import get_activity_log_service

activity_log_router = APIRouter()


@activity_log_router.get("/", response_model=ActivityLogsPublicModel, operation_id="readActivityLogs")
async def get_activity_logs(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
    log_service: ActivityLogService = Depends(get_activity_log_service),
    _: User = Depends(get_current_superuser),
):
    logs, count = await log_service.get_logs(session, skip, limit)
    return {"data": logs, "count": count}
