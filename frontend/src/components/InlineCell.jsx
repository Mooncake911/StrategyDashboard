import React, { useState, useEffect, useRef } from 'react'

export default function InlineCell({ value, onCommit, right, field, rowId }) {
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
          width: '100%', border: '1.5px solid #2E5FA3', borderRadius: 4,
          padding: '3px 6px', fontSize: 11, fontFamily: 'inherit', background: '#fff',
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
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(46,95,163,.08)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      {val || <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>}
    </span>
  )
}
