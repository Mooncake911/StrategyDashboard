import React from 'react'
import { colors, borderRadius, typography, shadows } from '../theme'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: colors.bg, fontFamily: typography.fontFamily, padding: 20,
        }}>
          <div style={{
            background: colors.white, padding: 32, borderRadius: borderRadius.xl,
            maxWidth: 420, textAlign: 'center',           boxShadow: shadows.cardLg,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px', color: colors.navy }}>Что-то пошло не так</h2>
            <p style={{ fontSize: typography.sizes.lg, color: colors.textSecondary, margin: '0 0 20px', lineHeight: 1.4 }}>
              Произошла непредвиденная ошибка. Попробуйте обновить страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 20px', background: colors.blue, color: colors.textOnDark,
                border: 'none', borderRadius: borderRadius.sm, fontSize: typography.sizes.lg,
                fontWeight: typography.weights.semibold, cursor: 'pointer', fontFamily: typography.fontFamily,
              }}
            >
              Обновить страницу
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
