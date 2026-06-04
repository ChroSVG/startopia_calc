import uuid
from datetime import datetime

items_prefix = "/api/v1/items/"

def _make_item(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "name": "Test Item",
        "rarity": None,
        "description": None,
        "max_drop": None,
        "type": None,
        "chi": None,
        "texture_type": None,
        "collision_type": None,
        "seed_color": None,
        "grow_time": None,
        "default_gems_drop": None,
        "hits_with_hand": None,
        "hits_with_pickaxe": None,
        "restore_time_seconds": None,
        "scraped": False,
        "created_by_uid": None,
        "created_at": datetime.now().isoformat(),
        "update_at": datetime.now().isoformat(),
    }
    if overrides:
        data.update(overrides)
    return data

def _make_link(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "source_uid": str(uuid.uuid4()),
        "target_uid": str(uuid.uuid4()),
    }
    if overrides:
        data.update(overrides)
    return data

class TestGetAllItems:
    def test_get_all_items(self, test_client, fake_item_service, fake_session):
        fake_item_service.get_all_items.return_value = ([], 0)
        response = test_client.get(items_prefix)
        assert response.status_code == 200
        assert response.json()["count"] == 0
        fake_item_service.get_all_items.assert_called_once()

class TestCreateItem:
    def test_create_item(self, test_client, fake_item_service, fake_session):
        item_data = _make_item()
        fake_item_service.create_item.return_value = item_data
        response = test_client.post(items_prefix, json={"name": "New Item"})
        assert response.status_code == 201
        fake_item_service.create_item.assert_called_once()

class TestGetItem:
    def test_get_item_found(self, test_client, fake_item_service, fake_session):
        item_data = _make_item({"name": "Chandelier"})
        fake_item_service.get_item.return_value = item_data
        response = test_client.get(f"{items_prefix}{item_data['uid']}")
        assert response.status_code == 200
        assert response.json()["name"] == "Chandelier"

    def test_get_item_not_found(self, test_client, fake_item_service, fake_session):
        fake_item_service.get_item.return_value = None
        response = test_client.get(f"{items_prefix}{uuid.uuid4()}")
        assert response.status_code == 404

class TestUpdateItem:
    def test_update_item(self, test_client, fake_item_service, fake_session):
        item_data = _make_item({"name": "Updated"})
        fake_item_service.update_item.return_value = item_data
        response = test_client.patch(f"{items_prefix}{item_data['uid']}", json={"name": "Updated"})
        assert response.status_code == 200
        assert response.json()["name"] == "Updated"

    def test_update_item_not_found(self, test_client, fake_item_service, fake_session):
        fake_item_service.update_item.return_value = None
        response = test_client.patch(f"{items_prefix}{uuid.uuid4()}", json={"name": "X"})
        assert response.status_code == 404

class TestDeleteItem:
    def test_delete_item(self, test_client, fake_item_service, fake_session):
        fake_item_service.delete_item.return_value = _make_item()
        response = test_client.delete(f"{items_prefix}{uuid.uuid4()}")
        assert response.status_code == 204

    def test_delete_item_not_found(self, test_client, fake_item_service, fake_session):
        fake_item_service.delete_item.return_value = None
        response = test_client.delete(f"{items_prefix}{uuid.uuid4()}")
        assert response.status_code == 404

class TestItemLinks:
    def test_create_item_link(self, test_client, fake_item_link_service, fake_session):
        link_data = _make_link()
        fake_item_link_service.create_link.return_value = link_data
        response = test_client.post(f"{items_prefix}links", json={
            "source_uid": str(uuid.uuid4()), "target_uid": str(uuid.uuid4())
        })
        assert response.status_code == 201

    def test_delete_item_link(self, test_client, fake_item_link_service, fake_session):
        fake_item_link_service.delete_link.return_value = _make_link()
        response = test_client.delete(f"{items_prefix}links/{uuid.uuid4()}")
        assert response.status_code == 204

    def test_delete_item_link_not_found(self, test_client, fake_item_link_service, fake_session):
        fake_item_link_service.delete_link.return_value = None
        response = test_client.delete(f"{items_prefix}links/{uuid.uuid4()}")
        assert response.status_code == 404
