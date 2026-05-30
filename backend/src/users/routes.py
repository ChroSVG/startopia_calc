
from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from .schemas import User, UserCreate, UserUpdate, UserUpdateMe, UpdatePassword, UsersPublicModel
from .service import UserService
from .dependencies import get_user_service
from src.auth.dependencies import get_current_active_user, RoleChecker
from src.auth.utils import verify_password

users_router = APIRouter()
role_checker = RoleChecker(["admin"])

@users_router.get("/me", response_model=User, operation_id="readUserMe")
async def get_current_user(
    current_user: User = Depends(get_current_active_user),
):
    return current_user

@users_router.patch("/me", response_model=User, operation_id="updateUserMe")
async def update_user_me(
    user_update_data: UserUpdateMe,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    return await user_service.update_user(current_user, user_update_data, session)

@users_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT, operation_id="deleteUserMe")
async def delete_user_me(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    await user_service.delete_user(current_user, session)
    return None

@users_router.patch("/me/password", status_code=status.HTTP_204_NO_CONTENT, operation_id="updatePasswordMe")
async def update_password_me(
    password_data: UpdatePassword,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password")
        
    await user_service.update_password(current_user, password_data.new_password, session)
    return None

@users_router.get("/", response_model=UsersPublicModel, dependencies=[Depends(role_checker)], operation_id="readUsers")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    users, count = await user_service.get_all_users(session, skip, limit)
    return {"data": users, "count": count}

@users_router.post("/", status_code=status.HTTP_201_CREATED, response_model=User, dependencies=[Depends(role_checker)], operation_id="createUser")
async def create_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    user_data.is_active = True
    # Admin created users are verified by default
    user_data_dict = user_data.model_dump()
    user_data_dict['is_verified'] = True
    
    # We need to handle this in service.py or just pass the dict if create_user supports it.
    # Currently create_user takes user_data object.
    
    return await user_service.create_user(user_data, session, is_verified=True)

@users_router.patch("/{user_uid}", response_model=User, dependencies=[Depends(role_checker)], operation_id="updateUser")
async def update_user(
    user_uid: str,
    user_update_data: UserUpdate,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.get_user_by_uid(user_uid, session)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await user_service.update_user(user, user_update_data, session)

@users_router.delete("/{user_uid}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(role_checker)], operation_id="deleteUser")
async def delete_user(
    user_uid: str,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.get_user_by_uid(user_uid, session)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await user_service.delete_user(user, session)
    return None
