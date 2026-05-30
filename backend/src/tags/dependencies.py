from fastapi import Depends
from .repository import TagRepository
from .service import TagService

async def get_tag_repository():
    return TagRepository()

async def get_tag_service(repo: TagRepository = Depends(get_tag_repository)):
    return TagService(repo)
