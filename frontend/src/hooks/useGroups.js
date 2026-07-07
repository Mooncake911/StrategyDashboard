import { useState, useEffect, useCallback } from 'react'
import { fetchGroups, createGroup as createGroupApi, joinGroup as joinGroupApi, leaveGroup as leaveGroupApi } from '../api/groups'

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchGroups()
      setGroups(data)
    } catch (e) { console.error('Failed to load groups', e) } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createGroup = async (name, description) => {
    const g = await createGroupApi({ name, description })
    setGroups((prev) => [...prev, g])
    return g
  }

  const joinGroup = async (id) => {
    await joinGroupApi(id)
    await load()
  }

  const leaveGroup = async (id) => {
    await leaveGroupApi(id)
    await load()
  }

  return {
    groups, loading, reload: load,
    createGroup, joinGroup, leaveGroup,
  }
}
