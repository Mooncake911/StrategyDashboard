export const Q_META = {
  Q1: { bg: '#EBF2FF', stripe: '#2E5FA3', label: '1 квартал' },
  Q2: { bg: '#EDFBF1', stripe: '#1A5C3A', label: '2 квартал' },
  Q3: { bg: '#FFFAEB', stripe: '#B86B00', label: '3 квартал' },
  Q4: { bg: '#FFF0F0', stripe: '#C00000', label: '4 квартал' },
}

export const STATUSES = [
  { id: 'pending', label: 'Не начат',   icon: '⬜', color: '#6B7A99', bg: '#F0F2F7' },
  { id: 'active',  label: 'В работе',   icon: '🔵', color: '#1456A8', bg: '#E5EEFB' },
  { id: 'waiting', label: 'Ожидание',   icon: '🟡', color: '#B86B00', bg: '#FFF4D6' },
  { id: 'done',    label: 'Выполнен',   icon: '🟢', color: '#1A5C3A', bg: '#E2F0E8' },
  { id: 'risk',    label: 'Под риском', icon: '🔴', color: '#C00000', bg: '#FEE7E7' },
]

export const sById = Object.fromEntries(STATUSES.map(s => [s.id, s]))
