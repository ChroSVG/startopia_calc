import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.items.models import Item
    from src.users.models import User


class InventoryItem(SQLModel, table=True):
    __tablename__ = "inventory_items"
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_uid: uuid.UUID = Field(foreign_key="users.uid")
    item_uid: uuid.UUID = Field(foreign_key="items.uid")
    quantity: int = 1
    created_at: datetime = Field(default_factory=datetime.now)
    user: "User" = Relationship(back_populates="inventory")
    item: "Item" = Relationship()

    def __repr__(self):
        return f"<InventoryItem user={self.user_uid} item={self.item_uid}>"
