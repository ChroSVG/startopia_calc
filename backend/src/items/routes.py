from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import AccessTokenBearer, get_current_superuser
from src.db.main import get_session
from src.db.models import User
from .schemas import (
    ItemModel, ItemCreateModel, ItemUpdateModel, ItemsPublicModel,
    ItemLinkModel, ItemLinkCreateModel,
)
from .service import ItemService, ItemLinkService
from .dependencies import get_item_service, get_item_link_service

item_router = APIRouter()
access_token_bearer = AccessTokenBearer()


@item_router.get("/", response_model=ItemsPublicModel, operation_id="readItems")
async def get_all_items(
    skip: int = 0,
    limit: int = 1000,
    session: AsyncSession = Depends(get_session),
    item_service: ItemService = Depends(get_item_service),
    _: User = Depends(get_current_superuser),
):
    items, count = await item_service.get_all_items(session, skip, limit)
    return {"data": items, "count": count}


@item_router.post("/", status_code=status.HTTP_201_CREATED, response_model=ItemModel, operation_id="createItem")
async def create_item(
    item_data: ItemCreateModel,
    session: AsyncSession = Depends(get_session),
    item_service: ItemService = Depends(get_item_service),
    current_user: User = Depends(get_current_superuser),
):
    new_item = await item_service.create_item(item_data, str(current_user.uid), session)
    return new_item


@item_router.get("/{item_uid}", response_model=ItemModel, operation_id="readItem")
async def get_item(
    item_uid: str,
    session: AsyncSession = Depends(get_session),
    item_service: ItemService = Depends(get_item_service),
    _: User = Depends(get_current_superuser),
):
    item = await item_service.get_item(item_uid, session)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@item_router.patch("/{item_uid}", response_model=ItemModel, operation_id="updateItem")
async def update_item(
    item_uid: str,
    update_data: ItemUpdateModel,
    session: AsyncSession = Depends(get_session),
    item_service: ItemService = Depends(get_item_service),
    current_user: User = Depends(get_current_superuser),
):
    updated_item = await item_service.update_item(item_uid, update_data, session)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item


@item_router.delete("/{item_uid}", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteItem")
async def delete_item(
    item_uid: str,
    session: AsyncSession = Depends(get_session),
    item_service: ItemService = Depends(get_item_service),
    _: User = Depends(get_current_superuser),
):
    deleted = await item_service.delete_item(item_uid, session)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return None


@item_router.post("/links", status_code=status.HTTP_201_CREATED, response_model=ItemLinkModel, operation_id="createItemLink")
async def create_item_link(
    link_data: ItemLinkCreateModel,
    session: AsyncSession = Depends(get_session),
    link_service: ItemLinkService = Depends(get_item_link_service),
    current_user: User = Depends(get_current_superuser),
):
    return await link_service.create_link(link_data, str(current_user.uid), session)


@item_router.delete("/links/{link_uid}", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteItemLink")
async def delete_item_link(
    link_uid: str,
    session: AsyncSession = Depends(get_session),
    link_service: ItemLinkService = Depends(get_item_link_service),
    current_user: User = Depends(get_current_superuser),
):
    deleted = await link_service.delete_link(link_uid, str(current_user.uid), session)
    if not deleted:
        raise HTTPException(status_code=404, detail="Link not found")
    return None
