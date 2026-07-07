import { colors, spacing, typography } from '../theme'

export default function PageLayout({ children, style, ...props }) {
  return (
    <div
      style={{
        background: colors.bg, fontFamily: typography.fontFamily,
        padding: spacing.xl, ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
