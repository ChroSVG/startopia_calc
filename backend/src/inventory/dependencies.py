from fastapi import Depends
from src.activity_log.dependencies import get_activity_log_service
from src.activity_log.service import ActivityLogService
from .repository import InventoryRepository
from .service import InventoryService


async def get_inventory_repository():
    return InventoryRepository()


async def get_inventory_service(
    repo: InventoryRepository = Depends(get_inventory_repository),
    log_service: ActivityLogService = Depends(get_activity_log_service),
):
    return InventoryService(repo, log_service)
