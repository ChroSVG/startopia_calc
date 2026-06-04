import uuid
from datetime import datetime

reviews_prefix = "/api/v1/reviews/"

def _make_review(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "rating": 4,
        "review_text": "Great book!",
        "user_uid": str(uuid.uuid4()),
        "book_uid": str(uuid.uuid4()),
        "created_at": datetime.now().isoformat(),
        "update_at": datetime.now().isoformat(),
    }
    if overrides:
        data.update(overrides)
    return data

class TestGetAllReviews:
    def test_get_all_reviews(self, test_client, fake_review_service, fake_session):
        fake_review_service.get_all_reviews.return_value = [_make_review()]
        response = test_client.get(reviews_prefix)
        assert response.status_code == 200
        fake_review_service.get_all_reviews.assert_called_once()

class TestGetReview:
    def test_get_review(self, test_client, fake_review_service, fake_session):
        review = _make_review()
        fake_review_service.get_review.return_value = review
        response = test_client.get(f"{reviews_prefix}{review['uid']}")

        assert response.status_code == 200
        fake_review_service.get_review.assert_called_once()

class TestCreateReview:
    def test_create_review(self, test_client, fake_review_service, fake_session,
                           fake_book_service, fake_user_service):
        review = _make_review()
        fake_review_service.add_review_to_book.return_value = review
        response = test_client.post(
            f"{reviews_prefix}book/{uuid.uuid4()}",
            json={"rating": 4, "review_text": "Nice!"},
        )
        assert response.status_code == 200
        fake_review_service.add_review_to_book.assert_called_once()

class TestDeleteReview:
    def test_delete_review(self, test_client, fake_review_service, fake_session,
                           fake_user_service):
        response = test_client.delete(f"{reviews_prefix}{uuid.uuid4()}")
        assert response.status_code == 204
        fake_review_service.delete_review_to_from_book.assert_called_once()
