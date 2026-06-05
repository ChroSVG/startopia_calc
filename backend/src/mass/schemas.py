import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, model_validator

from .calculator import format_duration


class MassItemInput(BaseModel):
    item_uid: Optional[uuid.UUID] = None
    item_name: str = "Item"
    tree_rarity: int = 1
    max_blocks: int = 1
    jumlah_pohon: int = 0
    price_buy: int = 0
    price_sell: int = 0
    is_fuel: bool = False
    is_auto_break: bool = False
    source_path: Optional[str] = None


class MassItemResult(MassItemInput):
    uid: uuid.UUID
    blok_yielded: int
    total_smash_efektif: int
    seeds_fallen: int
    seeds_from_smash: int
    total_seeds_return: int
    seed_return_rate: float
    gem_blocks: int
    avg_gems_per_block: float
    harvest_gems: int
    total_gems_didapat: int
    grow_time_seconds: int
    grow_time_readable: str = ""

    @model_validator(mode="after")
    def compute_grow_time_readable(self) -> "MassItemResult":
        if not self.grow_time_readable and self.grow_time_seconds:
            self.grow_time_readable = format_duration(self.grow_time_seconds)
        return self


class MassCreate(BaseModel):
    name: str
    description: Optional[str] = None
    mode: str = "a"
    target_seeds: int = 0
    hit_cost: int = 1
    items: List[MassItemInput] = []


class MassUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[str] = None
    target_seeds: Optional[int] = None
    hit_cost: Optional[int] = None
    items: Optional[List[MassItemInput]] = None


class MassModel(BaseModel):
    uid: uuid.UUID
    name: str
    description: Optional[str] = None
    mode: str
    target_seeds: int = 0
    hit_cost: int = 1
    user_uid: uuid.UUID
    created_at: datetime
    update_at: datetime
    items: List[MassItemResult] = []


class MassesPublic(BaseModel):
    data: List[MassModel]
    count: int
