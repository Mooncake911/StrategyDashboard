import React, { useState, useRef, useEffect } from 'react'
import { STATUSES, sById } from '../constants'

export default function StatusPill({ status, onChange, rowId }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const s = sById[status] || STATUSES[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px',
          borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: 'pointer',
          border: 'none', fontFamily: 'inherit', background: s.bg, color: s.color,
          whiteSpace: 'nowrap',
        }}
      >
        {s.icon} {s.label} ▾
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', zIndex: 200, background: '#fff',
            border: '1.5px solid #DDE3EF', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,.13)', minWidth: 155,
            overflow: 'hidden', top: 'calc(100% + 4px)', left: 0,
          }}
        >
          {STATUSES.map(o => (
            <div
              key={o.id}
              onClick={() => { onChange(rowId, o.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px',
                fontSize: 11, fontWeight: o.id === status ? 700 : 400, cursor: 'pointer',
                background: o.id === status ? '#F0F4FA' : '#fff',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F4F7FC'}
              onMouseLeave={e => e.currentTarget.style.background = o.id === status ? '#F0F4FA' : '#fff'}
            >
              {o.icon} {o.label} {o.id === status && ' ✓'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
