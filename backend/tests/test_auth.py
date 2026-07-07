from httpx import AsyncClient


class TestAuth:
    """Регистрация, логин, получение профиля"""

    async def test_register(self, client: AsyncClient):
        resp = await client.post("/api/auth/register", json={
            "email": "new@test.com",
            "password": "password123",
            "full_name": "New User",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "new@test.com"
        assert data["full_name"] == "New User"
        assert data["id"] > 0
        assert data["is_active"] is True

    async def test_register_duplicate_email(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "dup@test.com",
            "password": "password123",
            "full_name": "User",
        })
        resp = await client.post("/api/auth/register", json={
            "email": "dup@test.com",
            "password": "password123",
            "full_name": "User2",
        })
        assert resp.status_code == 400

    async def test_login_success(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "login@test.com",
            "password": "mypassword",
            "full_name": "Login User",
        })
        resp = await client.post("/api/auth/login", data={
            "username": "login@test.com",
            "password": "mypassword",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "wrong@test.com",
            "password": "correctpass",
            "full_name": "User",
        })
        resp = await client.post("/api/auth/login", data={
            "username": "wrong@test.com",
            "password": "wrongpass",
        })
        assert resp.status_code == 400

    async def test_login_invalid_email(self, client: AsyncClient):
        resp = await client.post("/api/auth/login", data={
            "username": "nonexistent@test.com",
            "password": "somepass",
        })
        assert resp.status_code == 400

    async def test_get_me(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "me@test.com",
            "password": "testpass",
            "full_name": "Me User",
        })
        resp = await client.post("/api/auth/login", data={
            "username": "me@test.com",
            "password": "testpass",
        })
        token = resp.json()["access_token"]

        resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "me@test.com"
        assert data["full_name"] == "Me User"

    async def test_get_me_unauthorized(self, client: AsyncClient):
        resp = await client.get("/api/auth/me")
        assert resp.status_code == 401

    async def test_get_me_invalid_token(self, client: AsyncClient):
        resp = await client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        assert resp.status_code == 401

    async def test_unauthorized_access_to_groups(self, client: AsyncClient):
        resp = await client.get("/api/groups")
        assert resp.status_code == 401

    async def test_unauthorized_access_to_initiatives(self, client: AsyncClient):
        resp = await client.get("/api/initiatives")
        assert resp.status_code == 401

    async def test_unauthorized_access_to_contacts(self, client: AsyncClient):
        resp = await client.get("/api/contacts")
        assert resp.status_code == 401

    async def test_unauthorized_access_to_analytics(self, client: AsyncClient):
        resp = await client.get("/api/analytics/kpi")
        assert resp.status_code == 401

    async def test_unauthorized_access_to_export(self, client: AsyncClient):
        resp = await client.get("/api/export")
        assert resp.status_code == 401

    async def test_unauthorized_access_to_import(self, client: AsyncClient):
        resp = await client.post("/api/import")
        assert resp.status_code == 401

    async def test_unauthorized_access_to_search_users(self, client: AsyncClient):
        resp = await client.get("/api/users/search", params={"q": "test"})
        assert resp.status_code == 401

    async def test_unauthorized_access_to_get_group(self, client: AsyncClient):
        resp = await client.get("/api/groups/1")
        assert resp.status_code == 401

    async def test_update_own_profile(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "update@test.com",
            "password": "password123",
            "full_name": "Old Name",
        })
        login = (await client.post("/api/auth/login", data={
            "username": "update@test.com", "password": "password123",
        })).json()
        token = login["access_token"]

        resp = await client.patch(
            "/api/auth/me",
            json={"full_name": "New Name"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "New Name"

    async def test_update_own_profile_twice(self, client: AsyncClient):
        await client.post("/api/auth/register", json={
            "email": "up2@test.com", "password": "pass123", "full_name": "First",
        })
        login = (await client.post("/api/auth/login", data={
            "username": "up2@test.com", "password": "pass123",
        })).json()
        headers = {"Authorization": f"Bearer {login['access_token']}"}
        resp1 = await client.patch("/api/auth/me", json={"full_name": "Second"}, headers=headers)
        assert resp1.status_code == 200
        resp2 = await client.patch("/api/auth/me", json={"full_name": "Third"}, headers=headers)
        assert resp2.status_code == 200
        assert resp2.json()["full_name"] == "Third"

    async def test_update_user_unauthorized(self, client: AsyncClient):
        resp = await client.patch("/api/auth/me", json={"full_name": "X"})
        assert resp.status_code == 401

    async def test_login_rate_limit(self, client: AsyncClient):
        from app.main import app as _app
        limiter = _app.state.limiter
        limiter.enabled = True
        limiter._storage.reset()

        await client.post("/api/auth/register", json={
            "email": "ratelimit@test.com", "password": "Str0ng!Pass", "full_name": "Rate",
        })
        for _ in range(5):
            resp = await client.post("/api/auth/login", data={
                "username": "ratelimit@test.com", "password": "wrongpass",
            })
            assert resp.status_code == 400
        resp = await client.post("/api/auth/login", data={
            "username": "ratelimit@test.com", "password": "wrongpass",
        })
        assert resp.status_code == 429
        limiter._storage.reset()
        limiter.enabled = False
