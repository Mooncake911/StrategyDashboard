export const colors = {
  navy: '#1A2C4E',
  blue: '#2E5FA3',
  blueLight: '#7EA8E0',
  blueBright: '#4A9EE8',
  blueMedium: '#4A6FA5',
  text: '#1A2C4E',
  textSecondary: '#6B7A99',
  textOnDark: '#fff',
  textInactive: '#B0C4DE',
  bg: '#F4F7FC',
  white: '#fff',
  border: '#DDE3EF',
  borderLight: '#F0F2F7',
  success: '#1A5C3A',
  successBg: '#E2F0E8',
  danger: '#C00000',
  dangerBg: '#FEE7E7',
  warning: '#B86B00',
  warningBg: '#FFF4D6',
  pending: '#6B7A99',
  pendingBg: '#F0F2F7',
  active: '#1456A8',
  activeBg: '#E5EEFB',
  overlay: 'rgba(0,0,0,.35)',
  btnGhost: 'rgba(255,255,255,.12)',
  btnGhostActive: 'rgba(255,255,255,.15)',
  btnDangerGhost: 'rgba(192,0,0,.2)',
  sidebarDivider: 'rgba(255,255,255,.08)',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  full: 20,
}

export const shadows = {
  card: '0 1px 4px rgba(0,0,0,.04)',
  cardLg: '0 2px 10px rgba(0,0,0,.06)',
  cardXl: '0 2px 12px rgba(0,0,0,.08)',
  dropdown: '0 8px 24px rgba(0,0,0,.13)',
  modal: '0 4px 20px rgba(0,0,0,.15)',
  modalLg: '0 20px 60px rgba(0,0,0,.25)',
  toast: '0 4px 16px rgba(0,0,0,.2)',
}

export const BRAND = 'Systeme Electric'

export const typography = {
  fontFamily: "'Inter', sans-serif",
  sizes: {
    xxs: 9,
    xs: 10,
    sm: 11,
    md: 12,
    lg: 13,
    xl: 14,
    xxl: 15,
    title: 17,
    heading: 18,
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
}

export const statusColors = {
  pending: { bg: '#F0F2F7', text: '#6B7A99', label: 'Не начат' },
  active: { bg: '#E5EEFB', text: '#1456A8', label: 'В работе' },
  waiting: { bg: '#FFF4D6', text: '#B86B00', label: 'Ожидание' },
  done: { bg: '#E2F0E8', text: '#1A5C3A', label: 'Выполнен' },
  risk: { bg: '#FEE7E7', text: '#C00000', label: 'Под риском' },
}

export const members = {
  role: {
    admin: { bg: '#EBF2FF', text: '#2E5FA3', label: 'Админ' },
    member: { bg: '#F0F2F7', text: '#6B7A99', label: 'Участник' },
  },
  status: {
    approved: { bg: '#E2F0E8', text: '#1A5C3A', label: 'активен' },
    pending: { bg: '#FFF4D6', text: '#B86B00', label: 'ожидает' },
    rejected: { bg: '#FEE7E7', text: '#C00000', label: 'Отклонён' },
  },
}
