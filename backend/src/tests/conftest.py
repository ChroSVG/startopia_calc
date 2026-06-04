from src.db.main import get_session
from src.auth.dependencies import (
    get_auth_service,
    get_current_user,
    get_current_superuser,
)
from src.users.dependencies import get_user_service
from src.books.dependencies import get_book_service
from src.items.dependencies import get_item_service, get_item_link_service
from src.categories.dependencies import get_category_service
from src.tags.dependencies import get_tag_service
from src.reviews.dependencies import get_review_service
from src.inventory.dependencies import get_inventory_service
from src.activity_log.dependencies import get_activity_log_service
from src.mass.dependencies import get_mass_service

# Import the specific instances used in routes for overriding
from src.books.routes import access_token_bearer as books_bearer, role_checker as books_checker
from src.items.routes import access_token_bearer as items_bearer
from src.users.routes import role_checker as users_checker  # type: ignore[attr-defined]
from src.categories.routes import access_token_bearer as categories_bearer, role_checker as categories_checker
from src.tags.routes import user_role_checker as tags_checker
from src.reviews.routes import admin_role_checker as reviews_admin_checker, user_role_checker as reviews_user_checker

from src.db.models import Book, User
from src import app
from fastapi.testclient import TestClient
from datetime import datetime, date
import pytest
import uuid
from unittest.mock import AsyncMock, patch
from passlib.context import CryptContext

# Mock mail before any tests run
patch("src.mail.mail.send_message", new_callable=AsyncMock).start()

# Create valid bcrypt hash for mock_user
_pwd_ctx = CryptContext(schemes=["bcrypt"])
_TEST_PASSWORD_HASH = _pwd_ctx.hash("correct")

# Mocking
mock_session = AsyncMock()
mock_user_service = AsyncMock()
mock_auth_service = AsyncMock()
mock_book_service = AsyncMock()
mock_item_service = AsyncMock()
mock_item_link_service = AsyncMock()
mock_category_service = AsyncMock()
mock_tag_service = AsyncMock()
mock_review_service = AsyncMock()
mock_inventory_service = AsyncMock()
mock_activity_log_service = AsyncMock()
mock_mass_service = AsyncMock()

# Mock User untuk get_current_user
mock_user = User(
    uid=uuid.uuid4(),
    username="testuser",
    email="test@example.com",
    first_name="Test",
    last_name="User",
    role="admin",
    is_verified=True,
    password_hash=_TEST_PASSWORD_HASH,
    is_superuser=True,
    is_active=True,
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

def get_mock_item_link_service():
    return mock_item_link_service

def get_mock_category_service():
    return mock_category_service

def get_mock_tag_service():
    return mock_tag_service

def get_mock_review_service():
    return mock_review_service

def get_mock_inventory_service():
    return mock_inventory_service

def get_mock_activity_log_service():
    return mock_activity_log_service

def get_mock_mass_service():
    return mock_mass_service

async def get_mock_current_user():
    return mock_user

async def get_mock_current_superuser():
    return mock_user

# Dependency Overrides
app.dependency_overrides[get_session] = get_mock_session
app.dependency_overrides[get_user_service] = get_mock_user_service
app.dependency_overrides[get_auth_service] = get_mock_auth_service
app.dependency_overrides[get_book_service] = get_mock_book_service
app.dependency_overrides[get_item_service] = get_mock_item_service
app.dependency_overrides[get_item_link_service] = get_mock_item_link_service
app.dependency_overrides[get_category_service] = get_mock_category_service
app.dependency_overrides[get_tag_service] = get_mock_tag_service
app.dependency_overrides[get_review_service] = get_mock_review_service
app.dependency_overrides[get_inventory_service] = get_mock_inventory_service
app.dependency_overrides[get_activity_log_service] = get_mock_activity_log_service
app.dependency_overrides[get_mass_service] = get_mock_mass_service
app.dependency_overrides[get_current_user] = get_mock_current_user
app.dependency_overrides[get_current_superuser] = get_mock_current_superuser

# Bypass security instances in routes
def token_mock():
    return {"user": {"user_uid": str(mock_user.uid), "email": mock_user.email, "role": mock_user.role}}

def role_mock():
    return True

app.dependency_overrides[books_bearer] = token_mock
app.dependency_overrides[books_checker] = role_mock
app.dependency_overrides[items_bearer] = token_mock
app.dependency_overrides[users_checker] = role_mock
app.dependency_overrides[categories_bearer] = token_mock
app.dependency_overrides[categories_checker] = role_mock
app.dependency_overrides[tags_checker] = role_mock
app.dependency_overrides[reviews_admin_checker] = role_mock
app.dependency_overrides[reviews_user_checker] = role_mock

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
def fake_item_link_service():
    return mock_item_link_service

@pytest.fixture
def fake_category_service():
    return mock_category_service

@pytest.fixture
def fake_tag_service():
    return mock_tag_service

@pytest.fixture
def fake_review_service():
    return mock_review_service

@pytest.fixture
def fake_inventory_service():
    return mock_inventory_service

@pytest.fixture
def fake_activity_log_service():
    return mock_activity_log_service

@pytest.fixture
def fake_mass_service():
    return mock_mass_service

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