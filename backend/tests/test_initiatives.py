import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.initiative import Initiative
from tests.conftest import SAMPLE_INITIATIVE


class TestInitiatives:
    """CRUD + фильтрация + смена статуса"""

    async def test_create(self, client: AsyncClient):
        resp = await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)
        assert resp.status_code == 201
        data = resp.json()
        assert data["id"] > 0
        assert data["account"] == "Газпром нефть"
        assert data["status"] == "active"
        assert data["potential"] == 15.5

    async def test_list_empty(self, client: AsyncClient):
        resp = await client.get("/api/initiatives")
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list(self, client: AsyncClient):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"q": "Q2", "account": "ЛУКОЙЛ"})

        resp = await client.get("/api/initiatives")
        assert len(resp.json()) == 2

    async def test_filter_by_quarter(self, client: AsyncClient):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"q": "Q2", "account": "ЛУКОЙЛ"})

        resp = await client.get("/api/initiatives", params={"q": "Q1"})
        data = resp.json()
        assert len(data) == 1
        assert data[0]["account"] == "Газпром нефть"

    async def test_filter_by_account(self, client: AsyncClient):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"account": "ЛУКОЙЛ"})

        resp = await client.get("/api/initiatives", params={"account": "ЛУКОЙЛ"})
        assert len(resp.json()) == 1

    async def test_filter_by_status(self, client: AsyncClient):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE | {"status": "done"})

        resp = await client.get("/api/initiatives", params={"status": "done"})
        assert len(resp.json()) == 1

    async def test_search(self, client: AsyncClient):
        await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)

        resp = await client.get("/api/initiatives", params={"search": "CRM"})
        assert len(resp.json()) == 1

        resp = await client.get("/api/initiatives", params={"search": "нонетакогокейворда"})
        assert len(resp.json()) == 0

    async def test_get_by_id(self, client: AsyncClient):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)).json()

        resp = await client.get(f"/api/initiatives/{created['id']}")
        assert resp.status_code == 200
        assert resp.json()["id"] == created["id"]

    async def test_get_by_id_not_found(self, client: AsyncClient):
        resp = await client.get("/api/initiatives/999")
        assert resp.status_code == 404

    async def test_update(self, client: AsyncClient):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)).json()

        resp = await client.put(f"/api/initiatives/{created['id']}", json={"action": "Новое действие"})
        assert resp.status_code == 200
        assert resp.json()["action"] == "Новое действие"

    async def test_update_potential(self, client: AsyncClient):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)).json()

        resp = await client.put(f"/api/initiatives/{created['id']}", json={"potential": 99.9})
        assert resp.json()["potential"] == 99.9

    async def test_update_not_found(self, client: AsyncClient):
        resp = await client.put("/api/initiatives/999", json={"action": "x"})
        assert resp.status_code == 404

    async def test_delete(self, client: AsyncClient):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)).json()
        assert (await client.get("/api/initiatives")).json() != []

        resp = await client.delete(f"/api/initiatives/{created['id']}")
        assert resp.status_code == 204

        assert (await client.get("/api/initiatives")).json() == []

    async def test_delete_not_found(self, client: AsyncClient):
        resp = await client.delete("/api/initiatives/999")
        assert resp.status_code == 404

    async def test_set_status(self, client: AsyncClient):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)).json()

        resp = await client.patch(f"/api/initiatives/{created['id']}/status", json={"status": "done"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "done"

    async def test_set_status_invalid_id(self, client: AsyncClient):
        resp = await client.patch("/api/initiatives/999/status", json={"status": "done"})
        assert resp.status_code == 404

    async def test_persists_in_db(self, client: AsyncClient, db_session: AsyncSession):
        created = (await client.post("/api/initiatives", json=SAMPLE_INITIATIVE)).json()

        result = await db_session.execute(select(Initiative).where(Initiative.id == created["id"]))
        db_row = result.scalar_one()
        assert db_row.account == "Газпром нефть"
        assert db_row.potential == 15.5
