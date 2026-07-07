import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, spacing, typography } from '../theme'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Modal from '../components/Modal'
import PageLayout from '../components/PageLayout'
import { useToast } from '../hooks/useToast'
import { leaveGroup as leaveGroupApi, deleteGroup } from '../api/groups'
import { usePageMeta } from '../App'

export default function MyGroupsPage({ groups, loading, onReload, user }) {
  const { setMsg, ToastEl } = useToast()
  const [confirmGroup, setConfirmGroup] = useState(null)
  const [confirmName, setConfirmName] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const navigate = useNavigate()
  const { setTitle, setActions } = usePageMeta()

  useEffect(() => {
    setTitle('Мои команды')
    setActions(null)
    return () => { setTitle(''); setActions(null) }
  }, [setTitle, setActions])

  const myGroups = groups.filter(
    (g) => g.my_status === 'approved' || g.created_by === user?.id
  )

  const handleLeave = async (g) => {
    try {
      await leaveGroupApi(g.id)
      setMsg('Вы покинули команду')
      onReload()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail?.code === 'last_admin') {
        setConfirmGroup({ id: g.id, name: detail.group_name || g.name })
        setConfirmName('')
        setConfirmError('')
      } else {
        setMsg(err.response?.data?.detail || 'Ошибка')
      }
    }
  }

  const handleDeleteConfirm = async () => {
    if (confirmName !== confirmGroup.name) {
      setConfirmError('Название не совпадает')
      return
    }
    try {
      await deleteGroup(confirmGroup.id)
      setConfirmGroup(null)
      setConfirmName('')
      setMsg('Команда удалена')
      onReload()
    } catch (err) {
      setConfirmError(err.response?.data?.detail || 'Ошибка удаления')
    }
  }

  const handleDeleteClick = (g) => {
    setConfirmGroup({ id: g.id, name: g.name })
    setConfirmName('')
    setConfirmError('')
  }

  if (loading) {
    return <div style={{ background: colors.bg, fontFamily: typography.fontFamily, padding: spacing.xl }}><p style={{ color: colors.textSecondary }}>Загрузка...</p></div>
  }

  return (
    <PageLayout>
      {ToastEl}

      {myGroups.length === 0 && (
        <p style={{ color: colors.textSecondary }}>Вы ещё не вступили ни в одну команду.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
        {myGroups.map((g) => {
          const isAdmin = g.my_role === 'admin' || g.created_by === user?.id
          return (
            <Card key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: typography.sizes.xxl, fontWeight: typography.weights.semibold, color: colors.text }}>{g.name}</div>
                <div style={{ fontSize: typography.sizes.md, color: colors.textSecondary, marginTop: 2 }}>
                  {g.description || 'Нет описания'} · {g.member_count} участников
                  {g.my_role && (
                    <span style={{
                      marginLeft: spacing.sm, padding: '1px 6px', borderRadius: 4, fontSize: typography.sizes.xs,
                      fontWeight: typography.weights.semibold, background: g.my_role === 'admin' ? colors.successBg : colors.pendingBg,
                      color: g.my_role === 'admin' ? colors.success : colors.textSecondary,
                    }}>
                      {g.my_role === 'admin' ? 'Админ' : 'Участник'}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Button onClick={() => navigate(`/groups/${g.id}`)}>Открыть</Button>
                <Button variant="dangerOutline" onClick={() => handleLeave(g)}>Выйти</Button>
                {isAdmin && (
                  <Button variant="danger" onClick={() => handleDeleteClick(g)}>Удалить</Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {confirmGroup && (
        <Modal onClose={() => setConfirmGroup(null)} width={440}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, color: colors.text }}>Удаление команды</h3>
          <p style={{ fontSize: typography.sizes.lg, color: colors.textSecondary, margin: '0 0 12px', lineHeight: 1.4 }}>
            Вы последний администратор группы <strong>{confirmGroup.name}</strong>.
            Если вы выйдете, группа будет удалена.
            Введите название группы для подтверждения:
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={confirmGroup.name}
            error={confirmError}
            autoFocus
          />
          <div style={{ display: 'flex', gap: spacing.sm, marginTop: spacing.md }}>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={!confirmName}>Подтвердить</Button>
            <Button variant="gray" onClick={() => setConfirmGroup(null)}>Отмена</Button>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}


