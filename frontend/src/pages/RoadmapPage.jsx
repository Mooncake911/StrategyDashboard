import { useMemo, useState } from 'react'
import { Q_META, STATUSES } from '../constants'
import { colors, borderRadius, typography, shadows } from '../theme'
import InlineCell from '../components/InlineCell'
import StatusPill from '../components/StatusPill'
import TabToolbar from '../components/TabToolbar'
import { useRole } from '../hooks/useRole'

const Q_ORDER = ['Q1', 'Q2', 'Q3', 'Q4']

export default function RoadmapPage({ rows, updateRow, changeStatus, removeRow, groupId }) {
  const { isAdmin } = useRole(groupId)
  const [qF, setQF] = useState('all')
  const [acF, setAcF] = useState('all')
  const [stF, setStF] = useState('all')
  const [search, setSearch] = useState('')

  const accounts = useMemo(() => [...new Set(rows.map(r => r.account))], [rows])

  const visible = useMemo(() =>
    rows.filter(r =>
      (qF === 'all' || r.q === qF) &&
      (acF === 'all' || r.account === acF) &&
      (stF === 'all' || r.status === stF) &&
      (!search ||
        [r.account, r.unit, r.lpr, r.action, r.kpi, r.comment, r.owner]
          .join(' ').toLowerCase().includes(search.toLowerCase()))
    ), [rows, qF, acF, stF, search])

  const byQ = useMemo(() =>
    Q_ORDER
      .map(q => ({ q, rows: visible.filter(r => r.q === q), all: rows.filter(r => r.q === q) }))
      .filter(g => g.rows.length),
    [visible, rows])

  return (
    <>
      <TabToolbar>
        <TabToolbar.Label>Фильтр</TabToolbar.Label>
        <TabToolbar.Select
          value={qF}
          onChange={e => setQF(e.target.value)}
          options={[{ value: 'all', label: 'Все кварталы' }, { value: 'Q1', label: '1 квартал' }, { value: 'Q2', label: '2 квартал' }, { value: 'Q3', label: '3 квартал' }, { value: 'Q4', label: '4 квартал' }]}
        />
        <TabToolbar.Select
          value={acF}
          onChange={e => setAcF(e.target.value)}
          options={[{ value: 'all', label: 'Все аккаунты' }, ...accounts.map(a => ({ value: a, label: a }))]}
        />
        <TabToolbar.Select
          value={stF}
          onChange={e => setStF(e.target.value)}
          options={[{ value: 'all', label: 'Все статусы' }, ...STATUSES.map(s => ({ value: s.id, label: `${s.icon} ${s.label}` }))]}
        />
        <TabToolbar.Search value={search} onChange={e => setSearch(e.target.value)} />
        <TabToolbar.Spacer />
        <TabToolbar.Stat>Показано {visible.length} / {rows.length}</TabToolbar.Stat>
      </TabToolbar>

      <div style={{ padding: '0 20px 32px', overflowX: 'auto' }}>
        {byQ.map(({ q, rows: qr, all }) => {
          const qDone = all.filter(r => r.status === 'done').length
          const qPct = all.length ? Math.round(qDone / all.length * 100) : 0
          const { bg, stripe, label } = Q_META[q]

          return (
            <div key={q} style={{ marginTop: 16, borderRadius: '8px 8px 0 0', overflow: 'hidden', boxShadow: shadows.card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: stripe, color: colors.textOnDark, fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                <span>{label.toUpperCase()}</span>
                <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 4, padding: '1px 7px', fontSize: 10 }}>{qr.length}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10 }}>{qPct}% выполнено</span>
                <div style={{ width: 70, background: 'rgba(255,255,255,.25)', borderRadius: 4, height: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${qPct}%`, height: '100%', background: 'rgba(255,255,255,.9)', transition: 'width .4s' }} />
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: typography.sizes.sm, background: colors.white }}>
                <thead>
                  <tr style={{ background: colors.borderLight }}>
                    {['Аккаунт', 'Объект / Подразделение', 'Целевые ЛПР', 'Ключевое действие', 'Измеримый результат (KPI)', 'Приоритет', 'Статус', 'Ответственный', '₽ млн', 'Дата', 'Комментарий', ''].map((h, i) => (
                      <th key={h || `col-${i}`} style={{
                        padding: '8px 10px', textAlign: 'left', fontSize: typography.sizes.xxs, fontWeight: typography.weights.bold,
                        color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em',
                        borderBottom: `1.5px solid ${colors.border}`, whiteSpace: 'nowrap',
                        width: [105, 185, 160, null, null, 85, 135, 100, 65, 85, 155, 28][i] || 'auto',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {qr.map(row => (
                    <tr key={row.id} style={{
                      background: row.status === 'done' ? colors.successBg : row.status === 'risk' ? colors.dangerBg : bg,
                    }}>
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top', fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs }}>
                        {row.account}
                      </td>
                      {[['unit', null], ['lpr', colors.textSecondary], ['action', null], ['kpi', colors.blueMedium]].map(([f, clr]) => (
                        <td key={f} style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top', color: clr || 'inherit', lineHeight: 1.4 }}>
                          <InlineCell rowId={row.id} field={f} value={row[f]} onCommit={updateRow} editable={isAdmin} />
                        </td>
                      ))}
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', padding: '2px 7px',
                          borderRadius: borderRadius.full, fontSize: typography.sizes.xxs, fontWeight: typography.weights.bold,
                          background: row.priority === 'critical' ? colors.dangerBg : colors.warningBg,
                          color: row.priority === 'critical' ? colors.danger : colors.warning,
                        }}>
                          {row.priority === 'critical' ? '🔴 Крит.' : '🟡 Выс.'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top' }}>
                        <StatusPill rowId={row.id} status={row.status} onChange={changeStatus} disabled={!isAdmin} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top' }}>
                        <InlineCell rowId={row.id} field="owner" value={row.owner} onCommit={updateRow} editable={isAdmin} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top', textAlign: 'right', fontWeight: typography.weights.semibold, color: row.potential > 0 ? colors.navy : '#aaa' }}>
                        <InlineCell rowId={row.id} field="potential" value={row.potential > 0 ? String(row.potential) : ''} right onCommit={updateRow} editable={isAdmin} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top', color: colors.textSecondary, fontSize: typography.sizes.xs }}>
                        <InlineCell rowId={row.id} field="next_date" value={row.next_date} onCommit={updateRow} editable={isAdmin} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top' }}>
                        <InlineCell rowId={row.id} field="comment" value={row.comment} onCommit={updateRow} editable={isAdmin} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: `1px solid ${colors.border}`, verticalAlign: 'top', textAlign: 'center' }}>
                        {isAdmin && (
                          <span
                            style={{ cursor: 'pointer', color: colors.danger, fontSize: typography.sizes.md, fontWeight: typography.weights.bold }}
                            onClick={() => { if (confirm('Удалить эту инициативу?')) removeRow(row.id) }}
                            title="Удалить"
                          >
                            ✕
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </>
  )
}
