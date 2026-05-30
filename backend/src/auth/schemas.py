from pydantic import BaseModel, Field

class UserLoginModel(BaseModel):
    email: str = Field(max_length=40)
    password: str = Field(min_length=6)

class EmailModel(BaseModel):
    email: str

class PasswordResetRequestModel(BaseModel):
    email: str

class PasswordResetConfirmModel(BaseModel):
    new_password: str
    confirm_new_password: str

class UserRegisterResponse(BaseModel):
    message: str
    user: dict