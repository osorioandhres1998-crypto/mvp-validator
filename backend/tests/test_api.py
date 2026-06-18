"""Pruebas de integración de los endpoints FastAPI."""

import time

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

SMALL_CONFIG = {
    "n_iterations": 200,
    "population_size": 200,
    "random_seed": 42,
    "n_jobs": 1,
}


def _wait_until_done(simulation_id: str, timeout: float = 30.0) -> str:
    deadline = time.time() + timeout
    status = "queued"
    while time.time() < deadline:
        resp = client.get(f"/simulations/{simulation_id}/status")
        status = resp.json()["status"]
        if status in ("done", "failed"):
            return status
        time.sleep(0.1)
    return status


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "docs" in resp.json()


def test_full_simulation_flow():
    # Crear
    resp = client.post("/simulations", json=SMALL_CONFIG)
    assert resp.status_code == 202
    body = resp.json()
    sim_id = body["simulation_id"]
    assert body["status"] in ("queued", "running", "done")

    # Esperar a que termine
    status = _wait_until_done(sim_id)
    assert status == "done"

    # Resultados
    resp = client.get(f"/simulations/{sim_id}/results")
    assert resp.status_code == 200
    results = resp.json()
    assert "acceptance_rate" in results
    assert "top_objections" in results
    assert results["simulation_id"] == sim_id

    # Muestras paginadas
    resp = client.get(f"/simulations/{sim_id}/samples", params={"limit": 50, "page": 1})
    assert resp.status_code == 200
    page = resp.json()
    assert page["limit"] == 50
    assert len(page["items"]) == 50
    assert page["total"] == 200
    assert page["total_pages"] == 4


def test_status_not_found():
    resp = client.get("/simulations/does-not-exist/status")
    assert resp.status_code == 404


def test_results_not_found():
    resp = client.get("/simulations/does-not-exist/results")
    assert resp.status_code == 404


def test_invalid_config_rejected():
    resp = client.post("/simulations", json={"n_iterations": 0})
    assert resp.status_code == 422


def test_samples_second_page():
    resp = client.post("/simulations", json=SMALL_CONFIG)
    sim_id = resp.json()["simulation_id"]
    assert _wait_until_done(sim_id) == "done"
    resp = client.get(f"/simulations/{sim_id}/samples", params={"limit": 150, "page": 2})
    page = resp.json()
    assert len(page["items"]) == 50  # 200 muestras, 150 en pág. 1, 50 en pág. 2
    assert page["page"] == 2
