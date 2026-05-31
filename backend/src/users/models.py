import uuid
from datetime import datetime
from typing import List

from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "users"
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    username: str
    email: str
    first_name: str
    last_name: str
    role: str = Field(default="user")
    is_verified: bool = Field(default=False)
    password_hash: str = Field(exclude=True)
    created_at: datetime = Field(default_factory=datetime.now)
    update_at: datetime = Field(default_factory=datetime.now, sa_column_kwargs={"onupdate": datetime.now})
    books: List["Book"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"}
    )
    categories: List["Category"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"}
    )
    reviews: List["Review"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"}
    )
    created_items: List["Item"] = Relationship(
        back_populates="created_by", sa_relationship_kwargs={"lazy": "selectin"}
    )
    inventory: List["InventoryItem"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"lazy": "selectin"}
    )
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

    def __repr__(self):
        return f"<User {self.username}>"
