import { colors, borderRadius, typography } from '../theme'

const inputBase = {
  width: '100%',
  padding: '10px 12px',
  border: `1.5px solid ${colors.border}`,
  borderRadius: borderRadius.md,
  fontSize: typography.sizes.xl,
  fontFamily: typography.fontFamily,
  outline: 'none',
  boxSizing: 'border-box',
}

export default function Input({ label, error, style, ...props }) {
  return (
    <div>
      {label && (
        <label style={{
          display: 'block', fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
          color: colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em',
        }}>
          {label}
        </label>
      )}
      <input
        style={{
          ...inputBase,
          borderColor: error ? colors.danger : colors.border,
          ...style,
        }}
        {...props}
      />
      {error && (
        <div style={{
          marginTop: 4, fontSize: typography.sizes.sm, color: colors.danger, fontWeight: typography.weights.semibold,
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

