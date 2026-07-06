from pydantic import BaseModel


class KPISummary(BaseModel):
    total: int
    done: int
    pct: int
    active: int
    risk: int
    critical: int
    potential: float
    closed_potential: float


class QuarterStats(BaseModel):
    q: str
    total: int
    done: int
    pct: int


class AccountStats(BaseModel):
    account: str
    potential: float
    pct: int


class OwnerStats(BaseModel):
    owner: str
    total: int
    done: int


class StatusDistribution(BaseModel):
    status: str
    label: str
    count: int
    pct: int
