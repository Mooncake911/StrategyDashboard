import { useState, useRef, useEffect } from 'react'
import { STATUSES, sById } from '../constants'
import { colors, borderRadius, typography, shadows } from '../theme'

export default function StatusPill({ status, onChange, rowId, disabled = false }) {
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

  if (disabled) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px',
        borderRadius: 20, fontSize: 10, fontWeight: 600,
        background: s.bg, color: s.color, whiteSpace: 'nowrap',
      }}>
        {s.icon} {s.label}
      </span>
    )
  }

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
            position: 'absolute', zIndex: 200, background: colors.white,
            border: `1.5px solid ${colors.border}`, borderRadius: borderRadius.md,
            boxShadow: shadows.dropdown, minWidth: 155,
            overflow: 'hidden', top: 'calc(100% + 4px)', left: 0,
          }}
        >
          {STATUSES.map(o => (
            <div
              key={o.id}
              onClick={() => { onChange(rowId, o.id); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px',
                fontSize: typography.sizes.sm, fontWeight: o.id === status ? typography.weights.bold : typography.weights.normal, cursor: 'pointer',
                background: o.id === status ? colors.borderLight : colors.white,
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.bg}
              onMouseLeave={e => e.currentTarget.style.background = o.id === status ? colors.borderLight : colors.white}
            >
              {o.icon} {o.label} {o.id === status && ' ✓'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
