import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.users.models import User
    from src.items.models import Item


class Mass(SQLModel, table=True):
    __tablename__ = "masses"
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    mode: str = Field(default="a")
    target_seeds: int = 0
    hit_cost: int = 1
    gems_per_wl: int = 100
    fuel_price: float = 0.0
    user_uid: uuid.UUID = Field(foreign_key="users.uid")
    created_at: datetime = Field(default_factory=datetime.now)
    update_at: datetime = Field(default_factory=datetime.now, sa_column_kwargs={"onupdate": datetime.now})

    user: Optional["User"] = Relationship(back_populates="masses")
    items: List["MassItem"] = Relationship(
        back_populates="mass",
        sa_relationship_kwargs={"lazy": "selectin", "cascade": "all, delete-orphan"},
    )

    def __repr__(self):
        return f"<Mass {self.name}>"


class MassItem(SQLModel, table=True):
    __tablename__ = "mass_items"
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    mass_uid: uuid.UUID = Field(foreign_key="masses.uid")
    item_uid: Optional[uuid.UUID] = Field(default=None, foreign_key="items.uid")

    item_name: str = "Item"
    rarity: str = ""
    tree_rarity: int = 1
    max_blocks: int = 1
    tree_count: int = 0
    price_buy: float = 0.0
    price_sell: float = 0.0
    is_fuel: bool = False
    is_auto_break: bool = False
    source_path: Optional[str] = None
    hits_per_block: int = 3

    blocks_produced: int = 0
    total_blocks_broken: int = 0
    seeds_from_tree: int = 0
    seeds_from_break: int = 0
    total_seeds_return: int = 0
    seed_return_rate: float = 0.0
    gem_producing_blocks: int = 0
    avg_gems_per_block: float = 0.0
    gems_from_tree: int = 0
    total_gems: int = 0
    grow_time_seconds: int = 0

    mass: Optional["Mass"] = Relationship(back_populates="items")
    item: Optional["Item"] = Relationship(back_populates="mass_items")

    def __repr__(self):
        return f"<MassItem {self.item_name} ({self.tree_count})>"
