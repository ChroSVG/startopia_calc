import uuid

users_prefix = "/api/v1/users"

def test_get_me(test_client, fake_user_service, fake_session):
    # Mock user return
    mock_user = MockUser({"email": "test@example.com"})
    fake_user_service.get_user_by_email.return_value = mock_user
    
    response = test_client.get(f"{users_prefix}/me")
    
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
    fake_user_service.get_user_by_email.assert_called_once()

def test_get_all_users(test_client, fake_user_service, fake_session):
    fake_user_service.get_all_users.return_value = ([], 0)
    
    response = test_client.get(f"{users_prefix}/")
    
    assert response.status_code == 200
    fake_user_service.get_all_users.assert_called_once()

class MockUser:
    def __init__(self, data):
        self.uid = uuid.uuid4()
        self.email = data.get("email")
        self.username = data.get("username", "testuser")
        self.first_name = data.get("first_name", "Test")
        self.last_name = data.get("last_name", "User")
        self.full_name = "Test User"
        self.role = "admin"
        self.is_verified = True
        self.is_superuser = True
        self.is_active = True
        self.password_hash = "hash"
        from datetime import datetime
        self.created_at = datetime.now()
        self.update_at = datetime.now()
