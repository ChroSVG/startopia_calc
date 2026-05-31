from sqlmodel.ext.asyncio.session import AsyncSession
from src.activity_log.service import ActivityLogService
from .repository import ItemRepository, ItemLinkRepository


class ItemService:
    def __init__(self, repository: ItemRepository, log_service: ActivityLogService):
        self.repository = repository
        self.log_service = log_service

    async def get_all_items(self, session: AsyncSession, skip: int = 0, limit: int = 100, search: str | None = None):
        return await self.repository.get_all_with_count(session, skip, limit, search)

    async def create_item(self, item_data, user_uid: str, session: AsyncSession):
        item_data_dict = item_data.model_dump()
        item_data_dict["created_by_uid"] = user_uid
        item = await self.repository.create(session, item_data_dict)
        await self.log_service.log(session, user_uid, "item.create",
            f"Created item: {item.name}", "Item", str(item.uid))
        return item

    async def get_item(self, item_uid: str, session: AsyncSession):
        return await self.repository.get_by_uid(session, item_uid)

    async def update_item(self, item_uid: str, update_data, session: AsyncSession):
        item = await self.get_item(item_uid, session)
        if not item:
            return None
        old_name = item.name
        updated = await self.repository.update(session, item, update_data.model_dump(exclude_unset=True))
        await self.log_service.log(session, str(updated.created_by_uid) if updated.created_by_uid else "system",
            "item.update", f"Updated item: {old_name}", "Item", str(item_uid))
        return updated

    async def delete_item(self, item_uid: str, session: AsyncSession):
        item = await self.get_item(item_uid, session)
        if not item:
            return None
        name = item.name
        await self.repository.delete(session, item)
        await self.log_service.log(session, str(item.created_by_uid) if item.created_by_uid else "system",
            "item.delete", f"Deleted item: {name}", "Item", str(item_uid))
        return item


class ItemLinkService:
    def __init__(self, repository: ItemLinkRepository, log_service: ActivityLogService):
        self.repository = repository
        self.log_service = log_service

    async def create_link(self, link_data, user_uid: str, session: AsyncSession):
        link_data_dict = link_data.model_dump()
        link = await self.repository.create(session, link_data_dict)
        await self.log_service.log(session, user_uid, "item.link.create",
            f"Linked items: {link.source_uid} -> {link.target_uid}",
            "ItemLink", str(link.uid))
        return link

    async def delete_link(self, link_uid: str, user_uid: str, session: AsyncSession):
        link = await self.repository.get_by_uid(session, link_uid)
        if not link:
            return None
        await self.repository.delete(session, link)
        await self.log_service.log(session, user_uid, "item.link.delete",
            f"Unlinked items: {link.source_uid} -> {link.target_uid}",
            "ItemLink", str(link_uid))
        return link
