from fastapi import Depends
from src.activity_log.dependencies import get_activity_log_service
from src.activity_log.service import ActivityLogService
from .repository import ItemRepository, ItemLinkRepository
from .service import ItemService, ItemLinkService


async def get_item_repository():
    return ItemRepository()


async def get_item_service(
    repo: ItemRepository = Depends(get_item_repository),
    log_service: ActivityLogService = Depends(get_activity_log_service),
):
    return ItemService(repo, log_service)


async def get_item_link_repository():
    return ItemLinkRepository()


async def get_item_link_service(
    repo: ItemLinkRepository = Depends(get_item_link_repository),
    log_service: ActivityLogService = Depends(get_activity_log_service),
):
    return ItemLinkService(repo, log_service)
