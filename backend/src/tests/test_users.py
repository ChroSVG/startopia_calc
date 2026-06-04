import uuid

users_prefix = "/api/v1/users"

class MockUser:
    def __init__(self, data=None):
        if data is None:
            data = {}
        self.uid = uuid.uuid4()
        self.email = data.get("email", "test@example.com")
        self.username = data.get("username", "testuser")
        self.first_name = data.get("first_name", "Test")
        self.last_name = data.get("last_name", "User")
        self.role = data.get("role", "admin")
        self.is_verified = data.get("is_verified", True)
        self.is_superuser = data.get("is_superuser", True)
        self.is_active = data.get("is_active", True)
        self.password_hash = "hashed"
        from datetime import datetime
        self.created_at = datetime.now()
        self.update_at = datetime.now()

class TestGetMe:
    def test_get_me_success(self, test_client, fake_user_service, fake_session):
        mock_user = MockUser({"email": "test@example.com"})
        fake_user_service.get_user_by_email.return_value = mock_user

        response = test_client.get(f"{users_prefix}/me")

        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"

class TestUpdateMe:
    def test_update_me(self, test_client, fake_user_service, fake_session):
        mock_user = MockUser({"email": "test@example.com"})
        fake_user_service.update_user.return_value = mock_user

        response = test_client.patch(f"{users_prefix}/me", json={"first_name": "Updated"})

        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
        fake_user_service.update_user.assert_called_once()

class TestDeleteMe:
    def test_delete_me(self, test_client, fake_user_service, fake_session):
        response = test_client.delete(f"{users_prefix}/me")

        assert response.status_code == 204
        fake_user_service.delete_user.assert_called_once()

class TestUpdatePassword:
    def test_update_password_success(self, test_client, fake_user_service, fake_session):
        response = test_client.patch(f"{users_prefix}/me/password", json={
            "old_password": "correct", "new_password": "newpass123"
        })

        assert response.status_code == 204
        fake_user_service.update_password.assert_called_once()

class TestGetAllUsers:
    def test_get_all_users_admin(self, test_client, fake_user_service, fake_session):
        fake_user_service.get_all_users.return_value = ([MockUser()], 1)

        response = test_client.get(f"{users_prefix}/")

        assert response.status_code == 200
        assert response.json()["count"] == 1

class TestCreateUser:
    def test_create_user_admin(self, test_client, fake_user_service, fake_session):
        fake_user_service.create_user.side_effect = None
        fake_user_service.create_user.return_value = MockUser({"email": "new@example.com"})

        response = test_client.post(f"{users_prefix}/", json={
            "email": "new@example.com", "password": "password123"
        })

        assert response.status_code == 201

class TestUpdateUser:
    def test_update_user_not_found(self, test_client, fake_user_service, fake_session):
        fake_user_service.get_user_by_uid.return_value = None

        response = test_client.patch(f"{users_prefix}/{uuid.uuid4()}", json={"first_name": "X"})

        assert response.status_code == 404

class TestDeleteUser:
    def test_delete_user_not_found(self, test_client, fake_user_service, fake_session):
        fake_user_service.get_user_by_uid.return_value = None

        response = test_client.delete(f"{users_prefix}/{uuid.uuid4()}")

        assert response.status_code == 404
