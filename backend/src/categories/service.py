from sqlmodel.ext.asyncio.session import AsyncSession

from .repository import CategoryRepository


class CategoryService:
    def __init__(self, repository: CategoryRepository):
        self.repository = repository

    async def get_all_categories(self, session: AsyncSession):
        return await self.repository.get_all(session)

    async def get_user_categories(
        self, user_uid: str, session: AsyncSession, skip: int = 0, limit: int = 100
    ):
        return await self.repository.get_user_categories(session, user_uid, skip, limit)

    async def create_category(self, category_data, user_uid: str, session: AsyncSession):
        data_dict = category_data.model_dump()
        data_dict["user_uid"] = user_uid
        return await self.repository.create(session, data_dict)

    async def get_category(self, category_uid: str, session: AsyncSession):
        return await self.repository.get_by_uid(session, category_uid)

    async def update_category(
        self, category_uid: str, update_data, session: AsyncSession
    ):
        category = await self.get_category(category_uid, session)
        if not category:
            return None
        return await self.repository.update(session, category, update_data.model_dump())

    async def delete_category(self, category_uid: str, session: AsyncSession):
        category = await self.get_category(category_uid, session)
        if not category:
            return None
        await self.repository.delete(session, category)
        return category
