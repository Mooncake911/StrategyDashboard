import { colors, borderRadius, typography, spacing } from '../theme'

const variants = {
  primary: { background: colors.blue, color: colors.textOnDark },
  ghost: { background: colors.btnGhost, color: colors.textOnDark },
  success: { background: colors.success, color: colors.textOnDark },
  danger: { background: colors.danger, color: colors.textOnDark, fontWeight: typography.weights.semibold },
  dangerGhost: { background: colors.btnDangerGhost, color: '#FF8A8A' },
  dangerOutline: { background: 'transparent', color: colors.danger, border: `1.5px solid ${colors.dangerBg}` },
  redAction: { background: colors.dangerBg, color: colors.danger },
  greenAction: { background: colors.successBg, color: colors.success },
  gray: { background: colors.textSecondary, color: colors.textOnDark },
}

const sizes = {
  sm: { padding: '5px 12px', fontSize: typography.sizes.sm },
  md: { padding: '8px 16px', fontSize: typography.sizes.lg },
  auth: { padding: '10px', fontSize: typography.sizes.xl, width: '100%' },
}

export default function Button({ variant = 'primary', size = 'sm', children, disabled, onClick, style, ...props }) {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.sm
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        ...v,
        ...s,
        border: v.border || 'none',
        borderRadius: borderRadius.sm,
        fontWeight: typography.weights.semibold,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: typography.fontFamily,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
