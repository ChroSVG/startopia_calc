import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel


class Category(SQLModel, table=True):
    __tablename__ = "categories"
    uid: uuid.UUID = Field(default=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    user_uid: Optional[uuid.UUID] = Field(default=None, foreign_key="users.uid")
    created_at: datetime = Field(default=datetime.now)
    update_at: datetime = Field(default=datetime.now, sa_column_kwargs={"onupdate": datetime.now})
    user: Optional["User"] = Relationship(back_populates="categories")

    def __repr__(self):
        return f"<Category {self.name}>"
