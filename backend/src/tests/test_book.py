from src.books.schemas import BookCreateModel
from datetime import datetime
import uuid

# Adding trailing slash to avoid 307 redirects
books_prefix = "/api/v1/books/"

def test_get_all_books(test_client, fake_book_service, fake_session):
    # Setup mock return value
    fake_book_service.get_all_books.return_value = []
    
    response = test_client.get(url=f"{books_prefix}")

    assert response.status_code == 200
    fake_book_service.get_all_books.assert_called_once()

def test_create_book(test_client, fake_book_service, test_book, fake_session):
    book_data = {
        "title": "Test Title",
        "author": "Test Author",
        "publisher": "Test Publications",
        "published_date": "2024-12-10",
        "language": "English",
        "page_count": 215
    }
    
    # Setup mock return value (using test_book fixture but ensuring it's for this call)
    fake_book_service.create_book.return_value = test_book
    
    response = test_client.post(
        url=f"{books_prefix}",
        json=book_data
    )
    
    assert response.status_code == 201
    fake_book_service.create_book.assert_called_once()

def test_get_book_by_uid(test_client, fake_book_service, test_book, fake_session):
    # Setup mock return value
    fake_book_service.get_book.return_value = test_book
    
    response = test_client.get(f"{books_prefix}{test_book.uid}")

    assert response.status_code == 200
    fake_book_service.get_book.assert_called_once_with(str(test_book.uid), fake_session)

def test_update_book_by_uid(test_client, fake_book_service, test_book, fake_session):
    # Setup mock return value
    fake_book_service.update_book.return_value = test_book
    
    # Using fields that are likely in BookUpdateModel
    book_update_data = {
        "title": "Updated Title",
        "author": "Updated Author"
    }
    response = test_client.patch(f"{books_prefix}{test_book.uid}", json=book_update_data)

    assert response.status_code == 200
    fake_book_service.update_book.assert_called_once()
