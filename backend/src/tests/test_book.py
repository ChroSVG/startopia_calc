import uuid
from datetime import datetime

books_prefix = "/api/v1/books/"

def _make_book(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "title": "Test Title",
        "author": "Test Author",
        "publisher": "Test Publications",
        "published_date": "2024-12-10",
        "page_count": 215,
        "language": "English",
        "created_at": datetime.now().isoformat(),
        "update_at": datetime.now().isoformat(),
        "reviews": [],
        "tags": [],
    }
    if overrides:
        data.update(overrides)
    return data

class TestGetAllBooks:
    def test_get_all_books(self, test_client, fake_book_service, fake_session):
        fake_book_service.get_all_books.return_value = [_make_book()]
        response = test_client.get(books_prefix)
        assert response.status_code == 200
        fake_book_service.get_all_books.assert_called_once()

class TestGetUserBooks:
    def test_get_user_books(self, test_client, fake_book_service, fake_session):
        fake_book_service.get_user_books.return_value = [_make_book()]
        user_uid = uuid.uuid4()
        response = test_client.get(f"{books_prefix}user/{user_uid}")
        assert response.status_code == 200
        fake_book_service.get_user_books.assert_called_once()

class TestCreateBook:
    def test_create_book(self, test_client, fake_book_service, fake_session):
        book_data = {
            "title": "New Book",
            "author": "Author",
            "publisher": "Pub",
            "published_date": "2024-01-01",
            "page_count": 100,
            "language": "English",
        }
        fake_book_service.create_book.return_value = _make_book(book_data)
        response = test_client.post(books_prefix, json=book_data)
        assert response.status_code == 201
        fake_book_service.create_book.assert_called_once()

class TestGetBook:
    def test_get_book_found(self, test_client, fake_book_service, fake_session):
        book_data = _make_book()
        fake_book_service.get_book.return_value = book_data
        response = test_client.get(f"{books_prefix}{book_data['uid']}")
        assert response.status_code == 200
        fake_book_service.get_book.assert_called_once()

    def test_get_book_not_found(self, test_client, fake_book_service, fake_session):
        fake_book_service.get_book.return_value = None
        response = test_client.get(f"{books_prefix}{uuid.uuid4()}")
        assert response.status_code == 404

class TestUpdateBook:
    def test_update_book(self, test_client, fake_book_service, fake_session):
        book_data = _make_book()
        fake_book_service.update_book.return_value = book_data
        response = test_client.patch(f"{books_prefix}{book_data['uid']}", json={"title": "Updated"})
        assert response.status_code == 200
        fake_book_service.update_book.assert_called_once()

    def test_update_book_not_found(self, test_client, fake_book_service, fake_session):
        fake_book_service.update_book.return_value = None
        response = test_client.patch(f"{books_prefix}{uuid.uuid4()}", json={"title": "Updated"})
        assert response.status_code == 404

class TestDeleteBook:
    def test_delete_book(self, test_client, fake_book_service, fake_session):
        fake_book_service.delete_book.return_value = _make_book()
        response = test_client.delete(f"{books_prefix}{uuid.uuid4()}")
        assert response.status_code == 204
        fake_book_service.delete_book.assert_called_once()

    def test_delete_book_not_found(self, test_client, fake_book_service, fake_session):
        fake_book_service.delete_book.return_value = None
        response = test_client.delete(f"{books_prefix}{uuid.uuid4()}")
        assert response.status_code == 404
