import React, { useMemo } from 'react'
import { Q_META, STATUSES } from '../constants'

function useKPI(rows) {
  return useMemo(() => {
    const total = rows.length
    const done = rows.filter(r => r.status === 'done').length
    const active = rows.filter(r => r.status === 'active').length
    const risk = rows.filter(r => r.status === 'risk').length
    const critical = rows.filter(r => r.priority === 'critical').length
    const potential = rows.reduce((s, r) => s + (r.potential || 0), 0)
    const closed_potential = rows.filter(r => r.status === 'done').reduce((s, r) => s + (r.potential || 0), 0)
    return { total, done, active, risk, critical, potential, closed_potential }
  }, [rows])
}

function useQuarterStats(rows) {
  return useMemo(() => {
    return ['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
      const qr = rows.filter(r => r.q === q)
      const done = qr.filter(r => r.status === 'done').length
      return { q, total: qr.length, done, pct: qr.length ? Math.round(done / qr.length * 100) : 0 }
    }).filter(s => s.total > 0)
  }, [rows])
}

function useAccountStats(rows) {
  return useMemo(() => {
    const map = {}
    for (const r of rows) {
      if (r.account) map[r.account] = (map[r.account] || 0) + (r.potential || 0)
    }
    const total = Object.values(map).reduce((s, v) => s + v, 0)
    return Object.entries(map)
      .map(([account, potential]) => ({ account, potential, pct: total ? Math.round(potential / total * 100) : 0 }))
      .sort((a, b) => b.potential - a.potential)
  }, [rows])
}

function useOwnerStats(rows) {
  return useMemo(() => {
    const map = {}
    for (const r of rows) {
      if (!r.owner) continue
      if (!map[r.owner]) map[r.owner] = { total: 0, done: 0 }
      map[r.owner].total++
      if (r.status === 'done') map[r.owner].done++
    }
    return Object.entries(map)
      .map(([owner, data]) => ({ owner, ...data }))
      .sort((a, b) => b.total - a.total)
  }, [rows])
}

function useStatusDistribution(rows) {
  return useMemo(() => {
    const total = rows.length
    const map = {}
    for (const r of rows) map[r.status] = (map[r.status] || 0) + 1
    return STATUSES.map(s => ({
      status: s.id, label: s.label,
      count: map[s.id] || 0,
      pct: total ? Math.round((map[s.id] || 0) / total * 100) : 0,
    }))
  }, [rows])
}

export default function KPIPage({ rows }) {
  const kpi = useKPI(rows)
  const quarterStats = useQuarterStats(rows)
  const accountStats = useAccountStats(rows)
  const ownerStats = useOwnerStats(rows)
  const statusDist = useStatusDistribution(rows)

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { v: kpi.total, l: 'Всего инициатив', i: '📋' },
          { v: kpi.critical, l: 'Критических', i: '🔴' },
          { v: kpi.done, l: 'Выполнено', i: '✅' },
          { v: kpi.active, l: 'В работе', i: '🔵' },
          { v: kpi.risk, l: 'Под риском', i: '⚠️' },
          { v: `${kpi.potential.toLocaleString('ru')} ₽м`, l: 'Общий потенциал', i: '💰' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', border: '1.5px solid #DDE3EF', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{k.i}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1A2C4E', lineHeight: 1 }}>{k.v}</div>
            <div style={{ fontSize: 10, color: '#6B7A99', marginTop: 4 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: '#fff', border: '1.5px solid #DDE3EF', borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1A2C4E' }}>Прогресс по кварталам</div>
          {quarterStats.map(q => (
            <div key={q.q} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{Q_META[q.q]?.label || q.q}</span>
                <span style={{ color: '#6B7A99' }}>{q.done}/{q.total} · {q.pct}%</span>
              </div>
              <div style={{ background: '#DDE3EF', borderRadius: 4, height: 7, overflow: 'hidden' }}>
                <div style={{ width: `${q.pct}%`, height: '100%', background: Q_META[q.q]?.stripe || '#2E5FA3', borderRadius: 4, transition: 'width .5s' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #DDE3EF', borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1A2C4E' }}>Распределение по статусам</div>
          {statusDist.map(s => {
            const meta = STATUSES.find(st => st.id === s.status)
            return (
              <div key={s.status} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, color: meta?.color }}>{meta?.icon} {s.label}</span>
                  <span style={{ color: '#6B7A99' }}>{s.count} ({s.pct}%)</span>
                </div>
                <div style={{ background: '#DDE3EF', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: meta?.color || '#6B7A99', borderRadius: 4, transition: 'width .5s' }} />
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #DDE3EF', borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1A2C4E' }}>Потенциал по аккаунтам</div>
          {accountStats.map(ac => (
            <div key={ac.account} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{ac.account}</span>
                <span style={{ color: '#6B7A99' }}>{ac.potential.toLocaleString('ru')} ₽м · {ac.pct}%</span>
              </div>
              <div style={{ background: '#DDE3EF', borderRadius: 4, height: 7, overflow: 'hidden' }}>
                <div style={{ width: `${ac.pct}%`, height: '100%', background: '#2E5FA3', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #DDE3EF', borderRadius: 10, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: '#1A2C4E' }}>Нагрузка по ответственным</div>
          {ownerStats.map(o => (
            <div key={o.owner} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 11 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#2E5FA3', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 11, flexShrink: 0,
              }}>
                {(o.owner || '?')[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{o.owner}</div>
                <div style={{ color: '#6B7A99', fontSize: 10 }}>{o.total} инициатив · {o.done} выполнено</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
                {rows.filter(r => r.owner === o.owner).slice(0, 5).map(r => (
                  <div key={r.id} title={r.action}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: (STATUSES.find(s => s.id === r.status) || {}).color || '#ccc',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
