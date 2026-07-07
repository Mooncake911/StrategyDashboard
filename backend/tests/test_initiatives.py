import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.initiative import Initiative
from tests.conftest import SAMPLE_INITIATIVE


class TestInitiatives:
    """CRUD + фильтрация + смена статуса"""

    async def test_create(self, client: AsyncClient, auth_headers: dict):
        resp = await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["id"] > 0
        assert data["account"] == "Газпром нефть"
        assert data["status"] == "active"
        assert data["potential"] == 15.5

    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get("/api/initiatives", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list(self, client: AsyncClient, auth_headers: dict):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"q": "Q2", "account": "ЛУКОЙЛ"}, headers=auth_headers)

        resp = await client.get("/api/initiatives", headers=auth_headers)
        assert len(resp.json()) == 2

    async def test_filter_by_quarter(self, client: AsyncClient, auth_headers: dict):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"q": "Q2", "account": "ЛУКОЙЛ"}, headers=auth_headers)

        resp = await client.get("/api/initiatives", params={"q": "Q1"}, headers=auth_headers)
        data = resp.json()
        assert len(data) == 1
        assert data[0]["account"] == "Газпром нефть"

    async def test_filter_by_account(self, client: AsyncClient, auth_headers: dict):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"account": "ЛУКОЙЛ"}, headers=auth_headers)

        resp = await client.get("/api/initiatives", params={"account": "ЛУКОЙЛ"}, headers=auth_headers)
        assert len(resp.json()) == 1

    async def test_filter_by_status(self, client: AsyncClient, auth_headers: dict):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"status": "done"}, headers=auth_headers)

        resp = await client.get("/api/initiatives", params={"status": "done"}, headers=auth_headers)
        assert len(resp.json()) == 1

    async def test_search(self, client: AsyncClient, auth_headers: dict):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)

        resp = await client.get("/api/initiatives", params={"search": "CRM"}, headers=auth_headers)
        assert len(resp.json()) == 1

        resp = await client.get("/api/initiatives", params={"search": "нонетакогокейворда"}, headers=auth_headers)
        assert len(resp.json()) == 0

    async def test_get_by_id(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)).json()

        resp = await client.get(f"/api/initiatives/{created['id']}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == created["id"]

    async def test_get_by_id_not_found(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get("/api/initiatives/999", headers=auth_headers)
        assert resp.status_code == 404

    async def test_update(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)).json()

        resp = await client.put(f"/api/initiatives/{created['id']}", json={"action": "Новое действие"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["action"] == "Новое действие"

    async def test_update_potential(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)).json()

        resp = await client.put(f"/api/initiatives/{created['id']}", json={"potential": 99.9}, headers=auth_headers)
        assert resp.json()["potential"] == 99.9

    async def test_update_not_found(self, client: AsyncClient, auth_headers: dict):
        resp = await client.put("/api/initiatives/999", json={"action": "x"}, headers=auth_headers)
        assert resp.status_code == 404

    async def test_delete(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)).json()
        assert (await client.get("/api/initiatives", headers=auth_headers)).json() != []

        resp = await client.delete(f"/api/initiatives/{created['id']}", headers=auth_headers)
        assert resp.status_code == 204

        assert (await client.get("/api/initiatives", headers=auth_headers)).json() == []

    async def test_delete_not_found(self, client: AsyncClient, auth_headers: dict):
        resp = await client.delete("/api/initiatives/999", headers=auth_headers)
        assert resp.status_code == 404

    async def test_set_status(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)).json()

        resp = await client.patch(f"/api/initiatives/{created['id']}/status", json={"status": "done"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "done"

    async def test_set_status_invalid_id(self, client: AsyncClient, auth_headers: dict):
        resp = await client.patch("/api/initiatives/999/status", json={"status": "done"}, headers=auth_headers)
        assert resp.status_code == 404

    async def test_persists_in_db(self, client: AsyncClient, auth_headers: dict, db_session: AsyncSession):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE, headers=auth_headers)).json()

        result = await db_session.execute(select(Initiative).where(Initiative.id == created["id"]))
        db_row = result.scalar_one()
        assert db_row.account == "Газпром нефть"
        assert db_row.potential == 15.5
