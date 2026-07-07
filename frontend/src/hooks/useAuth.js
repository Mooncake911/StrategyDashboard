import { useState, useEffect, useCallback } from 'react'
import { login as loginApi, register as registerApi, getMe } from '../api/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    const res = await loginApi(formData)
    localStorage.setItem('token', res.access_token)
    const me = await getMe()
    setUser(me)
    return me
  }, [])

  const register = useCallback(async (email, password, fullName) => {
    const u = await registerApi({ email, password, full_name: fullName })
    await login(email, password)
    return u
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return { user, loading, login, register, logout, setUser }
}
