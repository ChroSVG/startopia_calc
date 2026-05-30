from fastapi import Depends

from .repository import CategoryRepository
from .service import CategoryService


async def get_category_repository():
    return CategoryRepository()


async def get_category_service(
    repo: CategoryRepository = Depends(get_category_repository),
):
    return CategoryService(repo)
