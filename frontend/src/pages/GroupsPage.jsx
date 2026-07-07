import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, spacing, borderRadius, typography } from '../theme'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import PageLayout from '../components/PageLayout'
import { useToast } from '../hooks/useToast'
import { usePageMeta } from '../App'

export default function GroupsPage({ groups, loading, onCreateGroup, onJoinGroup, onLeaveGroup, user }) {
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const { setMsg, ToastEl } = useToast()
  const navigate = useNavigate()
  const { setTitle, setActions } = usePageMeta()

  useEffect(() => {
    setTitle('Команды')
    setActions(
      <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)}>
        + Создать команду
      </Button>
    )
    return () => { setTitle(''); setActions(null) }
  }, [setTitle, setActions])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const g = await onCreateGroup(name, desc)
      setShowCreate(false)
      setName('')
      setDesc('')
      navigate(`/groups/${g.id}`)
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Ошибка создания')
    }
  }

  const handleJoin = useCallback(async (id) => {
    try {
      await onJoinGroup(id)
      setMsg('Заявка отправлена')
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Ошибка')
    }
  }, [onJoinGroup, setMsg])

  const handleLeave = useCallback(async (id) => {
    if (!window.confirm('Покинуть команду?')) return
    try {
      await onLeaveGroup(id)
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Ошибка')
    }
  }, [onLeaveGroup, setMsg])

  if (loading) {
    return <div style={{ background: colors.bg, fontFamily: typography.fontFamily, padding: spacing.xl }}><p style={{ color: colors.textSecondary }}>Загрузка...</p></div>
  }

  return (
    <PageLayout>
      {ToastEl}

      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} width={420}>
          <div style={{ fontSize: 16, fontWeight: typography.weights.bold, color: colors.navy, marginBottom: 18 }}>
            ➕ Создать команду
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            <Input
              placeholder="Название команды" required
              value={name} onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <Input
              placeholder="Описание (необязательно)"
              value={desc} onChange={(e) => setDesc(e.target.value)}
            />
            <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
              <Button type="submit">Создать</Button>
              <Button variant="gray" onClick={() => setShowCreate(false)}>Отмена</Button>
            </div>
          </form>
        </Modal>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {groups.length === 0 && (
          <p style={{ color: colors.textSecondary, textAlign: 'center' }}>Пока нет команд. Создайте первую!</p>
        )}
        {groups.map((g) => {
          const isCreator = g.created_by === user?.id
          return (
            <Card key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: typography.sizes.xxl, fontWeight: typography.weights.semibold, color: colors.text }}>{g.name}</div>
                <div style={{ fontSize: typography.sizes.md, color: colors.textSecondary, marginTop: 2 }}>
                  {g.description || 'Нет описания'} · {g.member_count} участников
                  {g.my_status && (
                    <span style={{
                      marginLeft: spacing.sm, padding: '1px 6px', borderRadius: 4, fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold,
                      background: g.my_status === 'approved' ? colors.successBg : g.my_status === 'pending' ? colors.warningBg : colors.dangerBg,
                      color: g.my_status === 'approved' ? colors.success : g.my_status === 'pending' ? colors.warning : colors.danger,
                    }}>
                      {g.my_status === 'approved' ? 'Участник' : g.my_status === 'pending' ? 'Ожидает' : 'Отклонён'}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                {g.my_status === 'approved' ? (
                  <>
                    <Button onClick={() => navigate(`/groups/${g.id}`)}>Открыть</Button>
                    {!isCreator && (
                      <Button variant="dangerOutline" onClick={() => handleLeave(g.id)}>Выйти</Button>
                    )}
                  </>
                ) : g.my_status === 'pending' ? (
                  <span style={{
                    padding: '5px 12px', background: colors.pendingBg, color: colors.textSecondary,
                    borderRadius: borderRadius.sm, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
                    cursor: 'default', fontFamily: typography.fontFamily,
                  }}>
                    Ожидание
                  </span>
                ) : (
                  <Button variant="success" onClick={() => handleJoin(g.id)}>+ Вступить</Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </PageLayout>
  )
}


