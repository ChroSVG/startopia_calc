import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class CategoryModel(BaseModel):
    uid: uuid.UUID
    name: str
    description: Optional[str]
    user_uid: Optional[uuid.UUID]
    created_at: datetime
    update_at: datetime


class CategoryCreateModel(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryUpdateModel(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoriesPublicModel(BaseModel):
    data: List[CategoryModel]
    count: int
