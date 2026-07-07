from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from tests.conftest import SAMPLE_CONTACT


class TestContacts:
    async def test_list_empty(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get("/api/contacts", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_after_import(self, client: AsyncClient, db_session: AsyncSession, auth_headers: dict):
        from app.models.contact import Contact
        contact = Contact(**SAMPLE_CONTACT)
        db_session.add(contact)
        await db_session.commit()

        resp = await client.get("/api/contacts", headers=auth_headers)
        data = resp.json()
        assert len(data) == 1
        assert data[0]["email"] == "ivanov@example.com"
        assert data[0]["name"] == "Иванов Иван Иванович"

    async def test_update_contact(self, client: AsyncClient, db_session: AsyncSession, auth_headers: dict):
        from app.models.contact import Contact
        contact = Contact(**SAMPLE_CONTACT)
        db_session.add(contact)
        await db_session.commit()
        await db_session.refresh(contact)

        resp = await client.put(f"/api/contacts/{contact.id}", json={"email": "new@example.com"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["email"] == "new@example.com"
        assert resp.json()["phone"] == "+7 (999) 123-45-67"

    async def test_update_not_found(self, client: AsyncClient, auth_headers: dict):
        resp = await client.put("/api/contacts/999", json={"name": "x"}, headers=auth_headers)
        assert resp.status_code == 404

    async def test_multiple_contacts(self, client: AsyncClient, db_session: AsyncSession, auth_headers: dict):
        from app.models.contact import Contact
        for i in range(3):
            db_session.add(Contact(**SAMPLE_CONTACT | {"email": f"user{i}@test.com"}))
        await db_session.commit()

        resp = await client.get("/api/contacts", headers=auth_headers)
        assert len(resp.json()) == 3
