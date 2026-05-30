import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class InventoryItemModel(BaseModel):
    uid: uuid.UUID
    user_uid: uuid.UUID
    item_uid: uuid.UUID
    quantity: int
    created_at: datetime


class InventoryCreateModel(BaseModel):
    item_uid: uuid.UUID
    quantity: int = 1


class InventoryUpdateModel(BaseModel):
    quantity: Optional[int] = None


class InventoryPublicModel(BaseModel):
    data: List[InventoryItemModel]
    count: int
