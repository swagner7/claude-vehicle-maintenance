def _create_vehicle(client):
    response = client.post("/api/v1/vehicles", json={
        "year": 2020, "make": "Toyota", "model": "Camry", "current_mileage": 45000,
    })
    return response.json()["id"]


def test_create_maintenance_record(client):
    vid = _create_vehicle(client)
    response = client.post(f"/api/v1/vehicles/{vid}/maintenance", json={
        "service_type": "oil_change",
        "service_label": "Oil & Filter Change",
        "performed_at": "2025-12-01",
        "mileage_at": 43000,
        "shop_name": "Jiffy Lube",
        "cost": 49.99,
    })
    assert response.status_code == 201
    data = response.json()
    assert data["service_type"] == "oil_change"
    assert data["mileage_at"] == 43000


def test_list_maintenance(client):
    vid = _create_vehicle(client)
    client.post(f"/api/v1/vehicles/{vid}/maintenance", json={
        "service_type": "oil_change",
        "service_label": "Oil Change",
        "performed_at": "2025-12-01",
        "mileage_at": 43000,
    })
    client.post(f"/api/v1/vehicles/{vid}/maintenance", json={
        "service_type": "tire_rotation",
        "service_label": "Tire Rotation",
        "performed_at": "2025-12-01",
        "mileage_at": 43000,
    })
    response = client.get(f"/api/v1/vehicles/{vid}/maintenance")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_delete_maintenance(client):
    vid = _create_vehicle(client)
    create = client.post(f"/api/v1/vehicles/{vid}/maintenance", json={
        "service_type": "oil_change",
        "service_label": "Oil Change",
        "performed_at": "2025-12-01",
        "mileage_at": 43000,
    })
    rid = create.json()["id"]
    response = client.delete(f"/api/v1/vehicles/{vid}/maintenance/{rid}")
    assert response.status_code == 204


def test_vehicle_status(client):
    vid = _create_vehicle(client)
    # Add an oil change done 2000 miles ago
    client.post(f"/api/v1/vehicles/{vid}/maintenance", json={
        "service_type": "oil_change",
        "service_label": "Oil Change",
        "performed_at": "2025-10-01",
        "mileage_at": 43000,
    })
    response = client.get(f"/api/v1/vehicles/{vid}/status")
    assert response.status_code == 200
    data = response.json()
    assert data["vehicle_id"] == vid
    assert len(data["items"]) > 0

    # Find oil change status
    oil = next(i for i in data["items"] if i["service_type"] == "oil_change")
    assert oil["last_performed_mileage"] == 43000
    assert oil["status"] in ("ok", "due_soon", "overdue")


def test_dashboard(client):
    vid = _create_vehicle(client)
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert len(data["vehicles"]) == 1
    assert data["vehicles"][0]["vehicle_id"] == vid
