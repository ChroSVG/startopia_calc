import uuid
from datetime import datetime

logs_prefix = "/api/v1/activity-logs/"

def _make_log(overrides=None):
    data = {
        "uid": str(uuid.uuid4()),
        "user_uid": str(uuid.uuid4()),
        "action": "item.create",
        "reference_type": "item",
        "reference_uid": str(uuid.uuid4()),
        "message": "Created item",
        "data": None,
        "created_at": datetime.now().isoformat(),
    }
    if overrides:
        data.update(overrides)
    return data

class TestGetLogs:
    def test_get_logs_superuser(self, test_client, fake_activity_log_service, fake_session):
        fake_activity_log_service.get_logs.return_value = ([_make_log()], 1)
        response = test_client.get(logs_prefix)
        assert response.status_code == 200
        assert response.json()["count"] == 1
        fake_activity_log_service.get_logs.assert_called_once()

    def test_get_logs_empty(self, test_client, fake_activity_log_service, fake_session):
        fake_activity_log_service.reset_mock()
        fake_activity_log_service.get_logs.return_value = ([], 0)
        response = test_client.get(logs_prefix)
        assert response.status_code == 200
        assert response.json()["count"] == 0

    def test_get_logs_with_pagination(self, test_client, fake_activity_log_service, fake_session):
        fake_activity_log_service.reset_mock()
        fake_activity_log_service.get_logs.return_value = ([_make_log()], 1)
        response = test_client.get(f"{logs_prefix}?skip=0&limit=10")
        assert response.status_code == 200
        assert fake_activity_log_service.get_logs.call_count >= 1
