from httpx import AsyncClient


SAMPLE_INITIATIVES = [
    {"q": "Q1", "account": "Газпром", "status": "active",    "priority": "high",     "potential": 10},
    {"q": "Q1", "account": "Газпром", "status": "done",     "priority": "critical", "potential": 20},
    {"q": "Q2", "account": "ЛУКОЙЛ",  "status": "risk",     "priority": "high",     "potential": 30},
    {"q": "Q2", "account": "ЛУКОЙЛ",  "status": "waiting",  "priority": "high",     "potential": 40},
    {"q": "Q3", "account": "Роснефть","status": "pending",  "priority": "critical", "potential": 50},
]


class TestAnalytics:
    async def _seed(self, client: AsyncClient):
        for item in SAMPLE_INITIATIVES:
            await client.post("/api/initiatives", json=item)

    async def test_kpi_summary(self, client: AsyncClient):
        await self._seed(client)
        resp = await client.get("/api/analytics/kpi")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 5
        assert data["done"] == 1
        assert data["pct"] == 20
        assert data["active"] == 1
        assert data["risk"] == 1
        assert data["critical"] == 2
        assert round(data["potential"], 1) == 150.0
        assert data["closed_potential"] == 20

    async def test_empty_kpi(self, client: AsyncClient):
        resp = await client.get("/api/analytics/kpi")
        data = resp.json()
        assert data["total"] == 0
        assert data["pct"] == 0
        assert data["done"] == 0

    async def test_quarter_stats(self, client: AsyncClient):
        await self._seed(client)
        resp = await client.get("/api/analytics/by-quarter")
        data = resp.json()
        q_map = {q["q"]: q for q in data}
        assert q_map["Q1"]["total"] == 2
        assert q_map["Q1"]["done"] == 1
        assert q_map["Q2"]["total"] == 2
        assert q_map["Q3"]["total"] == 1
        assert "Q4" not in q_map

    async def test_account_stats(self, client: AsyncClient):
        await self._seed(client)
        resp = await client.get("/api/analytics/by-account")
        data = resp.json()
        ac_map = {a["account"]: a for a in data}
        assert ac_map["Роснефть"]["potential"] == 50
        assert ac_map["ЛУКОЙЛ"]["potential"] == 70

    async def test_owner_stats(self, client: AsyncClient):
        await client.post("/api/initiatives", json={"q": "Q1", "owner": "Иван", "status": "done"})
        await client.post("/api/initiatives", json={"q": "Q2", "owner": "Иван", "status": "active"})
        await client.post("/api/initiatives", json={"q": "Q3", "owner": "Петр", "status": "done"})

        resp = await client.get("/api/analytics/by-owner")
        data = resp.json()
        own_map = {o["owner"]: o for o in data}
        assert own_map["Иван"]["total"] == 2
        assert own_map["Иван"]["done"] == 1
        assert own_map["Петр"]["total"] == 1
        assert own_map["Петр"]["done"] == 1

    async def test_status_distribution(self, client: AsyncClient):
        await self._seed(client)
        resp = await client.get("/api/analytics/status-distribution")
        data = resp.json()
        s_map = {s["status"]: s for s in data}
        assert s_map["done"]["count"] == 1
        assert s_map["active"]["count"] == 1
        assert s_map["risk"]["count"] == 1
        assert s_map["pending"]["count"] == 1
        assert s_map["waiting"]["count"] == 1
