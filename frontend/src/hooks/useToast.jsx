import { useState, useCallback, useRef } from 'react'
import { colors, borderRadius, spacing, typography } from '../theme'

export function useToast(duration = 3000) {
  const [msg, setMsgRaw] = useState('')
  const timer = useRef(null)

  const setMsg = useCallback((text) => {
    setMsgRaw(text)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsgRaw(''), duration)
  }, [duration])

  const ToastEl = msg ? (
    <div style={{
      marginBottom: spacing.md, padding: '8px 14px',
      background: msg.includes('Ошибка') || msg.includes('ошибк') ? colors.dangerBg : colors.successBg,
      color: msg.includes('Ошибка') || msg.includes('ошибк') ? colors.danger : colors.success,
      borderRadius: borderRadius.sm, fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold, textAlign: 'center',
    }}>
      {msg}
    </div>
  ) : null

  return { msg, setMsg, ToastEl }
}
