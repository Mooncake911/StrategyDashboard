import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { colors, spacing, borderRadius, typography, shadows } from '../theme'
import Button from '../components/Button'
import Input from '../components/Input'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await onLogin(email, password)
      navigate('/groups')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: colors.bg, fontFamily: typography.fontFamily,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: colors.white, padding: spacing.xxxl, borderRadius: borderRadius.xl, width: 360,
        boxShadow: shadows.cardLg,
      }}>
        <h2 style={{ margin: '0 0 20px', color: colors.navy }}>Вход</h2>
        {error && (
          <div style={{
            background: colors.dangerBg, color: colors.danger, padding: '8px 12px',
            borderRadius: borderRadius.md, fontSize: typography.sizes.lg, marginBottom: spacing.md,
          }}>
            {error}
          </div>
        )}
        <Input
          type="email" placeholder="Email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: spacing.md }}
        />
        <Input
          type="password" placeholder="Пароль" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: spacing.md }}
        />
        <Button type="submit" size="auth" variant="primary">Войти</Button>
        <div style={{ marginTop: 14, fontSize: typography.sizes.lg, color: colors.textSecondary }}>
          Нет аккаунта? <Link to="/register" style={{ color: colors.blue }}>Зарегистрироваться</Link>
        </div>
      </form>
    </div>
  )
}
