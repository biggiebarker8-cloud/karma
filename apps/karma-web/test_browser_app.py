import importlib

from fastapi.testclient import TestClient

from WrapperFunction import app, store
from WrapperFunction.persistence import load_store
from WrapperFunction.storage import InMemoryStore


def test_browser_and_universe_survive_restart(tmp_path, monkeypatch):
    monkeypatch.setenv("KARMA_DATA_FILE", str(tmp_path / "karma.json"))
    with TestClient(app) as client:
        page = client.get("/")
        assert page.status_code == 200
        assert "KARMA" in page.text
        created = client.post("/universes", json={"name": "Persistence check", "canon": "Prime"})
        assert created.status_code == 200
        restored = InMemoryStore()
        saved_identity = load_store(restored)
        assert created.json()["id"] in restored.universes
        assert restored.universes[created.json()["id"]].canon == "Prime"
        assert saved_identity is not None
    with store.lock:
        store.universes.pop(created.json()["id"], None)


def test_chat_reports_missing_model_without_exposing_actions(monkeypatch):
    monkeypatch.delenv("KARMA_MODEL_URL", raising=False)
    monkeypatch.delenv("KARMA_MODEL_KEY", raising=False)
    monkeypatch.delenv("KARMA_MODEL_NAME", raising=False)
    with TestClient(app) as client:
        assert client.get("/chat/status").json() == {"connected": False}
        response = client.post("/chat", json={"message": "Hello"})
        assert response.status_code == 503
        assert "needs a model connection" in response.json()["detail"]


def test_owner_key_protects_api(monkeypatch):
    module = importlib.import_module("WrapperFunction")
    monkeypatch.setattr(module, "AUTH_ENABLED", True)
    monkeypatch.setattr(module, "AUTH_BEARER_TOKEN", "test-key")
    with TestClient(app) as client:
        assert client.get("/").status_code == 200
        assert client.get("/identity").status_code == 401
        assert client.get("/identity", headers={"Authorization": "Bearer test-key"}).status_code == 200
