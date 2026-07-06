import React, { useEffect } from 'react'

export default function Toast({ message, onClose, duration = 2400 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [message, onClose, duration])

  if (!message) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        background: '#1A2C4E', color: '#fff', padding: '9px 18px', borderRadius: 8,
        fontSize: 12, fontWeight: 500, zIndex: 999,
        boxShadow: '0 4px 16px rgba(0,0,0,.2)', pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  )
}
