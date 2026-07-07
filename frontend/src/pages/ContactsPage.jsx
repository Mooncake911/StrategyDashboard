import { colors, typography } from '../theme'
import InlineCell from '../components/InlineCell'
import Table from '../components/Table'
import { useRole } from '../hooks/useRole'

const COLUMNS = [
  { key: 'account', label: 'Аккаунт' },
  { key: 'unit', label: 'Объект' },
  { key: 'name', label: 'ФИО / Должность' },
  { key: 'email', label: 'Email', headStyle: { color: colors.blueLight } },
  { key: 'phone', label: 'Телефон' },
  { key: 'last_date', label: 'Последний контакт' },
  { key: 'topic', label: 'Тема' },
  { key: 'next_step', label: 'Следующий шаг' },
]

const accountBg = (a) => (a && a.includes('Газпром')) ? colors.blue : colors.blueMedium

export default function ContactsPage({ contacts, updateContact, groupId }) {
  const { isAdmin } = useRole(groupId)
  if (!contacts.length) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: colors.textSecondary }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
        <div style={{ fontSize: typography.sizes.xxl, fontWeight: typography.weights.semibold }}>Нет контактов</div>
        <div style={{ fontSize: typography.sizes.md, marginTop: 4 }}>
          Они загружаются из листа «Трекер контактов» вашего Excel-файла
        </div>
      </div>
    )
  }

  return (
    <Table>
      <Table.Head>
        {COLUMNS.map(col => (
          <Table.Cell key={col.key} as="th" style={col.headStyle}>
            {col.label}
          </Table.Cell>
        ))}
      </Table.Head>
      <Table.Body>
        {contacts.map((c, i) => (
          <Table.Row key={c.id} index={i}>
            <Table.Cell style={{ fontWeight: typography.weights.semibold, fontSize: typography.sizes.xs }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: accountBg(c.account),
                  color: colors.textOnDark, display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: typography.sizes.xxs, fontWeight: typography.weights.bold, flexShrink: 0,
                }}>
                  {(c.account || '?')[0]}
                </span>
                {c.account}
              </span>
            </Table.Cell>
            {COLUMNS.slice(1).map(col => (
              <Table.Cell key={col.key} style={{ verticalAlign: 'top', lineHeight: 1.4 }}>
                <InlineCell
                  rowId={c.id} field={col.key} value={c[col.key]}
                  onCommit={updateContact} editable={isAdmin}
                />
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
