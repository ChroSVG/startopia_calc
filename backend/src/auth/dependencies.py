from typing import List
from fastapi import Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.main import get_session
from src.db.models import User
from src.errors import InsufficientPermission

from src.users.service import UserService
from src.users.dependencies import get_user_service

from .service import AuthService
from .bearers import AccessTokenBearer

async def get_auth_service(user_service: UserService = Depends(get_user_service)):
    return AuthService(user_service)

access_token_bearer = AccessTokenBearer()

async def get_current_user(
    token_details: dict = Depends(access_token_bearer),
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
) -> User:
    user_email = token_details["user"]["email"]
    user = await user_service.get_user_by_email(user_email, session)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive"
        )
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]) -> None:
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> bool:
        # if not current_user.is_verified:
        #     raise AccountNotVerified()
        
        if current_user.role in self.allowed_roles:
            return True
        raise InsufficientPermission()

async def get_current_superuser(
    current_user = Depends(get_current_active_user),
):
    # CEK SUPERUSER: Hanya boleh lewat jika is_superuser = True
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Akses ditolak. Membutuhkan hak akses Superuser"
        )
    return current_user
