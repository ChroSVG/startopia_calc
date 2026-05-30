from sqlmodel.ext.asyncio.session import AsyncSession
from src.auth.utils import generate_passwd_hash
from .repository import UserRepository
from src.errors import UserAlreadyExists

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def get_user_by_email(self, email: str, session: AsyncSession):
        return await self.repository.get_by_email(session, email)

    async def get_user_by_uid(self, user_uid: str, session: AsyncSession):
        return await self.repository.get_by_uid(session, user_uid)

    async def user_exists(self, email: str, session: AsyncSession):
        user = await self.get_user_by_email(email, session)
        return True if user else False

    async def create_user(self, user_data, session: AsyncSession, is_verified: bool = False):
        user_data_dict = user_data.model_dump()
        
        # Check if user exists
        if await self.user_exists(user_data_dict['email'], session):
            raise UserAlreadyExists()

        if not user_data_dict.get('username'):
            user_data_dict['username'] = user_data_dict['email'].split('@')[0]

        user_data_dict['is_verified'] = is_verified
        
        # Hash password
        user_data_dict['password_hash'] = generate_passwd_hash(user_data_dict.pop('password'))
        
        return await self.repository.create(session, user_data_dict)

    async def get_all_users(self, session: AsyncSession, skip: int = 0, limit: int = 100):
        users = await self.repository.get_all(session, skip, limit)
        count = await self.repository.get_count(session)
        return users, count

    async def update_user(self, user, user_update_data, session: AsyncSession):
        update_dict = user_update_data.model_dump(exclude_unset=True)
        
        if 'password' in update_dict:
            update_dict['password_hash'] = generate_passwd_hash(update_dict.pop('password'))
            
        return await self.repository.update(session, user, update_dict)

    async def delete_user(self, user, session: AsyncSession):
        return await self.repository.delete(session, user)

    async def update_password(self, user, new_password, session: AsyncSession):
        password_hash = generate_passwd_hash(new_password)
        return await self.repository.update(session, user, {"password_hash": password_hash})
