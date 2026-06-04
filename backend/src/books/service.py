from sqlmodel.ext.asyncio.session import AsyncSession
from .repository import BookRepository

class BookService:
    def __init__(self, repository: BookRepository):
        self.repository = repository

    async def get_all_books(self, session: AsyncSession):
        return await self.repository.get_all(session)

    async def get_user_books(self, user_uid: str, session: AsyncSession):
        return await self.repository.get_user_books(session, user_uid)

    async def create_book(self, book_data, user_uid: str, session: AsyncSession):
        book_data_dict = book_data.model_dump()
        book_data_dict["user_uid"] = user_uid
        return await self.repository.create(session, book_data_dict)

    async def get_book(self, book_uid: str, session: AsyncSession):
        return await self.repository.get_by_uid(session, book_uid)

    async def update_book(self, book_uid: str, update_data, session: AsyncSession):
        book = await self.get_book(book_uid, session)
        if not book:
            return None
        return await self.repository.update(session, book, update_data.model_dump())

    async def delete_book(self, book_uid: str, session: AsyncSession):
        book = await self.get_book(book_uid, session)
        if not book:
            return None
        await self.repository.delete(session, book)
        return book
