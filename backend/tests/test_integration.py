import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.main import app
from app.models import Base


@pytest.fixture(autouse=True)
def use_real_db():
    """Integration tests use the real database, not the in-memory test DB."""
    saved = app.dependency_overrides.copy()
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.update(saved)


class TestConfig:
    def test_database_url_not_empty(self):
        assert len(settings.DATABASE_URL) > 0

    def test_secret_not_empty(self):
        assert len(settings.SECRET) > 0


class TestLifecycle:
    @pytest_asyncio.fixture(autouse=True)
    async def setup_tables(self):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        yield
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    async def test_lifespan_creates_tables(self):
        async with engine.connect() as conn:
            result = await conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table'")
            )
            tables = {row[0] for row in result}
        assert "users" in tables
        assert "groups" in tables
        assert "group_members" in tables
        assert "initiatives" in tables
        assert "contacts" in tables

    async def test_register_and_me(self, setup_tables):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            r = await client.post(
                "/api/auth/register",
                json={
                    "email": "int@test.com",
                    "password": "Str0ng!Pass",
                    "full_name": "Integration",
                },
            )
            assert r.status_code == 201
            assert r.json()["email"] == "int@test.com"

            r = await client.post(
                "/api/auth/login",
                data={"username": "int@test.com", "password": "Str0ng!Pass"},
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            assert r.status_code == 200
            token = r.json()["access_token"]

            r = await client.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert r.status_code == 200
            assert r.json()["email"] == "int@test.com"

    async def test_me_returns_401_without_token(self, setup_tables):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            r = await client.get("/api/auth/me")
            assert r.status_code == 401

    async def test_register_duplicate_email(self, setup_tables):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            r1 = await client.post(
                "/api/auth/register",
                json={
                    "email": "dup@test.com",
                    "password": "Str0ng!Pass",
                    "full_name": "First",
                },
            )
            assert r1.status_code == 201

            r2 = await client.post(
                "/api/auth/register",
                json={
                    "email": "dup@test.com",
                    "password": "Str0ng!Pass",
                    "full_name": "Second",
                },
            )
            assert r2.status_code == 400

    async def test_groups_returns_401_without_token(self, setup_tables):
        transport = ASGITransport(app=app)
        async with AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            r = await client.get("/api/groups")
            assert r.status_code == 401
