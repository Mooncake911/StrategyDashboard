import React from 'react'

export default function KPIBar({ kpi }) {
  if (!kpi) return null
  const items = [
    { v: `${kpi.pct}%`,  l: 'Выполнено',      accent: true },
    { v: kpi.done,       l: 'Закрыто задач' },
    { v: kpi.active,     l: 'В работе' },
    { v: kpi.risk,       l: 'Под риском',      red: kpi.risk > 0 },
    { v: `${kpi.potential.toLocaleString('ru')} ₽м`, l: 'Потенциал' },
    { v: kpi.total,      l: 'Инициатив' },
  ]

  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(125px,1fr))',
        gap: 10, padding: '12px 20px',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: item.accent ? '#1A2C4E' : '#fff',
            border: `1.5px solid ${item.red ? '#C00000' : '#DDE3EF'}`,
            borderRadius: 10, padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: 22, fontWeight: 700,
              color: item.accent ? '#fff' : item.red ? '#C00000' : '#1A2C4E',
              lineHeight: 1,
            }}
          >
            {item.v}
          </div>
          <div style={{ fontSize: 10, color: item.accent ? '#7EA8E0' : '#6B7A99', marginTop: 4 }}>
            {item.l}
          </div>
          {item.accent && (
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 4, height: 4, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ width: `${kpi.pct}%`, height: '100%', background: '#4A9EE8', borderRadius: 4, transition: 'width .5s' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
