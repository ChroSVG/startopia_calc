import uuid
from datetime import datetime

auth_prefix = "/api/v1/auth"

class MockUser(dict):
    def __init__(self, data=None):
        if data is None:
            data = {}
        merged = {
            "uid": uuid.uuid4(),
            "email": "test@example.com",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "role": "user",
            "is_verified": True,
            "is_active": True,
            "password_hash": "hashed",
            "is_superuser": False,
            "created_at": datetime.now(),
            "update_at": datetime.now(),
        }
        merged.update(data)
        super().__init__(merged)
        self.__dict__.update(merged)

class TestSignup:
    def test_signup_success(self, test_client, fake_user_service, fake_session):
        mock_user = MockUser({"email": "new@example.com"})
        fake_user_service.create_user.return_value = mock_user

        response = test_client.post(f"{auth_prefix}/signup", json={
            "email": "new@example.com", "password": "password123"
        })

        assert response.status_code == 201
        data = response.json()
        assert data["message"] == "Account Created! Check email for verification"
        assert data["user"]["email"] == "new@example.com"
        fake_user_service.create_user.assert_called_once()

    def test_signup_email_exists(self, test_client, fake_user_service, fake_session):
        from src.errors import UserAlreadyExists
        fake_user_service.create_user.side_effect = UserAlreadyExists()

        response = test_client.post(f"{auth_prefix}/signup", json={
            "email": "exists@example.com", "password": "password123"
        })

        assert response.status_code == 403

class TestLogin:
    def test_login_success(self, test_client, fake_auth_service, fake_session):
        fake_auth_service.login_user.return_value = {
            "message": "Login successful",
            "access_token": "mock_access_token",
            "refresh_token": "mock_refresh_token",
            "user": {"email": "test@example.com"},
        }

        response = test_client.post("/api/v1/login/", json={
            "email": "test@example.com", "password": "password123"
        })

        assert response.status_code == 200
        assert "access_token" in response.json()
        fake_auth_service.login_user.assert_called_once()

    def test_login_invalid_password(self, test_client, fake_auth_service, fake_session):
        from src.errors import InvalidCredentials
        fake_auth_service.login_user.side_effect = InvalidCredentials()

        response = test_client.post("/api/v1/login/", json={
            "email": "test@example.com", "password": "wrongpassword"
        })

        assert response.status_code == 400
