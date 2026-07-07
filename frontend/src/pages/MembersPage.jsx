import { useState } from 'react'
import AsyncSelect from 'react-select/async'
import { colors, borderRadius, typography, members as memberTheme } from '../theme'
import TabToolbar from '../components/TabToolbar'
import Table from '../components/Table'
import { searchUsers } from '../api/users'
import { inviteUser as inviteUserApi } from '../api/groups'

const loadOptions = (inputValue) =>
  searchUsers(inputValue).then((users) =>
    users.map((u) => ({ value: u.id, label: `${u.full_name} (${u.email})` }))
  )

export default function MembersPage({
  members, isAdmin, isCreator, groupId, currentUserId,
  onApprove, onReject, onKick, onRole,
}) {
  const [inviteUser, setInviteUser] = useState(null)
  const [inviteMsg, setInviteMsg] = useState('')
  const [search, setSearch] = useState('')

  const approved = members.filter((m) => m.status === 'approved')
  const pending = members.filter((m) => m.status === 'pending')

  const approvedFiltered = search
    ? approved.filter(
        (m) =>
          (m.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
          (m.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : approved

  const handleInvite = async () => {
    if (!inviteUser) return
    try {
      const res = await inviteUserApi(groupId, inviteUser.value)
      setInviteMsg(`Приглашён: ${res.invited}`)
      setInviteUser(null)
    } catch (err) {
      setInviteMsg(err.response?.data?.detail || 'Ошибка приглашения')
    }
    setTimeout(() => setInviteMsg(''), 3000)
  }

  return (
    <div>
      {isAdmin && (
        <TabToolbar>
          <TabToolbar.Label>Пригласить</TabToolbar.Label>
          <TabToolbar.Input>
            <AsyncSelect
              cacheOptions
              loadOptions={loadOptions}
              onChange={(opt) => setInviteUser(opt)}
              value={inviteUser}
              placeholder="Поиск по имени или email..."
              noOptionsMessage={() => 'Ничего не найдено'}
              styles={selectStyles}
            />
          </TabToolbar.Input>
          <button onClick={handleInvite} disabled={!inviteUser} style={{
            padding: '6px 13px', background: inviteUser ? colors.success : colors.pendingBg,
            color: colors.textOnDark, border: 'none', borderRadius: borderRadius.sm,
            fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
            cursor: inviteUser ? 'pointer' : 'default', fontFamily: typography.fontFamily,
            whiteSpace: 'nowrap',
          }}>
            Пригласить
          </button>
          {inviteMsg && (
            <TabToolbar.Stat style={{
              padding: '4px 8px', borderRadius: borderRadius.sm, fontWeight: typography.weights.semibold,
              background: inviteMsg.includes('Ошибка') ? colors.dangerBg : colors.successBg,
              color: inviteMsg.includes('Ошибка') ? colors.danger : colors.success,
              fontSize: typography.sizes.sm,
            }}>
              {inviteMsg}
            </TabToolbar.Stat>
          )}
        </TabToolbar>
      )}

      {inviteMsg && !isAdmin && (
        <div style={{
          padding: '8px 20px', background: inviteMsg.includes('Ошибка') ? colors.dangerBg : colors.successBg,
          color: inviteMsg.includes('Ошибка') ? colors.danger : colors.success,
          fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
        }}>
          {inviteMsg}
        </div>
      )}

      <TabToolbar>
        <TabToolbar.Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Поиск по имени или email..."
        />
        <TabToolbar.Spacer />
        <TabToolbar.Stat>
          Показано {approvedFiltered.length + pending.length} / {members.length}
        </TabToolbar.Stat>
      </TabToolbar>

      <Table>
        <Table.Head>
          <Table.Cell as="th">Имя</Table.Cell>
          <Table.Cell as="th">Email</Table.Cell>
          <Table.Cell as="th">Роль</Table.Cell>
          <Table.Cell as="th">Статус</Table.Cell>
          {isAdmin && <Table.Cell as="th">Действия</Table.Cell>}
        </Table.Head>
        <Table.Body>
          {pending.map((m, i) => {
            const roleStyle = memberTheme.role.member
            const statusStyle = memberTheme.status.pending
            return (
              <Table.Row key={m.id} index={i} style={{ background: colors.warningBg }}>
                <Table.Cell style={{ fontWeight: typography.weights.semibold }}>{m.full_name || '—'}</Table.Cell>
                <Table.Cell>{m.email}</Table.Cell>
                <Table.Cell>
                  <span style={badge(roleStyle.bg, roleStyle.text)}>{roleStyle.label}</span>
                </Table.Cell>
                <Table.Cell>
                  <span style={badge(statusStyle.bg, statusStyle.text)}>{statusStyle.label}</span>
                </Table.Cell>
                {isAdmin && (
                  <Table.Cell>
                    <button onClick={() => onApprove(m.user_id)} style={btnGreen}>✓</button>
                    <button onClick={() => onReject(m.user_id)} style={btnRed}>✕</button>
                  </Table.Cell>
                )}
              </Table.Row>
            )
          })}
          {approvedFiltered.map((m, i) => {
            const roleStyle = memberTheme.role[m.role] || memberTheme.role.member
            const statusStyle = memberTheme.status.approved
            return (
              <Table.Row key={m.id} index={i + pending.length}>
                <Table.Cell style={{ fontWeight: typography.weights.semibold }}>{m.full_name || '—'}</Table.Cell>
                <Table.Cell>{m.email}</Table.Cell>
                <Table.Cell>
                  {isAdmin && m.user_id !== currentUserId ? (
                    <select
                      value={m.role}
                      onChange={(e) => onRole(m.user_id, e.target.value)}
                      style={roleSelect}
                    >
                      <option value="member">Участник</option>
                      <option value="admin">Админ</option>
                    </select>
                  ) : (
                    <span style={badge(roleStyle.bg, roleStyle.text)}>{roleStyle.label}</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <span style={badge(statusStyle.bg, statusStyle.text)}>{statusStyle.label}</span>
                </Table.Cell>
                {isAdmin && (
                  <Table.Cell>
                    {m.user_id !== currentUserId && (
                      <button onClick={() => onKick(m.user_id)} style={smallRed}>Исключить</button>
                    )}
                  </Table.Cell>
                )}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>

      {approvedFiltered.length === 0 && pending.length === 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <p style={{ color: colors.textSecondary, fontSize: typography.sizes.md }}>
            {search ? 'Ничего не найдено' : 'Нет участников'}
          </p>
        </div>
      )}
    </div>
  )
}

const badge = (bg, text) => ({
  fontSize: typography.sizes.xs, padding: '2px 8px', borderRadius: 4, fontWeight: typography.weights.semibold,
  background: bg, color: text,
})

const btnRed = {
  padding: '3px 8px', background: colors.dangerBg, color: colors.danger,
  border: 'none', borderRadius: 4, fontSize: typography.sizes.md, cursor: 'pointer',
}
const btnGreen = {
  padding: '3px 8px', background: colors.successBg, color: colors.success,
  border: 'none', borderRadius: 4, fontSize: typography.sizes.md, cursor: 'pointer',
}
const smallRed = {
  padding: '4px 10px', background: colors.dangerBg, color: colors.danger,
  border: 'none', borderRadius: borderRadius.sm, fontSize: typography.sizes.sm,
  fontWeight: typography.weights.semibold, cursor: 'pointer',
}
const roleSelect = {
  padding: '3px 6px', border: `1.5px solid ${colors.border}`, borderRadius: 4,
  fontSize: typography.sizes.sm, fontFamily: typography.fontFamily,
  cursor: 'pointer', outline: 'none',
}
const selectStyles = {
  control: (base) => ({ ...base, borderColor: colors.border, borderRadius: 8, fontSize: typography.sizes.lg }),
  menu: (base) => ({ ...base, fontSize: typography.sizes.lg }),
}
