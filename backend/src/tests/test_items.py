import uuid
from datetime import datetime

# Adding trailing slash
items_prefix = "/api/v1/items/"

def test_get_all_items(test_client, fake_item_service, fake_session):
    # Setup mock return value (items, count)
    fake_item_service.get_all_items.return_value = ([], 0)
    
    response = test_client.get(url=f"{items_prefix}")

    assert response.status_code == 200
    fake_item_service.get_all_items.assert_called_once()

def test_create_item(test_client, fake_item_service, fake_session):
    item_data = {
        "title": "Test Item",
        "description": "Test Description"
    }
    
    # Mock return with ALL required fields
    now = datetime.now()
    mock_item = {
        "uid": uuid.uuid4(),
        "user_uid": uuid.uuid4(),
        "title": "Test Item",
        "description": "Test Description",
        "created_at": now,
        "update_at": now
    }
    fake_item_service.create_item.return_value = mock_item
    
    response = test_client.post(url=f"{items_prefix}", json=item_data)
    
    assert response.status_code == 201
    fake_item_service.create_item.assert_called_once()
