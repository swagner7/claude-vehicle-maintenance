def test_create_vehicle(client):
    response = client.post("/api/v1/vehicles", json={
        "year": 2020,
        "make": "Toyota",
        "model": "Camry",
        "current_mileage": 45000,
        "nickname": "Daily Driver",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["year"] == 2020
    assert data["make"] == "Toyota"
    assert data["model"] == "Camry"
    assert data["current_mileage"] == 45000
    assert data["nickname"] == "Daily Driver"
    assert "id" in data


def test_list_vehicles(client):
    client.post("/api/v1/vehicles", json={
        "year": 2020, "make": "Toyota", "model": "Camry", "current_mileage": 45000,
    })
    client.post("/api/v1/vehicles", json={
        "year": 2018, "make": "Honda", "model": "Civic", "current_mileage": 60000,
    })
    response = client.get("/api/v1/vehicles")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_vehicle(client):
    create = client.post("/api/v1/vehicles", json={
        "year": 2020, "make": "Toyota", "model": "Camry", "current_mileage": 45000,
    })
    vid = create.json()["id"]
    response = client.get(f"/api/v1/vehicles/{vid}")
    assert response.status_code == 200
    assert response.json()["make"] == "Toyota"


def test_get_vehicle_not_found(client):
    response = client.get("/api/v1/vehicles/999")
    assert response.status_code == 404


def test_update_vehicle(client):
    create = client.post("/api/v1/vehicles", json={
        "year": 2020, "make": "Toyota", "model": "Camry", "current_mileage": 45000,
    })
    vid = create.json()["id"]
    response = client.put(f"/api/v1/vehicles/{vid}", json={"nickname": "My Car"})
    assert response.status_code == 200
    assert response.json()["nickname"] == "My Car"


def test_delete_vehicle(client):
    create = client.post("/api/v1/vehicles", json={
        "year": 2020, "make": "Toyota", "model": "Camry", "current_mileage": 45000,
    })
    vid = create.json()["id"]
    response = client.delete(f"/api/v1/vehicles/{vid}")
    assert response.status_code == 204
    assert client.get(f"/api/v1/vehicles/{vid}").status_code == 404


def test_update_mileage(client):
    create = client.post("/api/v1/vehicles", json={
        "year": 2020, "make": "Toyota", "model": "Camry", "current_mileage": 45000,
    })
    vid = create.json()["id"]
    response = client.patch(f"/api/v1/vehicles/{vid}/mileage", json={"current_mileage": 46000})
    assert response.status_code == 200
    assert response.json()["current_mileage"] == 46000
