import uuid
from datetime import datetime

categories_prefix = "/api/v1/categories/"

def _make_category(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "name": "Test Category",
        "description": "A test category",
        "user_uid": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        "update_at": datetime.now().isoformat(),
    }
    if overrides:
        data.update(overrides)
    return data

class TestGetAllCategories:
    def test_get_all_categories(self, test_client, fake_category_service, fake_session):
        fake_category_service.get_all_categories.return_value = [_make_category()]
        response = test_client.get(categories_prefix)
        assert response.status_code == 200
        fake_category_service.get_all_categories.assert_called_once()

    def test_get_categories_pagination(self, test_client, fake_category_service, fake_session):
        fake_category_service.reset_mock()
        fake_category_service.get_all_categories.return_value = [_make_category()]
        response = test_client.get(f"{categories_prefix}?skip=0&limit=10")
        assert response.status_code == 200
        assert fake_category_service.get_all_categories.call_count >= 1

class TestCreateCategory:
    def test_create_category(self, test_client, fake_category_service, fake_session):
        category_data = _make_category()
        fake_category_service.create_category.return_value = category_data
        response = test_client.post(categories_prefix, json={"name": "New Category"})
        assert response.status_code == 201
        fake_category_service.create_category.assert_called_once()

class TestGetCategory:
    def test_get_category_found(self, test_client, fake_category_service, fake_session):
        cat = _make_category()
        fake_category_service.get_category.return_value = cat
        response = test_client.get(f"{categories_prefix}{cat['uid']}")
        assert response.status_code == 200
        fake_category_service.get_category.assert_called_once()

    def test_get_category_not_found(self, test_client, fake_category_service, fake_session):
        fake_category_service.get_category.return_value = None
        response = test_client.get(f"{categories_prefix}{uuid.uuid4()}")
        assert response.status_code == 404

class TestUpdateCategory:
    def test_update_category(self, test_client, fake_category_service, fake_session):
        cat = _make_category()
        fake_category_service.get_category.return_value = cat
        fake_category_service.update_category.return_value = cat
        response = test_client.patch(f"{categories_prefix}{cat['uid']}", json={"name": "Updated"})
        assert response.status_code == 200
        fake_category_service.update_category.assert_called_once()

    def test_update_category_not_found(self, test_client, fake_category_service, fake_session):
        fake_category_service.get_category.return_value = None
        response = test_client.patch(f"{categories_prefix}{uuid.uuid4()}", json={"name": "X"})
        assert response.status_code == 404

class TestDeleteCategory:
    def test_delete_category(self, test_client, fake_category_service, fake_session):
        cat = _make_category()
        fake_category_service.get_category.return_value = cat
        response = test_client.delete(f"{categories_prefix}{cat['uid']}")
        assert response.status_code == 204
        fake_category_service.delete_category.assert_called_once()

    def test_delete_category_not_found(self, test_client, fake_category_service, fake_session):
        fake_category_service.get_category.return_value = None
        response = test_client.delete(f"{categories_prefix}{uuid.uuid4()}")
        assert response.status_code == 404
