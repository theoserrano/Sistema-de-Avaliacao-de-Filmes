from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_movies_status():
    response = client.get("/api/v1/movies")
    assert response.status_code in [200, 404]

def test_create_movie_validation_error():
    response = client.post("/api/v1/movies", json={})
    assert response.status_code == 422