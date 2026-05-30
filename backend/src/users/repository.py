from typing import Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import User
from src.db.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, session: AsyncSession, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        result = await session.exec(statement)
        return result.first()

    async def get_by_username(self, session: AsyncSession, username: str) -> Optional[User]:
        statement = select(User).where(User.username == username)
        result = await session.exec(statement)
        return result.first()
