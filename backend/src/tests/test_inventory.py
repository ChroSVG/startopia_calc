import uuid
from datetime import datetime

inventory_prefix = "/api/v1/inventory/"

def _make_inv_item(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "user_uid": str(uuid.uuid4()),
        "item_uid": str(uuid.uuid4()),
        "quantity": 10,
        "created_at": datetime.now().isoformat(),
    }
    if overrides:
        data.update(overrides)
    return data

class TestGetInventory:
    def test_get_my_inventory(self, test_client, fake_inventory_service, fake_session):
        fake_inventory_service.get_user_inventory.return_value = ([_make_inv_item()], 1)
        response = test_client.get(inventory_prefix)
        assert response.status_code == 200
        assert response.json()["count"] == 1
        fake_inventory_service.get_user_inventory.assert_called_once()

    def test_get_inventory_empty(self, test_client, fake_inventory_service, fake_session):
        fake_inventory_service.get_user_inventory.return_value = ([], 0)
        response = test_client.get(inventory_prefix)
        assert response.status_code == 200
        assert response.json()["count"] == 0

class TestAddToInventory:
    def test_add_to_inventory(self, test_client, fake_inventory_service, fake_session):
        inv_item = _make_inv_item()
        fake_inventory_service.add_item.return_value = inv_item
        response = test_client.post(inventory_prefix, json={
            "item_uid": str(uuid.uuid4()), "quantity": 5
        })
        assert response.status_code == 201
        fake_inventory_service.add_item.assert_called_once()

class TestUpdateInventoryItem:
    def test_update_inventory_item(self, test_client, fake_inventory_service, fake_session):
        inv_item = _make_inv_item({"quantity": 20})
        fake_inventory_service.update_item.return_value = inv_item
        response = test_client.patch(f"{inventory_prefix}{inv_item['uid']}", json={"quantity": 20})
        assert response.status_code == 200
        fake_inventory_service.update_item.assert_called_once()

    def test_update_inventory_not_found(self, test_client, fake_inventory_service, fake_session):
        fake_inventory_service.update_item.return_value = None
        response = test_client.patch(f"{inventory_prefix}{uuid.uuid4()}", json={"quantity": 5})
        assert response.status_code == 404

class TestDeleteFromInventory:
    def test_delete_from_inventory(self, test_client, fake_inventory_service, fake_session):
        fake_inventory_service.delete_item.return_value = _make_inv_item()
        response = test_client.delete(f"{inventory_prefix}{uuid.uuid4()}")
        assert response.status_code == 204
        fake_inventory_service.delete_item.assert_called_once()

    def test_delete_inventory_not_found(self, test_client, fake_inventory_service, fake_session):
        fake_inventory_service.delete_item.return_value = None
        response = test_client.delete(f"{inventory_prefix}{uuid.uuid4()}")
        assert response.status_code == 404
