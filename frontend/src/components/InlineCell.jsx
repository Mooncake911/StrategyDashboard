import { useState, useEffect, useRef } from 'react'
import { colors, borderRadius, typography } from '../theme'

export default function InlineCell({ value, onCommit, right, field, rowId, editable = true }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value ?? '')
  const inputRef = useRef(null)

  useEffect(() => setVal(value ?? ''), [value])

  const commit = () => {
    setEditing(false)
    if (val !== (value ?? '')) {
      onCommit(rowId, field, val)
    }
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  if (!editable) {
    return (
      <span style={{ display: 'block', textAlign: right ? 'right' : 'left', minHeight: 16 }}>
        {val || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
      </span>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setEditing(false); setVal(value ?? '') }
        }}
        style={{
          width: '100%', border: `1.5px solid ${colors.blue}`, borderRadius: 4,
          padding: '3px 6px', fontSize: typography.sizes.sm, fontFamily: typography.fontFamily, background: colors.white,
        }}
      />
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Нажмите для редактирования"
      style={{
        display: 'block', cursor: 'text', borderRadius: 3, padding: '2px 3px',
        margin: '-2px -3px', textAlign: right ? 'right' : 'left', minHeight: 16,
      }}
      onMouseEnter={e => e.currentTarget.style.background = `${colors.blue}14`}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      {val || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
    </span>
  )
}
