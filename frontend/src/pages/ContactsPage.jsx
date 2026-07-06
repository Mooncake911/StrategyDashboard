import React from 'react'
import InlineCell from '../components/InlineCell'

const COLUMNS = [
  { h: 'Аккаунт', f: 'account' },
  { h: 'Объект', f: 'unit' },
  { h: 'ФИО / Должность', f: 'name', bold: true },
  { h: 'Email', f: 'email', color: '#1456A8' },
  { h: 'Телефон', f: 'phone' },
  { h: 'Последний контакт', f: 'last_date', color: '#6B7A99' },
  { h: 'Тема', f: 'topic', bold: true },
  { h: 'Следующий шаг', f: 'next_step', color: '#1A5C3A', bold: true },
]

export default function ContactsPage({ contacts, updateContact }) {
  if (!contacts.length) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#6B7A99' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Нет контактов</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>
          Они загружаются из листа «Трекер контактов» вашего Excel-файла
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '14px 20px' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: 11,
        background: '#fff', borderRadius: 8, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}>
        <thead>
          <tr style={{ background: '#1A2C4E' }}>
            {COLUMNS.map(col => (
              <th key={col.f} style={{
                padding: '9px 10px', textAlign: 'left', fontSize: 9,
                fontWeight: 700, color: '#7EA8E0', textTransform: 'uppercase',
                letterSpacing: '.06em',
              }}>
                {col.h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFD' }}>
              <td style={{ padding: '8px 10px', borderBottom: '1px solid #DDE3EF', fontWeight: 600, fontSize: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: c.account?.includes('Газпром') ? '#2E5FA3' : '#4A6FA5',
                    color: '#fff', display: 'inline-flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0,
                  }}>
                    {(c.account || '?')[0]}
                  </span>
                  {c.account}
                </span>
              </td>
              {COLUMNS.slice(1).map(col => (
                <td key={col.f} style={{
                  padding: '8px 10px', borderBottom: '1px solid #DDE3EF',
                  verticalAlign: 'top', color: col.color || 'inherit',
                  fontWeight: col.bold ? 600 : 400, lineHeight: 1.4,
                }}>
                  <InlineCell
                    rowId={c.id} field={col.f} value={c[col.f]}
                    onCommit={updateContact}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
