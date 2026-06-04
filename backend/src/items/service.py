from sqlmodel.ext.asyncio.session import AsyncSession
from src.activity_log.service import ActivityLogService
from .repository import ItemRepository, ItemLinkRepository


class ItemService:
    def __init__(self, repository: ItemRepository, link_repository: ItemLinkRepository, log_service: ActivityLogService):
        self.repository = repository
        self.link_repository = link_repository
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

    async def _build_ingredient_tree(
        self, item_uid: str, session: AsyncSession, path: set[str]
    ) -> dict | None:
        uid_str = str(item_uid)
        if uid_str in path:
            return None

        item = await self.repository.get_by_uid(session, item_uid)
        if not item:
            return None

        child_path = path | {uid_str}
        links = await self.link_repository.get_by_target_uid(session, item_uid)
        children: list[dict] = []
        for link in links:
            child = await self._build_ingredient_tree(
                link.source_uid, session, child_path
            )
            if child:
                children.append(child)

        children.sort(
            key=lambda c: int(c["item"].rarity or "0") if c["item"].rarity else 0,
            reverse=True,
        )

        return {
            "item": item,
            "ingredients": children,
        }

    async def get_ingredients_tree(self, item_uid: str, session: AsyncSession) -> dict:
        item = await self.repository.get_by_uid(session, item_uid)
        root_path: set[str] = set()
        children: list[dict] = []
        links = await self.link_repository.get_by_target_uid(session, item_uid)
        for link in links:
            child = await self._build_ingredient_tree(
                link.source_uid, session, root_path
            )
            if child:
                children.append(child)

        children.sort(
            key=lambda c: int(c["item"].rarity or "0") if c["item"].rarity else 0,
            reverse=True,
        )

        return {
            "root": {
                "item": item,
                "ingredients": children,
            }
        }


    async def get_possibilities(self, item_uid: str, session: AsyncSession) -> list:
        visited_uids: set[str] = set()
        queue: list[str] = [item_uid]

        while queue:
            current_uid = queue.pop(0)
            links = await self.link_repository.get_by_source_uid(session, current_uid)
            for link in links:
                target_uid_str = str(link.target_uid)
                if target_uid_str not in visited_uids and target_uid_str != item_uid:
                    visited_uids.add(target_uid_str)
                    queue.append(target_uid_str)

        if not visited_uids:
            return []

        items = []
        for uid in visited_uids:
            item = await self.repository.get_by_uid(session, uid)
            if item:
                items.append(item)
        return items


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
