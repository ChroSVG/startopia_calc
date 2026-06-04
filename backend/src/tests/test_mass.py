import uuid
from datetime import datetime

masses_prefix = "/api/v1/masses/"

class FakeMassItem:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class FakeMass:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

def _make_mass_item(overrides=None):
    data = {
        "uid": uuid.uuid4(),
        "item_uid": uuid.uuid4(),
        "item_name": "Steel Block",
        "tree_rarity": 86,
        "max_blocks": 2,
        "jumlah_pohon": 1000,
        "blok_yielded": 3750,
        "total_smash_efektif": 4091,
        "seeds_fallen": 35,
        "seeds_from_smash": 1022,
        "total_seeds_return": 1057,
        "seed_return_rate": 105.7,
        "gem_blocks": 2727,
        "avg_gems_per_block": 9.5556,
        "harvest_gems": 9556,
        "total_gems_didapat": 35603,
        "grow_time_seconds": 636856,
        "grow_time_readable": "7 Hari 8 Jam 54 Menit 16 Detik",
    }
    if overrides:
        data.update(overrides)
    return FakeMassItem(**data)

def _make_mass(overrides=None):
    data = {
        "uid": uuid.uuid4(),
        "name": "Test Mass",
        "description": "A test farming mass",
        "mode": "a",
        "user_uid": uuid.uuid4(),
        "created_at": datetime.now(),
        "update_at": datetime.now(),
        "items": [_make_mass_item()],
    }
    if overrides:
        data.update(overrides)
    return FakeMass(**data), data  # return (obj, dict) for route and assertions

class TestGetMasses:
    def test_get_user_masses(self, test_client, fake_mass_service, fake_session):
        mass_obj, mass_dict = _make_mass()
        fake_mass_service.get_user_masses.return_value = ([mass_obj], 1)
        response = test_client.get(masses_prefix)
        assert response.status_code == 200
        assert response.json()["count"] == 1
        fake_mass_service.get_user_masses.assert_called_once()

    def test_get_user_masses_empty(self, test_client, fake_mass_service, fake_session):
        fake_mass_service.get_user_masses.return_value = ([], 0)
        response = test_client.get(masses_prefix)
        assert response.status_code == 200
        assert response.json()["count"] == 0

class TestCreateMass:
    def test_create_mass(self, test_client, fake_mass_service, fake_session):
        mass_obj, mass_dict = _make_mass()
        fake_mass_service.create_mass.return_value = mass_obj
        response = test_client.post(masses_prefix, json={
            "name": "My Mass",
            "mode": "a",
            "items": [{
                "item_name": "Steel Block",
                "tree_rarity": 86,
                "max_blocks": 2,
                "jumlah_pohon": 1000,
            }],
        })
        assert response.status_code == 201
        fake_mass_service.create_mass.assert_called_once()

    def test_create_mass_empty_items(self, test_client, fake_mass_service, fake_session):
        mass_obj, mass_dict = _make_mass({"items": []})
        fake_mass_service.create_mass.return_value = mass_obj
        response = test_client.post(masses_prefix, json={
            "name": "Empty Mass",
            "mode": "a",
            "items": [],
        })
        assert response.status_code == 201

class TestGetMass:
    def test_get_mass_found(self, test_client, fake_mass_service, fake_session):
        from src.tests.conftest import mock_user
        mass_obj, mass_dict = _make_mass({"user_uid": mock_user.uid})
        fake_mass_service.get_mass.return_value = mass_obj
        response = test_client.get(f"{masses_prefix}{mass_obj.uid}")
        assert response.status_code == 200
        fake_mass_service.get_mass.assert_called_once()

    def test_get_mass_not_found(self, test_client, fake_mass_service, fake_session):
        fake_mass_service.get_mass.return_value = None
        response = test_client.get(f"{masses_prefix}{uuid.uuid4()}")
        assert response.status_code == 404

    def test_get_mass_not_owner(self, test_client, fake_mass_service, fake_session):
        other_user_uid = uuid.uuid4()
        mass_obj, _ = _make_mass({"user_uid": other_user_uid})
        fake_mass_service.get_mass.return_value = mass_obj
        response = test_client.get(f"{masses_prefix}{mass_obj.uid}")
        assert response.status_code == 403

class TestUpdateMass:
    def test_update_mass(self, test_client, fake_mass_service, fake_session):
        mass_obj, mass_dict = _make_mass()
        fake_mass_service.update_mass.return_value = mass_obj
        response = test_client.patch(f"{masses_prefix}{mass_obj.uid}", json={"name": "Updated"})
        assert response.status_code == 200
        fake_mass_service.update_mass.assert_called_once()

    def test_update_mass_not_found(self, test_client, fake_mass_service, fake_session):
        fake_mass_service.update_mass.return_value = None
        response = test_client.patch(f"{masses_prefix}{uuid.uuid4()}", json={"name": "X"})
        assert response.status_code == 404

class TestDeleteMass:
    def test_delete_mass(self, test_client, fake_mass_service, fake_session):
        mass_obj, mass_dict = _make_mass()
        fake_mass_service.delete_mass.return_value = mass_obj
        response = test_client.delete(f"{masses_prefix}{uuid.uuid4()}")
        assert response.status_code == 204
        fake_mass_service.delete_mass.assert_called_once()

    def test_delete_mass_not_found(self, test_client, fake_mass_service, fake_session):
        fake_mass_service.delete_mass.return_value = None
        response = test_client.delete(f"{masses_prefix}{uuid.uuid4()}")
        assert response.status_code == 404

class TestCalculateMass:
    def test_calculate_mass(self, test_client, fake_mass_service, fake_session):
        mass_obj, mass_dict = _make_mass()
        fake_mass_service.calculate_mass.return_value = mass_obj
        response = test_client.post(f"{masses_prefix}{mass_obj.uid}/calculate")
        assert response.status_code == 200
        fake_mass_service.calculate_mass.assert_called_once()

    def test_calculate_mass_not_found(self, test_client, fake_mass_service, fake_session):
        fake_mass_service.calculate_mass.return_value = None
        response = test_client.post(f"{masses_prefix}{uuid.uuid4()}/calculate")
        assert response.status_code == 404
