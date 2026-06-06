import uuid
import logging
from collections import defaultdict
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.activity_log.service import ActivityLogService
from src.db.models import Item, ItemLink
from .repository import ItemRepository, ItemLinkRepository

logger = logging.getLogger(__name__)


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

    async def update_item(self, item_uid: str, update_data, session: AsyncSession, current_user_uid: str | None = None):
        try:
            item = await self.get_item(item_uid, session)
            if not item:
                return None
            old_name = item.name
            updated = await self.repository.update(session, item, update_data.model_dump(exclude_unset=True))
            user_uid = str(updated.created_by_uid) if updated.created_by_uid else (current_user_uid or "00000000-0000-0000-0000-000000000000")
            await self.log_service.log(session, user_uid,
                "item.update", f"Updated item: {old_name}", "Item", str(item_uid))
            return updated
        except Exception as e:
            logger.exception("Failed to update item %s: %s", item_uid, e)
            raise

    async def delete_item(self, item_uid: str, session: AsyncSession, current_user_uid: str | None = None):
        item = await self.get_item(item_uid, session)
        if not item:
            return None
        name = item.name
        user_uid = str(item.created_by_uid) if item.created_by_uid else (current_user_uid or "00000000-0000-0000-0000-000000000000")
        await self.repository.delete(session, item)
        await self.log_service.log(session, user_uid,
            "item.delete", f"Deleted item: {name}", "Item", str(item_uid))
        return item

    async def get_ingredients_tree(self, item_uid: str, session: AsyncSession) -> dict:
        root_item = await self.repository.get_by_uid(session, item_uid)
        if not root_item:
            return {"root": None}

        result = await session.exec(select(ItemLink))
        all_links: list[ItemLink] = list(result.all())

        adjacency: dict[str, list[str]] = defaultdict(list)
        for link in all_links:
            adjacency[str(link.target_uid)].append(str(link.source_uid))

        all_uids: set[str] = set()
        queue = [str(item_uid)]
        while queue:
            uid = queue.pop(0)
            if uid in all_uids:
                continue
            all_uids.add(uid)
            for child_uid in adjacency.get(uid, []):
                if child_uid not in all_uids:
                    queue.append(child_uid)

        uid_list = [uuid.UUID(u) for u in all_uids if u]
        result = await session.exec(
            select(Item).where(Item.uid.in_(uid_list))
        )
        items_map: dict[str, Item] = {str(i.uid): i for i in result.all()}

        def build_node(uid: str, visited: set[str]) -> dict | None:
            if uid in visited:
                return None
            item = items_map.get(uid)
            if not item:
                return None
            child_visited = visited | {uid}
            children: list[dict] = []
            for child_uid in adjacency.get(uid, []):
                child = build_node(child_uid, child_visited)
                if child:
                    children.append(child)
            children.sort(
                key=lambda c: int(c["item"].rarity or "0") if c["item"].rarity else 0,
                reverse=True,
            )
            return {"item": item, "ingredients": children}

        root_node = build_node(str(item_uid), set())
        return {"root": root_node}


    async def get_possibilities(self, item_uid: str, session: AsyncSession) -> list:
        result = await session.exec(select(ItemLink))
        all_links: list[ItemLink] = list(result.all())

        reverse_adjacency: dict[str, list[str]] = defaultdict(list)
        for link in all_links:
            reverse_adjacency[str(link.source_uid)].append(str(link.target_uid))

        visited_uids: set[str] = set()
        queue: list[str] = [str(item_uid)]
        while queue:
            current_uid = queue.pop(0)
            if current_uid in visited_uids:
                continue
            visited_uids.add(current_uid)
            for target_uid in reverse_adjacency.get(current_uid, []):
                if target_uid not in visited_uids and target_uid != str(item_uid):
                    queue.append(target_uid)

        visited_uids.discard(str(item_uid))
        if not visited_uids:
            return []

        uid_list = [uuid.UUID(u) for u in visited_uids if u]
        result = await session.exec(
            select(Item).where(Item.uid.in_(uid_list))
        )
        return list(result.all())


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
