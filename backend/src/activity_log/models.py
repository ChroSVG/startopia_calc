import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import JSON
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.users.models import User


class ActivityLog(SQLModel, table=True):
    __tablename__ = "activity_logs"
    uid: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_uid: uuid.UUID = Field(foreign_key="users.uid")
    action: str
    reference_type: Optional[str] = None
    reference_uid: Optional[uuid.UUID] = None
    message: str
    data: Optional[dict] = Field(default=None, sa_type=JSON)
    created_at: datetime = Field(default_factory=datetime.now)

    user: "User" = Relationship()

    def __repr__(self):
        return f"<ActivityLog {self.action} by {self.user_uid}>"
