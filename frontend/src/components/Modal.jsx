import { colors, borderRadius, spacing, shadows, typography } from '../theme'

export default function Modal({ children, onClose, width = 480, style }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: colors.overlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, fontFamily: typography.fontFamily,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.white, padding: spacing.xxl,
          borderRadius: borderRadius.xl, width, maxWidth: '95vw',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: shadows.modal, ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
