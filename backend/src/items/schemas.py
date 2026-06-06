import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ItemModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uid: uuid.UUID
    name: str
    rarity: Optional[str] = None
    description: Optional[str] = None
    max_drop: Optional[int] = None
    type: Optional[str] = None
    chi: Optional[str] = None
    texture_type: Optional[str] = None
    collision_type: Optional[str] = None
    seed_color: Optional[str] = None
    grow_time: Optional[int] = None
    default_gems_drop: Optional[str] = None
    hits_with_hand: Optional[int] = None
    hits_with_pickaxe: Optional[int] = None
    restore_time_seconds: Optional[int] = None
    scraped: bool = False
    created_by_uid: Optional[uuid.UUID] = None
    created_at: datetime
    update_at: datetime


class ItemCreateModel(BaseModel):
    name: str
    rarity: Optional[str] = None
    description: Optional[str] = None
    max_drop: Optional[int] = None
    type: Optional[str] = None
    chi: Optional[str] = None
    texture_type: Optional[str] = None
    collision_type: Optional[str] = None
    seed_color: Optional[str] = None
    grow_time: Optional[int] = None
    default_gems_drop: Optional[str] = None
    hits_with_hand: Optional[int] = None
    hits_with_pickaxe: Optional[int] = None
    restore_time_seconds: Optional[int] = None
    scraped: bool = False


class ItemUpdateModel(BaseModel):
    name: Optional[str] = None
    rarity: Optional[str] = None
    description: Optional[str] = None
    max_drop: Optional[int] = None
    type: Optional[str] = None
    chi: Optional[str] = None
    texture_type: Optional[str] = None
    collision_type: Optional[str] = None
    seed_color: Optional[str] = None
    grow_time: Optional[int] = None
    default_gems_drop: Optional[str] = None
    hits_with_hand: Optional[int] = None
    hits_with_pickaxe: Optional[int] = None
    restore_time_seconds: Optional[int] = None
    scraped: Optional[bool] = None


class ItemLinkModel(BaseModel):
    uid: uuid.UUID
    source_uid: uuid.UUID
    target_uid: uuid.UUID


class ItemLinkCreateModel(BaseModel):
    source_uid: uuid.UUID
    target_uid: uuid.UUID


class ItemsPublicModel(BaseModel):
    data: List[ItemModel]
    count: int


class IngredientItemModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uid: uuid.UUID
    name: str
    rarity: Optional[str] = None
    max_drop: Optional[int] = None
    hits_with_hand: Optional[int] = None


class IngredientsTreeResponse(BaseModel):
    root_uid: Optional[str] = None
    nodes: dict[str, IngredientItemModel] = {}
    adjacency: dict[str, List[str]] = {}


class PossibilitiesResponse(BaseModel):
    possibilities: List[ItemModel]
