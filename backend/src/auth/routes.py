from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, status, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.main import get_session
from src.db.redis import add_jti_to_blocklist
from src.users.schemas import UserCreate
from src.users.service import UserService
from src.users.dependencies import get_user_service
from .service import AuthService
from .bearers import AccessTokenBearer, RefreshTokenBearer
from .dependencies import get_auth_service
from .schemas import (
    UserLoginModel,
    UserRegisterResponse,
)
from .utils import (
    create_access_token,
    decode_token,
)
from src.config import Config
from src.mail import mail, create_message

auth_router = APIRouter()
login_router = APIRouter()


@auth_router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    response_model=UserRegisterResponse,
    operation_id="registerUser",
)
async def create_user_account(
    user_data: UserCreate,
    bg_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.create_user(user_data, session)

    # Send verification email
    token = create_access_token(
        user_data={"email": user.email}, expiry=timedelta(hours=1)
    )
    link = f"http://{Config.DOMAIN}/api/v1/auth/verify/{token}"
    html_message = (
        f"<h1>Verify your Email</h1><p>Click <a href='{link}'>here</a> to verify.</p>"
    )
    emails = [user.email]
    subject = "Verify Your Email"
    message = create_message(recipients=emails, subject=subject, body=html_message)
    bg_tasks.add_task(mail.send_message, message)
    print(f"VERIFICATION LINK: {link}")

    return {
        "message": "Account Created! Check email for verification",
        "user": user,
    }


@auth_router.get("/verify/{token}")
async def verify_user_account(
    token: str,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(get_user_service),
):
    token_data = decode_token(token)
    if not token_data or not token_data.get("user"):
        return JSONResponse(
            content={"message": "Invalid or expired token"},
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    user_email = token_data.get("user", {}).get("email")
    user = await user_service.get_user_by_email(user_email, session)

    if not user:
        return JSONResponse(
            content={"message": "User not found"}, status_code=status.HTTP_404_NOT_FOUND
        )

    await user_service.update_user(user, {"is_verified": True}, session)
    return JSONResponse(
        content={"message": "Account verified successfully"},
        status_code=status.HTTP_200_OK,
    )


@login_router.post("/", response_model=dict, operation_id="loginAccessToken")
async def login_for_access_token(
    login_data: UserLoginModel,
    session: AsyncSession = Depends(get_session),
    auth_service: AuthService = Depends(get_auth_service),
):
    return await auth_service.login_user(login_data.email, login_data.password, session)


@auth_router.get("/refresh_token")
async def get_new_access_token(token_details: dict = Depends(RefreshTokenBearer())):
    expiry_timestamp = token_details["exp"]

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_access_token(user_data=token_details["user"])
        return JSONResponse(content={"access_token": new_access_token})

    return JSONResponse(
        content={"message": "Invalid or expired token"},
        status_code=status.HTTP_400_BAD_REQUEST,
    )


@auth_router.get("/logout", operation_id="logout")
async def logout_and_blacklist_token(
    token_details: dict = Depends(AccessTokenBearer()),
):
    jti = token_details["jti"]
    await add_jti_to_blocklist(jti)
    return JSONResponse(
        content={"message": "Logged Out Successfully"}, status_code=status.HTTP_200_OK
    )
