import uuid

from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.activity_log.service import ActivityLogService
from src.db.models import Item
from .calculator import calculate_item
from .models import Mass, MassItem
from .repository import MassItemRepository, MassRepository


class MassService:
    def __init__(
        self,
        mass_repo: MassRepository,
        mass_item_repo: MassItemRepository,
        log_service: ActivityLogService,
    ):
        self.mass_repo = mass_repo
        self.mass_item_repo = mass_item_repo
        self.log_service = log_service

    async def get_user_masses(
        self, user_uid: str, session: AsyncSession, skip: int = 0, limit: int = 100
    ):
        return await self.mass_repo.get_user_masses(session, user_uid, skip, limit)

    async def get_mass(self, mass_uid: str, session: AsyncSession):
        return await self.mass_repo.get_by_uid(session, mass_uid)

    async def create_mass(self, mass_data, user_uid: str, session: AsyncSession):
        data_dict = mass_data.model_dump(exclude={"items"})
        data_dict["user_uid"] = user_uid
        mass = await self.mass_repo.create(session, data_dict)

        items_input = mass_data.items or []
        for item_in in items_input:
            await self._create_and_calculate_item(mass.uid, item_in, mass.mode, session, mass.hit_cost)

        await self._refresh_mass(mass, session)
        await self.log_service.log(
            session, user_uid, "mass.create",
            f"Created mass: {mass.name} ({len(items_input)} items)",
            "Mass", str(mass.uid),
        )
        return mass

    async def update_mass(self, mass_uid: str, update_data, user_uid: str, session: AsyncSession):
        mass = await self.mass_repo.get_by_uid(session, mass_uid)
        if not mass:
            return None
        if str(mass.user_uid) != user_uid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

        old_name = mass.name
        update_dict = update_data.model_dump(exclude={"items"}, exclude_unset=True)

        if update_dict:
            mass = await self.mass_repo.update(session, mass, update_dict)

        if update_data.items is not None:
            await self.mass_item_repo.delete_by_mass_uid(session, mass_uid)
            new_mode = update_dict.get("mode", mass.mode)
            new_hit_cost = update_dict.get("hit_cost", mass.hit_cost)
            for item_in in update_data.items:
                await self._create_and_calculate_item(mass.uid, item_in, new_mode, session, new_hit_cost)

        await self._refresh_mass(mass, session)
        await self.log_service.log(
            session, user_uid, "mass.update",
            f"Updated mass: {old_name}",
            "Mass", str(mass_uid),
        )
        return mass

    async def delete_mass(self, mass_uid: str, user_uid: str, session: AsyncSession):
        mass = await self.mass_repo.get_by_uid(session, mass_uid)
        if not mass:
            return None
        if str(mass.user_uid) != user_uid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        name = mass.name
        await self.mass_repo.delete(session, mass)
        await self.log_service.log(
            session, user_uid, "mass.delete",
            f"Deleted mass: {name}",
            "Mass", str(mass_uid),
        )
        return mass

    async def calculate_mass(self, mass_uid: str, user_uid: str, session: AsyncSession):
        mass = await self.mass_repo.get_by_uid(session, mass_uid)
        if not mass:
            return None
        if str(mass.user_uid) != user_uid:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

        items = await self.mass_item_repo.get_by_mass_uid(session, mass_uid)
        for item in items:
            result = calculate_item(item.tree_rarity, item.max_blocks, item.jumlah_pohon, mass.mode, item.is_fuel, item.is_auto_break, mass.hit_cost)
            result.pop("grow_time_readable", None)
            result.pop("auto_break_cost", None)
            for key, value in result.items():
                setattr(item, key, value)
            session.add(item)
        await session.commit()

        await self._refresh_mass(mass, session)
        await self.log_service.log(
            session, user_uid, "mass.calculate",
            f"Recalculated mass: {mass.name}",
            "Mass", str(mass_uid),
        )
        return mass

    async def _create_and_calculate_item(
        self, mass_uid: uuid.UUID, item_in, mode: str, session: AsyncSession, hit_cost: int = 1
    ) -> MassItem:
        item_data = item_in.model_dump() if hasattr(item_in, "model_dump") else item_in

        if item_data.get("item_uid"):
            result = await session.exec(
                select(Item).where(Item.uid == item_data["item_uid"])
            )
            item = result.first()
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Item with uid {item_data['item_uid']} not found",
                )
            item_data["item_name"] = item.name
            item_data["tree_rarity"] = int(item.rarity or 1)
            item_data["max_blocks"] = (item.max_drop or 4) // 4

        result = calculate_item(
            item_data.get("tree_rarity", 1),
            item_data.get("max_blocks", 1),
            item_data.get("jumlah_pohon", 0),
            mode,
            item_data.get("is_fuel", False),
            item_data.get("is_auto_break", False),
            hit_cost,
        )

        result.pop("grow_time_readable", None)
        result.pop("auto_break_cost", None)
        mass_item_data = {
            "mass_uid": mass_uid,
            "item_uid": item_data.get("item_uid"),
            "item_name": item_data.get("item_name", "Item"),
            "tree_rarity": item_data.get("tree_rarity", 1),
            "max_blocks": item_data.get("max_blocks", 1),
            "jumlah_pohon": item_data.get("jumlah_pohon", 0),
            "price_buy": item_data.get("price_buy", 0),
            "price_sell": item_data.get("price_sell", 0),
            "is_fuel": item_data.get("is_fuel", False),
            "is_auto_break": item_data.get("is_auto_break", False),
            "source_path": item_data.get("source_path"),
            **result,
        }

        mass_item = MassItem(**mass_item_data)
        session.add(mass_item)
        await session.commit()
        await session.refresh(mass_item)
        return mass_item

    async def _refresh_mass(self, mass: Mass, session: AsyncSession) -> None:
        await session.refresh(mass)
