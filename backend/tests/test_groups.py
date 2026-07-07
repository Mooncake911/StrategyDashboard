from httpx import AsyncClient


class TestGroups:
    """Группы: CRUD, участники, роли, права"""

    async def test_create_group(self, client: AsyncClient, auth_headers: dict):
        resp = await client.post("/api/groups", json={
            "name": "Тестовая команда",
            "description": "Описание команды",
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Тестовая команда"
        assert data["member_count"] == 1
        assert data["id"] > 0

    async def test_list_groups(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        await client.post("/api/groups", json={"name": "Team A"}, headers=auth_headers)

        resp = await client.get("/api/groups", headers=user_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["name"] == "Team A"

    async def test_list_groups_shows_my_status(self, client: AsyncClient, auth_headers: dict):
        await client.post("/api/groups", json={"name": "My Team"}, headers=auth_headers)
        resp = await client.get("/api/groups", headers=auth_headers)
        data = resp.json()
        assert data[0]["my_status"] == "approved"
        assert data[0]["my_role"] == "admin"

    async def test_get_group(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/groups", json={"name": "My Team"}, headers=auth_headers)).json()
        resp = await client.get(f"/api/groups/{created['id']}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "My Team"

    async def test_get_group_not_found(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get("/api/groups/999", headers=auth_headers)
        assert resp.status_code == 404

    async def test_update_group_as_admin(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Old Name"}, headers=auth_headers)).json()
        resp = await client.put(f"/api/groups/{created['id']}", json={"name": "New Name"}, headers=auth_headers)
        assert resp.status_code == 200

    async def test_update_group_as_non_member(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Old Name"}, headers=auth_headers)).json()
        resp = await client.put(f"/api/groups/{created['id']}", json={"name": "Hacked"}, headers=user_headers)
        assert resp.status_code == 403

    async def test_delete_group_as_creator(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/groups", json={"name": "ToDelete"}, headers=auth_headers)).json()
        resp = await client.delete(f"/api/groups/{created['id']}", headers=auth_headers)
        assert resp.status_code == 204

    async def test_delete_group_as_non_creator(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "ToDelete"}, headers=auth_headers)).json()
        resp = await client.delete(f"/api/groups/{created['id']}", headers=user_headers)
        assert resp.status_code == 403

    async def test_join_group(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        resp = await client.post(f"/api/groups/{created['id']}/join", headers=user_headers)
        assert resp.status_code == 200
        assert resp.json()["status"] == "pending"

    async def test_join_group_already_member(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        resp = await client.post(f"/api/groups/{created['id']}/join", headers=auth_headers)
        assert resp.status_code == 400

    async def test_leave_group(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        await client.post(f"/api/groups/{created['id']}/join", headers=user_headers)

        resp = await client.post(f"/api/groups/{created['id']}/leave", headers=auth_headers)
        assert resp.status_code == 200

    async def test_leave_group_not_member(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        resp = await client.post(f"/api/groups/{created['id']}/leave", headers=user_headers)
        assert resp.status_code == 403

    async def test_approve_member(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        gid = created["id"]
        await client.post(f"/api/groups/{gid}/join", headers=user_headers)

        resp = await client.patch(f"/api/groups/{gid}/members/{1}/approve", headers=auth_headers)
        assert resp.status_code == 200

    async def test_approve_member_non_admin(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        gid = created["id"]
        await client.post(f"/api/groups/{gid}/join", headers=user_headers)

        resp = await client.patch(f"/api/groups/{gid}/members/{1}/approve", headers=user_headers)
        assert resp.status_code == 403

    async def test_reject_member(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        gid = created["id"]
        await client.post(f"/api/groups/{gid}/join", headers=user_headers)

        resp = await client.patch(f"/api/groups/{gid}/members/{1}/reject", headers=auth_headers)
        assert resp.status_code == 200

    async def test_kick_member(self, client: AsyncClient, admin_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=admin_headers)).json()
        gid = created["id"]
        # Register a third user to be approved first
        await client.post("/api/auth/register", json={
            "email": "kickme@test.com", "password": "pass123", "full_name": "Kick Me",
        })
        login_resp = await client.post("/api/auth/login", data={
            "username": "kickme@test.com", "password": "pass123",
        })
        kick_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}
        await client.post(f"/api/groups/{gid}/join", headers=kick_headers)

        # Get members to find the kicked user
        members = (await client.get(f"/api/groups/{gid}/members", headers=admin_headers)).json()
        kick_user = [m for m in members if m["status"] == "pending"][0]

        resp = await client.delete(f"/api/groups/{gid}/members/{kick_user['user_id']}", headers=admin_headers)
        assert resp.status_code == 204

    async def test_kick_member_non_admin(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        gid = created["id"]
        resp = await client.delete(f"/api/groups/{gid}/members/1", headers=user_headers)
        assert resp.status_code == 403

    async def test_list_members(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        resp = await client.get(f"/api/groups/{created['id']}/members", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["role"] == "admin"
        assert data[0]["email"] == "test@test.com"

    async def test_change_role(self, client: AsyncClient, admin_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=admin_headers)).json()
        gid = created["id"]

        # Get creator and other user
        members = (await client.get(f"/api/groups/{gid}/members", headers=admin_headers)).json()

        resp = await client.put(f"/api/groups/{gid}/members/{1}/role", json={"role": "member"}, headers=admin_headers)
        assert resp.status_code == 200

    async def test_change_role_non_creator(self, client: AsyncClient, auth_headers: dict, user_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        gid = created["id"]
        resp = await client.put(f"/api/groups/{gid}/members/1/role", json={"role": "admin"}, headers=user_headers)
        assert resp.status_code == 403

    async def test_invite_user(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        gid = created["id"]

        # Register a user to invite
        await client.post("/api/auth/register", json={
            "email": "invitee@test.com", "password": "pass123", "full_name": "Invitee",
        })
        login_resp = await client.post("/api/auth/login", data={
            "username": "invitee@test.com", "password": "pass123",
        })
        invitee = login_resp.json()
        invitee_id = (await client.get("/api/auth/me", headers={"Authorization": f"Bearer {invitee['access_token']}"})).json()["id"]

        resp = await client.post(f"/api/groups/{gid}/invite?user_id={invitee_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert "invited" in resp.json()

    async def test_invite_twice(self, client: AsyncClient, auth_headers: dict):
        created = (await client.post("/api/groups", json={"name": "Team"}, headers=auth_headers)).json()
        gid = created["id"]

        await client.post(f"/api/groups/{gid}/invite?user_id=1", headers=auth_headers)
        resp = await client.post(f"/api/groups/{gid}/invite?user_id=1", headers=auth_headers)
        assert resp.status_code == 400

    async def test_search_users(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get("/api/users/search", params={"q": "Test"}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["full_name"] == "Test User"

    async def test_search_users_empty_query(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get("/api/users/search", headers=auth_headers)
        assert resp.status_code == 422
