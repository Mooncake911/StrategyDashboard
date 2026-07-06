import React, { useMemo, useState } from 'react'
import { Q_META } from '../constants'
import InlineCell from '../components/InlineCell'
import StatusPill from '../components/StatusPill'
import FilterBar from '../components/FilterBar'

const Q_ORDER = ['Q1', 'Q2', 'Q3', 'Q4']

export default function RoadmapPage({ rows, updateRow, changeStatus, removeRow }) {
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
      <FilterBar
        qFilter={qF} setQFilter={setQF}
        acFilter={acF} setAcFilter={setAcF}
        stFilter={stF} setStFilter={setStF}
        search={search} setSearch={setSearch}
        accounts={accounts}
        visibleCount={visible.length}
        totalCount={rows.length}
      />

      <div style={{ padding: '0 20px 32px', overflowX: 'auto' }}>
        {byQ.map(({ q, rows: qr, all }) => {
          const qDone = all.filter(r => r.status === 'done').length
          const qPct = all.length ? Math.round(qDone / all.length * 100) : 0
          const { bg, stripe, label } = Q_META[q]

          return (
            <div key={q} style={{ marginTop: 16, borderRadius: '8px 8px 0 0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: stripe, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                <span>{label.toUpperCase()}</span>
                <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 4, padding: '1px 7px', fontSize: 10 }}>{qr.length}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10 }}>{qPct}% выполнено</span>
                <div style={{ width: 70, background: 'rgba(255,255,255,.25)', borderRadius: 4, height: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${qPct}%`, height: '100%', background: 'rgba(255,255,255,.9)', transition: 'width .4s' }} />
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#F0F4FA' }}>
                    {['Аккаунт', 'Объект / Подразделение', 'Целевые ЛПР', 'Ключевое действие', 'Измеримый результат (KPI)', 'Приоритет', 'Статус', 'Ответственный', '₽ млн', 'Дата', 'Комментарий', ''].map((h, i) => (
                      <th key={i} style={{
                        padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700,
                        color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '.06em',
                        borderBottom: '1.5px solid #DDE3EF', whiteSpace: 'nowrap',
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
                      background: row.status === 'done' ? '#E8F5EC' : row.status === 'risk' ? '#FEF0F0' : bg,
                    }}>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top', fontWeight: 600, fontSize: 10 }}>
                        {row.account}
                      </td>
                      {[['unit', null], ['lpr', '#6B7A99'], ['action', null], ['kpi', '#4A6FA5']].map(([f, clr]) => (
                        <td key={f} style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top', color: clr || 'inherit', lineHeight: 1.4 }}>
                          <InlineCell rowId={row.id} field={f} value={row[f]} onCommit={updateRow} />
                        </td>
                      ))}
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', padding: '2px 7px',
                          borderRadius: 20, fontSize: 9, fontWeight: 700,
                          background: row.priority === 'critical' ? '#FEE7E7' : '#FFF4D6',
                          color: row.priority === 'critical' ? '#C00000' : '#B86B00',
                        }}>
                          {row.priority === 'critical' ? '🔴 Крит.' : '🟡 Выс.'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top' }}>
                        <StatusPill rowId={row.id} status={row.status} onChange={changeStatus} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top' }}>
                        <InlineCell rowId={row.id} field="owner" value={row.owner} onCommit={updateRow} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top', textAlign: 'right', fontWeight: 600, color: row.potential > 0 ? '#1A2C4E' : '#aaa' }}>
                        <InlineCell rowId={row.id} field="potential" value={row.potential > 0 ? String(row.potential) : ''} right onCommit={updateRow} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top', color: '#6B7A99', fontSize: 10 }}>
                        <InlineCell rowId={row.id} field="next_date" value={row.next_date} onCommit={updateRow} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top' }}>
                        <InlineCell rowId={row.id} field="comment" value={row.comment} onCommit={updateRow} />
                      </td>
                      <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', verticalAlign: 'top', textAlign: 'center' }}>
                        <span
                          style={{ cursor: 'pointer', color: '#C00000', fontSize: 12, fontWeight: 700 }}
                          onClick={() => { if (confirm('Удалить эту инициативу?')) removeRow(row.id) }}
                          title="Удалить"
                        >
                          ✕
                        </span>
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
