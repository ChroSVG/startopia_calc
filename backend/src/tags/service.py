from fastapi import status
from fastapi.exceptions import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from src.books.service import BookService
from src.db.models import Tag
from .repository import TagRepository
from src.errors import BookNotFound, TagNotFound, TagAlreadyExists

class TagService:
    def __init__(self, repository: TagRepository):
        self.repository = repository

    async def get_tags(self, session: AsyncSession):
        return await self.repository.get_all_ordered(session)

    async def add_tags_to_book(
        self, book_uid: str, tag_data, session: AsyncSession, book_service: BookService
    ):
        book = await book_service.get_book(book_uid=book_uid, session=session)

        if not book:
            raise BookNotFound()

        for tag_item in tag_data.tags:
            tag = await self.repository.get_by_name(session, tag_item.name)
            if not tag:
                tag = Tag(name=tag_item.name)

            book.tags.append(tag)
            
        session.add(book)
        await session.commit()
        await session.refresh(book)
        return book

    async def get_tag_by_uid(self, tag_uid: str, session: AsyncSession):
        return await self.repository.get_by_uid(session, tag_uid)

    async def add_tag(self, tag_data, session: AsyncSession):
        tag = await self.repository.get_by_name(session, tag_data.name)

        if tag:
            raise TagAlreadyExists()
            
        return await self.repository.create(session, tag_data.model_dump())

    async def update_tag(self, tag_uid, tag_update_data, session: AsyncSession):
        tag = await self.get_tag_by_uid(tag_uid, session)

        if not tag:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

        return await self.repository.update(session, tag, tag_update_data.model_dump())

    async def delete_tag(self, tag_uid: str, session: AsyncSession):
        tag = await self.get_tag_by_uid(tag_uid, session)

        if not tag:
            raise TagNotFound()

        await self.repository.delete(session, tag)
        return None
