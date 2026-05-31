import uuid
from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class ItemLink(SQLModel, table=True):
    __tablename__ = "item_links"
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    source_uid: uuid.UUID = Field(foreign_key="items.uid")
    target_uid: uuid.UUID = Field(foreign_key="items.uid")

    source: "Item" = Relationship(
        back_populates="outgoing_links",
        sa_relationship_kwargs={"foreign_keys": "ItemLink.source_uid", "lazy": "selectin"},
    )
    target: "Item" = Relationship(
        back_populates="incoming_links",
        sa_relationship_kwargs={"foreign_keys": "ItemLink.target_uid", "lazy": "selectin"},
    )


class Item(SQLModel, table=True):
    __tablename__ = "items"
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True)
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
    created_by_uid: Optional[uuid.UUID] = Field(default=None, foreign_key="users.uid")
    created_at: datetime = Field(default_factory=datetime.now)
    update_at: datetime = Field(default_factory=datetime.now, sa_column_kwargs={"onupdate": datetime.now})

    created_by: Optional["User"] = Relationship(back_populates="created_items")
    outgoing_links: List["ItemLink"] = Relationship(
        back_populates="source",
        sa_relationship_kwargs={"foreign_keys": "ItemLink.source_uid", "lazy": "selectin"},
    )
    incoming_links: List["ItemLink"] = Relationship(
        back_populates="target",
        sa_relationship_kwargs={"foreign_keys": "ItemLink.target_uid", "lazy": "selectin"},
    )

    def __repr__(self):
        return f"<Item {self.name}>"
