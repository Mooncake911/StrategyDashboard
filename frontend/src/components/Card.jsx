import { colors, borderRadius, shadows, spacing } from '../theme'

export default function Card({ children, padding = spacing.lg, style, ...props }) {
  return (
    <div
      style={{
        background: colors.white,
        padding,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.card,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
