import { colors, spacing, borderRadius, typography } from '../theme'

function TabToolbar({ children, style, ...props }) {
  return (
    <div
      style={{
        display: 'flex', gap: spacing.sm, padding: '10px 20px',
        background: colors.white, borderBottom: `1.5px solid ${colors.border}`,
        flexWrap: 'wrap', alignItems: 'center', ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

TabToolbar.Label = function Label({ children, style, ...props }) {
  return (
    <span
      style={{
        fontSize: typography.sizes.xs, fontWeight: typography.weights.bold,
        color: colors.textSecondary, textTransform: 'uppercase',
        letterSpacing: '.06em', ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}

TabToolbar.Select = function Select({ value, onChange, options, style, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        height: 30, padding: '0 8px', border: `1.5px solid ${colors.border}`,
        borderRadius: borderRadius.sm, fontSize: typography.sizes.sm,
        color: colors.text, background: colors.white,
        fontFamily: typography.fontFamily, cursor: 'pointer', ...style,
      }}
      {...props}
    >
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )
      )}
    </select>
  )
}

TabToolbar.Search = function Search({ value, onChange, placeholder, style, ...props }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? '🔍 Поиск…'}
      style={{
        height: 30, padding: '0 8px', border: `1.5px solid ${colors.border}`,
        borderRadius: borderRadius.sm, fontSize: typography.sizes.sm,
        fontFamily: typography.fontFamily, width: 180,
        outline: 'none', ...style,
      }}
      {...props}
    />
  )
}

TabToolbar.Spacer = function Spacer() {
  return <span style={{ flex: 1 }} />
}

TabToolbar.Stat = function Stat({ children, style, ...props }) {
  return (
    <span
      style={{ fontSize: typography.sizes.xs, color: colors.textSecondary, whiteSpace: 'nowrap', ...style }}
      {...props}
    >
      {children}
    </span>
  )
}

TabToolbar.Input = function Input({ children, style, ...props }) {
  return (
    <div
      style={{ flex: 1, minWidth: 240, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

export default TabToolbar
