import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { colors, spacing, borderRadius, typography } from '../theme'
import Button from '../components/Button'
import { getGroup, fetchMembers, approveMember, rejectMember, kickMember, changeRole } from '../api/groups'
import { exportFile, importFile } from '../api/importExport'
import { useInitiatives } from '../hooks/useInitiatives'
import { useContacts } from '../hooks/useContacts'
import { useRole } from '../hooks/useRole'
import KPIBar from '../components/KPIBar'
import RoadmapPage from './RoadmapPage'
import GanttPage from './GanttPage'
import KPIPage from './KPIPage'
import ContactsPage from './ContactsPage'
import MembersPage from './MembersPage'

const TABS = [
  ['roadmap', 'Карта инициатив'],
  ['gantt', 'Временная шкала'],
  ['kpi', 'KPI Дашборд'],
  ['contacts', 'Трекер контактов'],
  ['members', 'Участники'],
]

export default function GroupPage({ user }) {
  const { id } = useParams()
  const groupId = Number(id)
  const qc = useQueryClient()

  const [tab, setTab] = useState('roadmap')
  const [importMsg, setImportMsg] = useState('')

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
    enabled: !!groupId,
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', groupId],
    queryFn: () => fetchMembers(groupId),
    enabled: !!groupId,
  })

  const { rows, reload, updateRow, changeStatus, removeRow, addRow } = useInitiatives(groupId)
  const { contacts, update: updateContact, reload: reloadContacts } = useContacts(groupId)
  const { isAdmin } = useRole(groupId)

  const invalidateMembers = () => qc.invalidateQueries({ queryKey: ['members', groupId] })

  const kpiData = useMemo(() => {
    const total = rows.length
    const done = rows.filter((r) => r.status === 'done').length
    const active = rows.filter((r) => r.status === 'active').length
    const risk = rows.filter((r) => r.status === 'risk').length
    const potential = rows.reduce((s, r) => s + (r.potential || 0), 0)
    const pct = total ? Math.round((done / total) * 100) : 0
    return { pct, done, active, risk, potential, total }
  }, [rows])

  const wrap = (fn) => async (...args) => {
    try {
      await fn(...args)
    } catch (err) {
      setImportMsg(err.response?.data?.detail || 'Ошибка')
      setTimeout(() => setImportMsg(''), 3000)
    }
  }

  const handleApprove = wrap(async (userId) => {
    await approveMember(groupId, userId)
    invalidateMembers()
  })

  const handleReject = wrap(async (userId) => {
    await rejectMember(groupId, userId)
    invalidateMembers()
  })

  const handleKick = wrap(async (userId) => {
    if (!window.confirm('Исключить участника?')) return
    await kickMember(groupId, userId)
    invalidateMembers()
  })

  const handleRole = wrap(async (userId, role) => {
    await changeRole(groupId, userId, role)
    invalidateMembers()
  })

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportMsg('Импорт...')
    try {
      const res = await importFile(file, groupId)
      setImportMsg(`Импортировано: ${res.imported} инициатив, ${res.contacts} контактов`)
      reload()
      reloadContacts()
    } catch (err) {
      setImportMsg('Ошибка: ' + (err.response?.data?.detail || err.message))
    }
    e.target.value = ''
    setTimeout(() => setImportMsg(''), 5000)
  }

  const handleExport = async () => {
    setImportMsg('Экспорт...')
    try {
      const blob = await exportFile(groupId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Дорожная_карта_Systeme_экспорт.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      setImportMsg('Готово')
    } catch (e) { console.error('Export failed', e) }
    setTimeout(() => setImportMsg(''), 3000)
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, fontFamily: typography.fontFamily }}>
        <p style={{ color: colors.textSecondary }}>Загрузка...</p>
      </div>
    )
  }

  if (!group) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: colors.bg, fontFamily: typography.fontFamily }}>
      <div style={headerBar}>
        <div>
          <div style={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, letterSpacing: '.12em', color: colors.blueLight, textTransform: 'uppercase' }}>
            {group.name}
          </div>
          <div style={{ fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: colors.textOnDark }}>
            {group.description || group.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{
            padding: '5px 11px', background: colors.btnGhost, color: colors.textOnDark,
            border: 'none', borderRadius: borderRadius.sm, fontSize: typography.sizes.sm,
            fontWeight: typography.weights.semibold, cursor: 'pointer', fontFamily: typography.fontFamily,
            whiteSpace: 'nowrap',
          }}>
            Импорт
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <Button variant="success" size="sm" onClick={handleExport}>Экспорт</Button>
        </div>
      </div>

      {importMsg && (
        <div style={{
          padding: '8px 20px', background: colors.successBg, color: colors.success,
          fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, textAlign: 'center',
        }}>{importMsg}</div>
      )}

      <div style={tabBarStyle}>
        {TABS.map(([id, label]) => (
          <div
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '11px 15px', fontSize: typography.sizes.lg, whiteSpace: 'nowrap', cursor: 'pointer',
              fontWeight: tab === id ? typography.weights.semibold : typography.weights.medium,
              color: tab === id ? colors.blue : colors.textSecondary,
              borderBottom: tab === id ? `2.5px solid ${colors.blue}` : '2.5px solid transparent',
              marginBottom: -1.5, transition: 'all .15s',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {(tab === 'roadmap' || tab === 'kpi') && <KPIBar kpi={kpiData} />}

      {tab === 'roadmap' && (
        <RoadmapPage rows={rows} updateRow={updateRow} changeStatus={changeStatus} removeRow={removeRow} groupId={groupId} />
      )}
      {tab === 'gantt' && <GanttPage rows={rows} />}
      {tab === 'kpi' && <KPIPage rows={rows} />}
      {tab === 'contacts' && <ContactsPage contacts={contacts} updateContact={updateContact} groupId={groupId} />}

      {tab === 'members' && (
        <MembersPage
          members={members}
          groupId={groupId}
          currentUserId={user?.id}
          isAdmin={isAdmin}
          isCreator={group.created_by === user?.id}
          onApprove={handleApprove}
          onReject={handleReject}
          onKick={handleKick}
          onRole={handleRole}
        />
      )}
    </div>
  )
}

const headerBar = {
  background: colors.navy, padding: '13px 20px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap',
}
const tabBarStyle = {
  background: colors.white, borderBottom: `1.5px solid ${colors.border}`, display: 'flex', padding: '0 20px', overflowX: 'auto',
}
