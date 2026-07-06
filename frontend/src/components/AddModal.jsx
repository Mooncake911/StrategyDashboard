import React, { useState } from 'react'

const FIELDS = [
  { l: 'Квартал', f: 'q', type: 'select', opts: [['Q1', '1 квартал'], ['Q2', '2 квартал'], ['Q3', '3 квартал'], ['Q4', '4 квартал']] },
  { l: 'Аккаунт', f: 'account' },
  { l: 'Объект / Подразделение', f: 'unit', full: true },
  { l: 'Целевые ЛПР', f: 'lpr', full: true },
  { l: 'Ключевое действие', f: 'action', full: true, textarea: true },
  { l: 'Измеримый результат (KPI)', f: 'kpi', full: true, textarea: true },
  { l: 'Приоритет', f: 'priority', type: 'select', opts: [['critical', '🔴 Критический'], ['high', '🟡 Высокий']] },
  { l: 'Ответственный', f: 'owner' },
  { l: 'Потенциал, ₽ млн', f: 'potential', type: 'number' },
  { l: 'Дата следующего шага', f: 'next_date', placeholder: 'дд.мм.гггг' },
  { l: 'Комментарий', f: 'comment', full: true, textarea: true },
]

export default function AddModal({ onClose, onAdd }) {
  const [data, setData] = useState({ q: 'Q1', priority: 'high' })

  const handleSubmit = async () => {
    await onAdd(data)
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', borderRadius: 12, padding: 24, width: 560, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2C4E', marginBottom: 18 }}>➕ Новая инициатива</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {FIELDS.map(fi => (
            <div key={fi.f} style={{ display: 'flex', flexDirection: 'column', gap: 4, gridColumn: fi.full ? '1/-1' : 'auto' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                {fi.l}
              </label>
              {fi.type === 'select' ? (
                <select
                  value={data[fi.f] || ''}
                  onChange={e => setData(p => ({ ...p, [fi.f]: e.target.value }))}
                  style={inputStyle}
                >
                  {fi.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : fi.textarea ? (
                <textarea
                  value={data[fi.f] || ''}
                  onChange={e => setData(p => ({ ...p, [fi.f]: e.target.value }))}
                  placeholder={fi.placeholder}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 56, padding: '7px 8px' }}
                />
              ) : (
                <input
                  type={fi.type || 'text'}
                  value={data[fi.f] || ''}
                  placeholder={fi.placeholder}
                  onChange={e => setData(p => ({ ...p, [fi.f]: e.target.value }))}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSecondary}>Отмена</button>
          <button onClick={handleSubmit} style={btnPrimary}>Добавить</button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  height: 34, padding: '0 8px', border: '1.5px solid #DDE3EF',
  borderRadius: 6, fontSize: 12, fontFamily: 'inherit', color: '#1C1C2E',
}

const btnSecondary = {
  padding: '8px 16px', background: '#F0F2F7', color: '#1C1C2E',
  border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
}

const btnPrimary = {
  padding: '8px 16px', background: '#2E5FA3', color: '#fff',
  border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
}
