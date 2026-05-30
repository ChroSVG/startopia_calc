import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ActivityLogModel(BaseModel):
    uid: uuid.UUID
    user_uid: uuid.UUID
    action: str
    reference_type: Optional[str] = None
    reference_uid: Optional[uuid.UUID] = None
    message: str
    created_at: datetime


class ActivityLogDetailModel(ActivityLogModel):
    data: Optional[dict] = None


class ActivityLogsPublicModel(BaseModel):
    data: List[ActivityLogDetailModel]
    count: int
