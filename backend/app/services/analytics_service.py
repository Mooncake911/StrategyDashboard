from typing import Any, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.initiative import Initiative
from app.constants import STATUS_LABELS, Q_ORDER


async def _fetch_all(db: AsyncSession) -> Sequence[Any]:
    result = await db.execute(select(Initiative))
    return result.scalars().all()


async def get_kpi_summary(db: AsyncSession) -> dict:
    rows = await _fetch_all(db)
    total = len(rows)
    done = sum(1 for r in rows if r.status == "done")
    return {
        "total": total,
        "done": done,
        "pct": round(done / total * 100) if total else 0,
        "active": sum(1 for r in rows if r.status == "active"),
        "risk": sum(1 for r in rows if r.status == "risk"),
        "critical": sum(1 for r in rows if r.priority == "critical"),
        "potential": sum(r.potential or 0 for r in rows),
        "closed_potential": sum(r.potential or 0 for r in rows if r.status == "done"),
    }


async def get_quarter_stats(db: AsyncSession) -> list[dict]:
    rows = await _fetch_all(db)
    q_map = {q: [] for q in Q_ORDER}
    for r in rows:
        q_map.setdefault(r.q, []).append(r)

    return [
        {"q": q, "total": len(qr), "done": sum(1 for r in qr if r.status == "done"),
         "pct": round(sum(1 for r in qr if r.status == "done") / len(qr) * 100) if qr else 0}
        for q in Q_ORDER if (qr := q_map.get(q, []))
    ]


async def get_account_stats(db: AsyncSession) -> list[dict]:
    rows = await _fetch_all(db)
    ac_map: dict[str, float] = {}
    for r in rows:
        if r.account:
            ac_map[r.account] = ac_map.get(r.account, 0) + (r.potential or 0)

    total_pot = sum(ac_map.values())
    return [
        {"account": ac, "potential": pot, "pct": round(pot / total_pot * 100) if total_pot else 0}
        for ac, pot in sorted(ac_map.items(), key=lambda x: -x[1])
    ]


async def get_owner_stats(db: AsyncSession) -> list[dict]:
    rows = await _fetch_all(db)
    own_map: dict[str, dict] = {}
    for r in rows:
        if r.owner:
            entry = own_map.setdefault(r.owner, {"total": 0, "done": 0})
            entry["total"] += 1
            if r.status == "done":
                entry["done"] += 1

    return [
        {"owner": owner, "total": data["total"], "done": data["done"]}
        for owner, data in sorted(own_map.items(), key=lambda x: -x[1]["total"])
    ]


async def get_status_distribution(db: AsyncSession) -> list[dict]:
    rows = await _fetch_all(db)
    total = len(rows)
    count_map: dict[str, int] = {}
    for r in rows:
        count_map[r.status] = count_map.get(r.status, 0) + 1

    return [
        {
            "status": s_id,
            "label": STATUS_LABELS.get(s_id, s_id),
            "count": count_map.get(s_id, 0),
            "pct": round(count_map.get(s_id, 0) / total * 100) if total else 0,
        }
        for s_id in ["pending", "active", "waiting", "done", "risk"]
    ]
