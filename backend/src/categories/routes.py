from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import AccessTokenBearer, RoleChecker
from src.db.main import get_session
from .service import CategoryService
from .dependencies import get_category_service
from .schemas import (
    CategoryModel,
    CategoryCreateModel,
    CategoryUpdateModel,
    CategoriesPublicModel,
)

category_router = APIRouter()
access_token_bearer = AccessTokenBearer()
role_checker = Depends(RoleChecker(["admin", "user"]))


@category_router.get(
    "/",
    response_model=CategoriesPublicModel,
    dependencies=[role_checker],
    operation_id="readCategories",
)
async def get_all_categories(
    skip: int = 0,
    limit: int = 100,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(get_category_service),
    token_details: dict = Depends(access_token_bearer),
):
    user_details = token_details.get("user", {})
    if user_details.get("role") == "admin":
        categories = await category_service.get_all_categories(session)
        count = len(categories)
    else:
        user_uid = user_details.get("user_uid")
        categories, count = await category_service.get_user_categories(
            user_uid, session, skip, limit
        )

    return {"data": categories, "count": count}


@category_router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=CategoryModel,
    dependencies=[role_checker],
    operation_id="createCategory",
)
async def create_category(
    category_data: CategoryCreateModel,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(get_category_service),
    token_details: dict = Depends(access_token_bearer),
):
    user_uid = token_details["user"]["user_uid"]
    new_category = await category_service.create_category(
        category_data, user_uid, session
    )
    return new_category


@category_router.get(
    "/{category_uid}",
    response_model=CategoryModel,
    dependencies=[role_checker],
    operation_id="readCategory",
)
async def get_category(
    category_uid: str,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(get_category_service),
    token_details: dict = Depends(access_token_bearer),
):
    category = await category_service.get_category(category_uid, session)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    user_details = token_details.get("user", {})
    if user_details.get("role") != "admin" and str(category.user_uid) != user_details.get(
        "user_uid"
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return category


@category_router.patch(
    "/{category_uid}",
    response_model=CategoryModel,
    dependencies=[role_checker],
    operation_id="updateCategory",
)
async def update_category(
    category_uid: str,
    update_data: CategoryUpdateModel,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(get_category_service),
    token_details: dict = Depends(access_token_bearer),
):
    category = await category_service.get_category(category_uid, session)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    user_details = token_details.get("user", {})
    if user_details.get("role") != "admin" and str(category.user_uid) != user_details.get(
        "user_uid"
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    updated = await category_service.update_category(
        category_uid, update_data, session
    )
    return updated


@category_router.delete(
    "/{category_uid}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[role_checker],
    operation_id="deleteCategory",
)
async def delete_category(
    category_uid: str,
    session: AsyncSession = Depends(get_session),
    category_service: CategoryService = Depends(get_category_service),
    token_details: dict = Depends(access_token_bearer),
):
    category = await category_service.get_category(category_uid, session)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    user_details = token_details.get("user", {})
    if user_details.get("role") != "admin" and str(category.user_uid) != user_details.get(
        "user_uid"
    ):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await category_service.delete_category(category_uid, session)
    return None
