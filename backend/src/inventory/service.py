from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.activity_log.service import ActivityLogService
from src.db.models import Item
from .repository import InventoryRepository


class InventoryService:
    def __init__(self, repository: InventoryRepository, log_service: ActivityLogService):
        self.repository = repository
        self.log_service = log_service

    async def get_user_inventory(self, user_uid: str, session: AsyncSession, skip: int = 0, limit: int = 100):
        return await self.repository.get_user_inventory(session, user_uid, skip, limit)

    async def add_item(self, inventory_data, user_uid: str, session: AsyncSession):
        data_dict = inventory_data.model_dump()
        item_uid = data_dict["item_uid"]
        item_exists = await session.exec(select(Item).where(Item.uid == item_uid))
        if not item_exists.first():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item with uid {item_uid} not found",
            )
        data_dict["user_uid"] = user_uid
        item = await self.repository.create(session, data_dict)
        await self.log_service.log(session, user_uid, "inventory.add",
            f"Added item {item_uid} to inventory", "InventoryItem", str(item.uid))
        return item

    async def update_item(self, item_uid: str, user_uid: str, update_data, session: AsyncSession):
        item = await self.repository.get_by_uid(session, item_uid)
        if not item or str(item.user_uid) != user_uid:
            return None
        updated = await self.repository.update(session, item, update_data.model_dump(exclude_unset=True))
        await self.log_service.log(session, user_uid, "inventory.update",
            "Updated inventory item quantity", "InventoryItem", str(item_uid))
        return updated

    async def delete_item(self, item_uid: str, user_uid: str, session: AsyncSession):
        item = await self.repository.get_by_uid(session, item_uid)
        if not item or str(item.user_uid) != user_uid:
            return None
        await self.repository.delete(session, item)
        await self.log_service.log(session, user_uid, "inventory.remove",
            "Removed item from inventory", "InventoryItem", str(item_uid))
        return item
