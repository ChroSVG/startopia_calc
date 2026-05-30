from datetime import timedelta
from fastapi import status
from fastapi.exceptions import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from src.users.service import UserService
from .utils import verify_password, create_access_token
from src.config import Config

class AuthService:
    def __init__(self, user_service: UserService):
        self.user_service = user_service

    async def login_user(self, email, password, session: AsyncSession):
        user = await self.user_service.get_user_by_email(email, session)

        if user:
            password_valid = verify_password(password, user.password_hash)

            if password_valid:
                access_token = create_access_token(
                    user_data={"email": user.email, "user_uid": str(user.uid), "role": user.role}
                )

                refresh_token = create_access_token(
                    user_data={"email": user.email, "user_uid": str(user.uid)},
                    refresh=True,
                    expiry=timedelta(days=Config.REFRESH_TOKEN_EXPIRY),
                )

                return {
                    "message": "Login successful",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": user,
                }

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Email Or Password"
        )
