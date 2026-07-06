# Strategy Dashboard

Дашборд для управления дорожной картой продаж Systeme Electric 2026.

**Стек:** FastAPI + SQLAlchemy (async) + React (Vite) + Docker

## Быстрый старт

```bash
# Запуск в фоне
docker compose up --build -d

# Просмотр логов
docker compose logs -f

# Остановка
docker compose down
```

Откройте **[http://localhost:8000](http://localhost:8000)**

## Архитектура

```
http://localhost:8000
         │
    ┌────┴────┐
    │  nginx  │  frontend-контейнер
    ├─────────┤
    │ /       │  → React SPA (статика /app/dist)
    │ /api/*  │  → proxy_pass http://backend:8000
    └────┬────┘
         │
    ┌────┴────┐
    │ FastAPI │  backend-контейнер (без внешнего порта)
    └─────────┘
```

Единая точка входа — **один порт 8000**. Nginx раздаёт фронтенд и проксирует API-запросы на бэкенд.

## Запуск без Docker

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Фронтенд в dev-режиме запускается на `:5173` и проксирует `/api/` на `:8000`.

## Тесты

```bash
# В контейнере
docker compose exec backend python3 -m pytest tests -v

# Локально
cd backend
pip install pytest httpx pytest-asyncio
python3 -m pytest tests -v
```

33 теста: CRUD инициатив, контакты, импорт/экспорт Excel, аналитика.

## API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/health | Проверка |
| GET | /api/initiatives | Список инициатив (`?q=&account=&status=&search=`) |
| POST | /api/initiatives | Создать инициативу |
| GET | /api/initiatives/{id} | Получить инициативу |
| PUT | /api/initiatives/{id} | Обновить инициативу |
| DELETE | /api/initiatives/{id} | Удалить инициативу |
| PATCH | /api/initiatives/{id}/status | Сменить статус |
| GET | /api/contacts | Список контактов |
| PUT | /api/contacts/{id} | Обновить контакт |
| POST | /api/import | Импорт .xlsx |
| GET | /api/export | Экспорт .xlsx |
| GET | /api/analytics/kpi | KPI сводка |
| GET | /api/analytics/by-quarter | По кварталам |
| GET | /api/analytics/by-account | По аккаунтам |
| GET | /api/analytics/by-owner | По ответственным |
| GET | /api/analytics/status-distribution | По статусам |

Swagger-документация: [http://localhost:8000/docs](http://localhost:8000/docs)

## Структура проекта

```
backend/
├── app/
│   ├── main.py              # FastAPI, CORS, lifespan
│   ├── config.py            # Pydantic Settings
│   ├── database.py          # async SQLAlchemy engine
│   ├── models/              # Initiative, Contact ORM
│   ├── schemas/             # Pydantic request/response
│   ├── routers/             # 4 роутера
│   └── services/            # Excel, аналитика
├── tests/                   # 33 pytest-теста
├── Dockerfile
└── requirements.txt

frontend/
├── src/
│   ├── api/                 # axios-клиенты
│   ├── components/          # UI-компоненты
│   ├── pages/               # 4 страницы
│   └── hooks/               # React-хуки
├── Dockerfile + nginx.conf

docker-compose.yml           # backend + frontend
```
