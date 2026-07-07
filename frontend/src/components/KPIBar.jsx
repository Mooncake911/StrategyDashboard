import { colors, borderRadius, typography } from '../theme'

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
      {items.map((item) => (
        <div
          key={item.l}
          style={{
            background: item.accent ? colors.navy : colors.white,
            border: `1.5px solid ${item.red ? colors.danger : colors.border}`,
            borderRadius: borderRadius.lg, padding: '12px 14px',
          }}
        >
          <div
            style={{
              fontSize: 22, fontWeight: typography.weights.bold,
              color: item.accent ? colors.textOnDark : item.red ? colors.danger : colors.navy,
              lineHeight: 1,
            }}
          >
            {item.v}
          </div>
          <div style={{ fontSize: typography.sizes.xs, color: item.accent ? colors.blueLight : colors.textSecondary, marginTop: 4 }}>
            {item.l}
          </div>
          {item.accent && (
            <div style={{ background: 'rgba(255,255,255,.2)', borderRadius: 4, height: 4, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ width: `${kpi.pct}%`, height: '100%', background: colors.blueBright, borderRadius: 4, transition: 'width .5s' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
