from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import AccessTokenBearer, get_current_active_user
from src.db.main import get_session
from src.db.models import User
from .schemas import (
    InventoryItemModel, InventoryCreateModel, InventoryUpdateModel, InventoryPublicModel,
)
from .service import InventoryService
from .dependencies import get_inventory_service

inventory_router = APIRouter()
access_token_bearer = AccessTokenBearer()


@inventory_router.get("/", response_model=InventoryPublicModel, operation_id="readInventory")
async def get_my_inventory(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
    inventory_service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_active_user),
):
    items, count = await inventory_service.get_user_inventory(str(current_user.uid), session, skip, limit)
    return {"data": items, "count": count}


@inventory_router.post("/", status_code=status.HTTP_201_CREATED, response_model=InventoryItemModel, operation_id="addToInventory")
async def add_to_inventory(
    inventory_data: InventoryCreateModel,
    session: AsyncSession = Depends(get_session),
    inventory_service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_active_user),
):
    return await inventory_service.add_item(inventory_data, str(current_user.uid), session)


@inventory_router.patch("/{item_uid}", response_model=InventoryItemModel, operation_id="updateInventoryItem")
async def update_inventory_item(
    item_uid: str,
    update_data: InventoryUpdateModel,
    session: AsyncSession = Depends(get_session),
    inventory_service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_active_user),
):
    updated = await inventory_service.update_item(item_uid, str(current_user.uid), update_data, session)
    if not updated:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return updated


@inventory_router.delete("/{item_uid}", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteFromInventory")
async def delete_from_inventory(
    item_uid: str,
    session: AsyncSession = Depends(get_session),
    inventory_service: InventoryService = Depends(get_inventory_service),
    current_user: User = Depends(get_current_active_user),
):
    deleted = await inventory_service.delete_item(item_uid, str(current_user.uid), session)
    if not deleted:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return None
