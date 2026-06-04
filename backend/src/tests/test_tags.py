import uuid
from datetime import datetime

tags_prefix = "/api/v1/tags/"

def _make_tag(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "name": "Test Tag",
        "created_at": datetime.now().isoformat(),
    }
    if overrides:
        data.update(overrides)
    return data

class TestGetAllTags:
    def test_get_all_tags(self, test_client, fake_tag_service, fake_session):
        fake_tag_service.get_tags.return_value = [_make_tag()]
        response = test_client.get(tags_prefix)
        assert response.status_code == 200
        fake_tag_service.get_tags.assert_called_once()

class TestCreateTag:
    def test_create_tag(self, test_client, fake_tag_service, fake_session):
        tag_data = _make_tag()
        fake_tag_service.add_tag.return_value = tag_data
        response = test_client.post(tags_prefix, json={"name": "New Tag"})
        assert response.status_code == 201
        fake_tag_service.add_tag.assert_called_once()

class TestAddTagsToBook:
    def test_add_tags_to_book(self, test_client, fake_tag_service, fake_session, fake_book_service):
        fake_tag_service.add_tags_to_book.return_value = {
            "uid": str(uuid.uuid4()),
            "title": "Book",
            "author": "Author",
            "publisher": "Pub",
            "published_date": "2024-01-01",
            "page_count": 100,
            "language": "English",
            "created_at": datetime.now().isoformat(),
            "update_at": datetime.now().isoformat(),
            "reviews": [],
            "tags": [{"uid": str(uuid.uuid4()), "name": "fiction", "created_at": datetime.now().isoformat()}],
        }
        response = test_client.post(
            f"{tags_prefix}book/{uuid.uuid4()}/tags",
            json={"tags": [{"name": "fiction"}]},
        )
        assert response.status_code == 200
        fake_tag_service.add_tags_to_book.assert_called_once()

class TestUpdateTag:
    def test_update_tag(self, test_client, fake_tag_service, fake_session):
        tag = _make_tag()
        fake_tag_service.update_tag.return_value = tag
        response = test_client.put(f"{tags_prefix}{tag['uid']}", json={"name": "Renamed"})
        assert response.status_code == 200
        fake_tag_service.update_tag.assert_called_once()

class TestDeleteTag:
    def test_delete_tag(self, test_client, fake_tag_service, fake_session):
        fake_tag_service.delete_tag.return_value = _make_tag()
        response = test_client.delete(f"{tags_prefix}{uuid.uuid4()}")
        assert response.status_code == 204
        fake_tag_service.delete_tag.assert_called_once()
