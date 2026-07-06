import React from 'react'
import { Q_META, sById } from '../constants'

const Q_ORDER = ['Q1', 'Q2', 'Q3', 'Q4']

export default function GanttPage({ rows }) {
  if (!rows.length) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#6B7A99' }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Нет данных</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '14px 20px', overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '195px repeat(4,1fr)', borderBottom: '2px solid #DDE3EF', minWidth: 700 }}>
        <div style={{ padding: '7px 10px', fontSize: 10, fontWeight: 700, color: '#6B7A99' }}>
          Инициатива
        </div>
        {['Q1 · Янв–Мар', 'Q2 · Апр–Июн', 'Q3 · Июл–Сен', 'Q4 · Окт–Дек'].map((h, i) => (
          <div key={i} style={{
            padding: '7px 10px', fontSize: 10, fontWeight: 700, color: '#6B7A99',
            textTransform: 'uppercase', letterSpacing: '.05em', borderLeft: '1px solid #DDE3EF',
            background: Object.values(Q_META)[i].bg,
          }}>
            {h}
          </div>
        ))}
      </div>

      {rows.map(row => {
        const qi = Q_ORDER.indexOf(row.q)
        const s = sById[row.status]
        return (
          <div key={row.id} style={{
            display: 'grid', gridTemplateColumns: '195px 1fr',
            borderBottom: '1px solid #DDE3EF', minHeight: 32, alignItems: 'center', minWidth: 700,
          }}>
            <div style={{ fontSize: 10, padding: '4px 10px 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#6B7A99', marginRight: 3 }}>
                {(row.account || '').slice(0, 3).toUpperCase()}
              </span>
              {row.unit}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
              {[0, 1, 2, 3].map(ci => (
                <div key={ci} style={{
                  borderLeft: '1px solid #DDE3EF', minHeight: 32, display: 'flex',
                  alignItems: 'center', padding: '3px 5px',
                  background: ci === qi ? Object.values(Q_META)[ci].bg : 'transparent',
                }}>
                  {ci === qi && (
                    <div style={{
                      height: 18, borderRadius: 4, display: 'flex', alignItems: 'center',
                      padding: '0 7px', fontSize: 9, fontWeight: 600, color: '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      width: '95%', background: Object.values(Q_META)[ci].stripe,
                      opacity: row.status === 'risk' ? 0.5 : row.status === 'done' ? 1 : 0.85,
                    }}>
                      {s?.icon} {(row.action || '').slice(0, 26)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
