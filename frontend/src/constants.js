import { statusColors } from './theme'

export const Q_META = {
  Q1: { bg: '#EBF2FF', stripe: '#2E5FA3', label: '1 квартал' },
  Q2: { bg: '#EDFBF1', stripe: '#1A5C3A', label: '2 квартал' },
  Q3: { bg: '#FFFAEB', stripe: '#B86B00', label: '3 квартал' },
  Q4: { bg: '#FFF0F0', stripe: '#C00000', label: '4 квартал' },
}

export const STATUSES = [
  { id: 'pending', label: 'Не начат',   icon: '⬜', color: statusColors.pending.text, bg: statusColors.pending.bg },
  { id: 'active',  label: 'В работе',   icon: '🔵', color: statusColors.active.text, bg: statusColors.active.bg },
  { id: 'waiting', label: 'Ожидание',   icon: '🟡', color: statusColors.waiting.text, bg: statusColors.waiting.bg },
  { id: 'done',    label: 'Выполнен',   icon: '🟢', color: statusColors.done.text, bg: statusColors.done.bg },
  { id: 'risk',    label: 'Под риском', icon: '🔴', color: statusColors.risk.text, bg: statusColors.risk.bg },
]

export const sById = Object.fromEntries(STATUSES.map(s => [s.id, s]))
