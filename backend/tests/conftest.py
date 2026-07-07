import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import get_db
from app.models.base import Base
from app.models.user import User
from app.models.group import Group
from app.models.group_member import GroupMember
from app.models.initiative import Initiative
from app.models.contact import Contact
from app.services.auth_config import get_jwt_strategy as _get_jwt_strategy
import bcrypt as _bcrypt

TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_async_session = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture(scope="session")
async def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    await loop.shutdown_asyncgens()
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


async def _make_user(
    email: str,
    password: str,
    full_name: str = "Test User",
) -> tuple[User, dict]:
    """Create user directly in DB + return (user, auth_headers)."""
    async with test_async_session() as session:
        hashed = _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()
        user = User(
            email=email,
            hashed_password=hashed,
            full_name=full_name,
            is_active=True,
            is_superuser=False,
            is_verified=False,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        token = await _get_jwt_strategy().write_token(user)
        return user, {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as session:
        yield session


@pytest_asyncio.fixture
async def auth_headers() -> dict:
    """Create default test user + return auth headers"""
    _, headers = await _make_user("test@test.com", "testpass123", "Test User")
    return headers


@pytest_asyncio.fixture
async def admin_headers() -> dict:
    """Create admin user"""
    _, headers = await _make_user("admin@test.com", "adminpass123", "Admin User")
    return headers


@pytest_asyncio.fixture
async def user_headers() -> dict:
    """Create second user"""
    _, headers = await _make_user("user2@test.com", "userpass123", "Regular User")
    return headers


SAMPLE_INITIATIVE = {
    "q": "Q1",
    "account": "Газпром нефть",
    "unit": "ИТ-департамент",
    "lpr": "Иванов Иван",
    "action": "Внедрение CRM",
    "kpi": "Повышение конверсии на 20%",
    "priority": "high",
    "status": "active",
    "owner": "Петров Петр",
    "potential": 15.5,
    "next_date": "01.06.2026",
    "comment": "Тестовый проект",
}

SAMPLE_CONTACT = {
    "account": "Газпром нефть",
    "unit": "ИТ-департамент",
    "name": "Иванов Иван Иванович",
    "email": "ivanov@example.com",
    "phone": "+7 (999) 123-45-67",
    "last_date": "15.03.2026",
    "topic": "Обсуждение CRM",
    "next_step": "Отправить КП",
}
