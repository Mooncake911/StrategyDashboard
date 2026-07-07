import { useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { colors, spacing, borderRadius, typography, BRAND } from './theme'
import { useAuth } from './hooks/useAuth'
import { useGroups } from './hooks/useGroups'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GroupsPage from './pages/GroupsPage'
import ErrorBoundary from './components/ErrorBoundary'
import GroupPage from './pages/GroupPage'
import MyGroupsPage from './pages/MyGroupsPage'
import ProfilePage from './pages/ProfilePage'

const queryClient = new QueryClient()
const PageMetaContext = createContext(null)

export function usePageMeta() {
  return useContext(PageMetaContext)
}

function PageMetaProvider({ children }) {
  const [title, setTitle] = useState('')
  const [actions, setActions] = useState(null)

  return (
    <PageMetaContext.Provider value={{ title, setTitle, actions, setActions }}>
      {title && (
        <div style={{
          background: colors.navy, padding: '13px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: typography.fontFamily,
        }}>
          <div>
            <div style={{ fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, letterSpacing: '.12em', color: colors.blueLight, textTransform: 'uppercase' }}>
              {BRAND}
            </div>
            <div style={{ fontSize: typography.sizes.title, fontWeight: typography.weights.bold, color: colors.textOnDark }}>
              {title}
            </div>
          </div>
          {actions && (
            <div style={{ display: 'flex', gap: spacing.sm }}>{actions}</div>
          )}
        </div>
      )}
      {children}
    </PageMetaContext.Provider>
  )
}

function Sidebar({ user, logout }) {
  const [collapsed, setCollapsed] = useState(false)

  const linkBase = {
    display: 'block', padding: '6px 12px', fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium, color: colors.textInactive,
    textDecoration: 'none', borderRadius: borderRadius.sm,
    whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: typography.fontFamily,
  }
  const linkActive = {
    background: colors.btnGhostActive, color: colors.textOnDark, fontWeight: typography.weights.semibold,
  }

  return (
    <div style={{
      width: collapsed ? 56 : 200, background: colors.navy,
      display: 'flex', flexDirection: 'column',
      transition: 'width .2s', flexShrink: 0, overflow: 'hidden',
      fontFamily: typography.fontFamily,
    }}>
      <div style={{
        padding: collapsed ? '12px 8px' : '13px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {!collapsed && <span style={{ fontWeight: typography.weights.bold, fontSize: typography.sizes.xl, color: colors.textOnDark }}>{BRAND}</span>}
        <button onClick={() => setCollapsed((c) => !c)} style={{
          background: colors.btnGhost, border: 'none', color: colors.textOnDark,
          borderRadius: borderRadius.sm, cursor: 'pointer', fontSize: typography.sizes.sm,
          padding: '3px 7px', fontFamily: typography.fontFamily, fontWeight: typography.weights.semibold,
        }}>
          {collapsed ? '\u25B6' : '\u25C0'}
        </button>
      </div>

      <div style={{
        flex: 1, padding: collapsed ? '8px 6px' : '12px 10px',
        display: 'flex', flexDirection: 'column', gap: spacing.xs,
      }}>
        <NavLink to="/groups" end style={({ isActive }) => ({ ...linkBase, ...(isActive ? linkActive : {}) })}>
          {collapsed ? '\u{1F465}' : '\u{1F465} Команды'}
        </NavLink>
        <NavLink to="/my-groups" style={({ isActive }) => ({ ...linkBase, ...(isActive ? linkActive : {}) })}>
          {collapsed ? '\u{1F3E0}' : '\u{1F3E0} Мои команды'}
        </NavLink>
        <NavLink to="/profile" style={({ isActive }) => ({ ...linkBase, ...(isActive ? linkActive : {}) })}>
          {collapsed ? '\u{1F464}' : '\u{1F464} Профиль'}
        </NavLink>
      </div>

      <div style={{
        padding: collapsed ? '8px 6px' : '12px 10px',
        borderTop: `1px solid ${colors.sidebarDivider}`,
        display: 'flex', flexDirection: 'column', gap: spacing.sm,
      }}>
        {!collapsed && (
          <div style={{ fontSize: typography.sizes.sm, color: colors.blueLight, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </div>
        )}
        <button onClick={logout} style={{
          width: '100%', padding: '5px 11px', background: colors.btnGhost,
          color: colors.textOnDark, border: 'none', borderRadius: borderRadius.sm,
          fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold,
          cursor: 'pointer', fontFamily: typography.fontFamily,
        }}>
          {collapsed ? '\u25B6' : 'Выход'}
        </button>
      </div>
    </div>
  )
}

function AuthenticatedApp({ user, logout, setUser }) {
  const { groups, loading: groupsLoading, createGroup, joinGroup, leaveGroup, reload } = useGroups()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
      <Sidebar user={user} logout={logout} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ErrorBoundary>
        <PageMetaProvider>
          <Routes>
            <Route
              path="/groups"
              element={
                <GroupsPage
                  groups={groups}
                  loading={groupsLoading}
                  onCreateGroup={createGroup}
                  onJoinGroup={joinGroup}
                  onLeaveGroup={leaveGroup}
                  user={user}
                />
              }
            />
            <Route
              path="/groups/:id"
              element={<GroupPage user={user} />}
            />
            <Route
              path="/my-groups"
              element={
                <MyGroupsPage
                  groups={groups}
                  loading={groupsLoading}
                  onReload={reload}
                  user={user}
                />
              }
            />
            <Route
              path="/profile"
              element={<ProfilePage user={user} setUser={setUser} />}
            />
            <Route path="*" element={<Navigate to="/groups" replace />} />
          </Routes>
        </PageMetaProvider>
        </ErrorBoundary>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, loading, login, register, logout, setUser } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg, fontFamily: typography.fontFamily }}>
        <p style={{ color: colors.textSecondary }}>Загрузка...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/register" element={<RegisterPage onRegister={register} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return <AuthenticatedApp user={user} logout={logout} setUser={setUser} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
