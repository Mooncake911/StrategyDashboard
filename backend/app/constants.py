from enum import Enum


class InitiativeStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    WAITING = "waiting"
    DONE = "done"
    RISK = "risk"


class Priority(str, Enum):
    HIGH = "high"
    CRITICAL = "critical"


class MemberRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


class MemberStatus(str, Enum):
    APPROVED = "approved"
    PENDING = "pending"
    REJECTED = "rejected"


STATUS_LABELS = {
    "pending": "Не начат",
    "active": "В работе",
    "waiting": "Ожидание",
    "done": "Выполнен",
    "risk": "Под риском",
}

STATUS_LABELS_EMOJI = {
    "pending": "⬜ Не начат",
    "active": "🔵 В работе",
    "waiting": "🟡 Ожидание",
    "done": "🟢 Выполнен",
    "risk": "🔴 Под риском",
}

Q_ORDER = ["Q1", "Q2", "Q3", "Q4"]

Q_META = {
    "Q1": {"label": "1 квартал"},
    "Q2": {"label": "2 квартал"},
    "Q3": {"label": "3 квартал"},
    "Q4": {"label": "4 квартал"},
}

HEADERS = [
    "Квартал", "Аккаунт", "Объект / Подразделение", "Целевые ЛПР",
    "Ключевое действие", "Измеримый результат (KPI)", "Приоритет", "Статус",
    "Ответственный", "Потенциал, ₽ млн", "Дата след. шага", "Комментарий",
]

CONTACT_HEADERS = [
    "Аккаунт", "Объект", "ФИО / Должность", "Email", "Телефон",
    "Последний контакт", "Тема", "Следующий шаг",
]
