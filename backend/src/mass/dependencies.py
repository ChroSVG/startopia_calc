from fastapi import Depends

from src.activity_log.dependencies import get_activity_log_service
from src.activity_log.service import ActivityLogService
from .repository import MassItemRepository, MassRepository
from .service import MassService


async def get_mass_repository():
    return MassRepository()


async def get_mass_item_repository():
    return MassItemRepository()


async def get_mass_service(
    mass_repo: MassRepository = Depends(get_mass_repository),
    mass_item_repo: MassItemRepository = Depends(get_mass_item_repository),
    log_service: ActivityLogService = Depends(get_activity_log_service),
):
    return MassService(mass_repo, mass_item_repo, log_service)
