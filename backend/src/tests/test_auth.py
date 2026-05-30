import uuid
from unittest.mock import MagicMock

auth_prefix = "/api/v1/auth"

def test_signup(test_client, fake_user_service, fake_session):
    user_data = {
        "first_name": "Test",
        "last_name": "User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    
    # Mock return
    fake_user_service.user_exists.return_value = False
    fake_user_service.create_user.return_value = MockUser(user_data)
    
    response = test_client.post(f"{auth_prefix}/signup", json=user_data)
    
    assert response.status_code == 201
    fake_user_service.create_user.assert_called_once()

def test_login(test_client, fake_auth_service, fake_session):
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    # Mock return for a successful login
    fake_auth_service.login_user.return_value = {
        "message": "Login successful",
        "access_token": "mock_access_token",
        "refresh_token": "mock_refresh_token",
        "user": {"email": "test@example.com"}
    }
    
    response = test_client.post("/api/v1/login/", json=login_data)
    
    assert response.status_code == 200
    assert "access_token" in response.json()
    fake_auth_service.login_user.assert_called_once()

class MockUser:
    def __init__(self, data):
        self.uid = uuid.uuid4()
        self.email = data.get("email")
        self.username = data.get("username", "testuser")
        self.first_name = data.get("first_name", "Test")
        self.last_name = data.get("last_name", "User")
        self.role = "user"
        self.is_verified = True
