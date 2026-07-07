import { useState, useEffect } from 'react'
import { colors, spacing, borderRadius, typography } from '../theme'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import PageLayout from '../components/PageLayout'
import { useToast } from '../hooks/useToast'
import { updateMe } from '../api/auth'
import { usePageMeta } from '../App'

export default function ProfilePage({ user, setUser }) {
  const { setTitle, setActions } = usePageMeta()

  useEffect(() => {
    setTitle('Профиль')
    setActions(null)
    return () => { setTitle(''); setActions(null) }
  }, [setTitle, setActions])

  const [fullName, setFullName] = useState(user?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const { setMsg, ToastEl } = useToast()
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    setErr('')
    try {
      const body = {}
      if (fullName !== user?.full_name) body.full_name = fullName
      if (email !== user?.email) body.email = email
      if (password) body.password = password
      if (Object.keys(body).length === 0) {
        setMsg('Нет изменений')
        setSaving(false)
        return
      }
      const updated = await updateMe(body)
      setUser(updated)
      setPassword('')
      setMsg('Сохранено')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Ошибка сохранения')
    }
    setSaving(false)
  }

  return (
    <PageLayout style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      {ToastEl}
      <Card padding={spacing.xxl} style={{ width: '100%', maxWidth: 460 }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <Input label="Имя" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Новый пароль (оставьте пустым, если не меняете)"
            type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && <div style={errBox}>{err}</div>}
          <Button type="submit" disabled={saving} size="md">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>
      </Card>
    </PageLayout>
  )
}

const errBox = {
  padding: '8px 14px', background: colors.dangerBg, color: colors.danger,
  borderRadius: borderRadius.sm, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold,
}
