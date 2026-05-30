from fastapi import Request
from fastapi.security import HTTPBearer
from src.db.redis import token_in_blocklist
from .utils import decode_token
from src.errors import (
    InvalidToken,
    AccessTokenRequired,
    RefreshTokenRequired,
)

class TokenBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> dict | None:  # type: ignore
        # Get token từ header Authorization: Bearer <token>
        header_value = request.headers.get("Authorization")
        if not header_value:
            if self.auto_error:
                raise InvalidToken()
            return None

        # Kiểm tra định dạng "Bearer <token>"
        parts = header_value.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            if self.auto_error:
                raise InvalidToken()
            return None

        token = parts[1]
        token_data = decode_token(token)

        if not token_data:
            raise InvalidToken()

        if await token_in_blocklist(token_data["jti"]):
            raise InvalidToken()

        self.verify_token_data(token_data)
        return token_data

    def verify_token_data(self, token_data: dict):
        raise NotImplementedError("Please Override this method in child classes")

class AccessTokenBearer(TokenBearer):
    def verify_token_data(self, token_data: dict) -> None:
        if token_data and token_data.get("refresh"):
            raise AccessTokenRequired()

class RefreshTokenBearer(TokenBearer):
    def verify_token_data(self, token_data: dict) -> None:
        if token_data and not token_data.get("refresh"):
            raise RefreshTokenRequired()
