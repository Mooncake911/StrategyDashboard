import React from 'react'
import { STATUSES } from '../constants'

export default function FilterBar({
  qFilter, setQFilter,
  acFilter, setAcFilter,
  stFilter, setStFilter,
  search, setSearch,
  accounts, visibleCount, totalCount,
}) {
  return (
    <div
      style={{
        display: 'flex', gap: 8, padding: '10px 20px', background: '#fff',
        borderBottom: '1px solid #DDE3EF', flexWrap: 'wrap', alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Фильтр
      </span>

      <select
        value={qFilter} onChange={e => setQFilter(e.target.value)}
        style={selectStyle}
      >
        <option value="all">Все кварталы</option>
        <option value="Q1">1 квартал</option>
        <option value="Q2">2 квартал</option>
        <option value="Q3">3 квартал</option>
        <option value="Q4">4 квартал</option>
      </select>

      <select
        value={acFilter} onChange={e => setAcFilter(e.target.value)}
        style={selectStyle}
      >
        <option value="all">Все аккаунты</option>
        {accounts.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <select
        value={stFilter} onChange={e => setStFilter(e.target.value)}
        style={selectStyle}
      >
        <option value="all">Все статусы</option>
        {STATUSES.map(s => (
          <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
        ))}
      </select>

      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Поиск…"
        style={{
          height: 30, padding: '0 8px', border: '1.5px solid #DDE3EF',
          borderRadius: 6, fontSize: 11, fontFamily: 'inherit', width: 180,
        }}
      />

      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 10, color: '#6B7A99' }}>
        Показано {visibleCount} / {totalCount}
      </span>
    </div>
  )
}

const selectStyle = {
  height: 30, padding: '0 8px', border: '1.5px solid #DDE3EF',
  borderRadius: 6, fontSize: 11, color: '#1C1C2E', background: '#fff',
  fontFamily: 'inherit', cursor: 'pointer',
}
