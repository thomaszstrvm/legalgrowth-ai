import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.db import Base, get_db
from app.api import app
from app.config import settings
from pydantic import SecretStr
import httpx


@pytest.fixture(autouse=True)
def no_external_http(monkeypatch):
    """TestClient and MockTransport remain usable; real HTTP is never a fixture."""
    def forbidden(*args, **kwargs):
        raise AssertionError('Real HTTP forbidden in tests; use httpx.MockTransport')
    monkeypatch.setattr(httpx.HTTPTransport, 'handle_request', forbidden)
    monkeypatch.setattr(httpx.AsyncHTTPTransport, 'handle_async_request', forbidden)


@pytest.fixture
def db():
    engine = create_engine('sqlite://', connect_args={'check_same_thread':False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with sessionmaker(engine, expire_on_commit=False)() as session:
        yield session
    engine.dispose()


@pytest.fixture
def client(db, monkeypatch):
    import secrets
    password=secrets.token_urlsafe(24)
    monkeypatch.setattr(settings,'admin_password',SecretStr(password))
    monkeypatch.setattr(settings,'viewer_password',SecretStr(password))
    monkeypatch.setattr(settings,'scheduler_enabled',False)
    app.dependency_overrides[get_db]=lambda:db
    with TestClient(app) as client:
        client.auth=('admin',password)
        client.headers['X-Requested-With']='LegalGrowth'
        yield client
    app.dependency_overrides.clear()
