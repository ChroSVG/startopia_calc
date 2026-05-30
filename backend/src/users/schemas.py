import uuid
from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field

class User(BaseModel):
    uid: uuid.UUID
    username: str
    first_name: str
    last_name: str

    email: str
    role: str
    is_verified: bool
    is_superuser: bool
    is_active: bool
    password_hash: str = Field(exclude=True)
    created_at: datetime
    update_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None

    username: str | None = None
    email: str
    password: str
    role: str = "user"
    is_superuser: bool = False
    is_active: bool = True

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None

    username: str | None = None
    email: str | None = None
    role: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None
    password: str | None = None

class UserUpdateMe(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    email: str | None = None

class UpdatePassword(BaseModel):
    old_password: str
    new_password: str

class UsersPublicModel(BaseModel):
    data: List[User]
    count: int
