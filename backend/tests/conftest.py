import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.database import get_db
from app.models.base import Base

TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
test_async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


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


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_async_session() as session:
        yield session


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
