from src.db.main import get_session
from src.auth.dependencies import (
    AccessTokenBearer, 
    RefreshTokenBearer, 
    get_auth_service,
    get_current_user
)
from src.users.dependencies import get_user_service
from src.books.dependencies import get_book_service
from src.items.dependencies import get_item_service

# Import the specific instances used in routes for overriding
from src.books.routes import access_token_bearer as books_bearer, role_checker as books_checker
from src.items.routes import access_token_bearer as items_bearer, role_checker as items_checker
from src.users.routes import access_token_bearer as users_bearer, role_checker as users_checker

from src.db.models import Book, User
from src import app
from fastapi.testclient import TestClient
from datetime import datetime, date
from unittest.mock import Mock, AsyncMock
import pytest
import uuid
from unittest.mock import Mock, AsyncMock, patch

# Mock mail before any tests run
patch("src.mail.mail.send_message", new_callable=AsyncMock).start()

# Mocking
mock_session = AsyncMock()
mock_user_service = AsyncMock()
mock_auth_service = AsyncMock()
mock_book_service = AsyncMock()
mock_item_service = AsyncMock()

# Mock User untuk get_current_user
mock_user = User(
    uid=uuid.uuid4(),
    username="testuser",
    email="test@example.com",
    first_name="Test",
    last_name="User",
    role="admin",
    is_verified=True,
    password_hash="hash",
    created_at=datetime.now(),
    update_at=datetime.now()
)

def get_mock_session():
    yield mock_session

def get_mock_user_service():
    return mock_user_service

def get_mock_auth_service():
    return mock_auth_service

def get_mock_book_service():
    return mock_book_service

def get_mock_item_service():
    return mock_item_service

async def get_mock_current_user():
    return mock_user

# Dependency Overrides
app.dependency_overrides[get_session] = get_mock_session
app.dependency_overrides[get_user_service] = get_mock_user_service
app.dependency_overrides[get_auth_service] = get_mock_auth_service
app.dependency_overrides[get_book_service] = get_mock_book_service
app.dependency_overrides[get_item_service] = get_mock_item_service
app.dependency_overrides[get_current_user] = get_mock_current_user

# Bypass security instances in routes
token_mock = lambda: {"user": {"user_uid": str(mock_user.uid), "email": mock_user.email, "role": mock_user.role}}
role_mock = lambda: True

app.dependency_overrides[books_bearer] = token_mock
app.dependency_overrides[books_checker] = role_mock
app.dependency_overrides[items_bearer] = token_mock
app.dependency_overrides[items_checker] = role_mock
app.dependency_overrides[users_bearer] = token_mock
app.dependency_overrides[users_checker] = role_mock

@pytest.fixture
def fake_session():
    return mock_session

@pytest.fixture
def fake_user_service():
    return mock_user_service

@pytest.fixture
def fake_auth_service():
    return mock_auth_service

@pytest.fixture
def fake_book_service():
    return mock_book_service

@pytest.fixture
def fake_item_service():
    return mock_item_service

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def test_book():
    return Book(
        uid=uuid.uuid4(),
        user_uid=uuid.uuid4(),
        title="sample title",
        author="sample author",
        publisher="sample publisher",
        description="sample description",
        page_count=200,
        language="English",
        published_date=date(2024, 1, 1),
        created_at=datetime.now(),
        update_at=datetime.now()
    )