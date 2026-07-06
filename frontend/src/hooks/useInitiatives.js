import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchInitiatives,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  setStatus,
} from '../api/initiatives'

export function useInitiatives() {
  const [rows, setRows] = useState([])
  const rowsRef = useRef(rows)

  useEffect(() => { rowsRef.current = rows }, [rows])

  const load = useCallback(async () => {
    try {
      const data = await fetchInitiatives()
      setRows(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { load() }, [load])

  const updateRow = async (id, field, value) => {
    const snapshot = rowsRef.current
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    try {
      await updateInitiative(id, { [field]: value })
    } catch {
      setRows(snapshot)
    }
  }

  const changeStatus = async (id, status) => {
    const snapshot = rowsRef.current
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    try {
      await setStatus(id, status)
    } catch {
      setRows(snapshot)
    }
  }

  const removeRow = async (id) => {
    const snapshot = rowsRef.current
    setRows(prev => prev.filter(r => r.id !== id))
    try {
      await deleteInitiative(id)
    } catch {
      setRows(snapshot)
    }
  }

  const addRow = async (data) => {
    try {
      const created = await createInitiative(data)
      setRows(prev => [...prev, created])
      return created
    } catch { return null }
  }

  return {
    rows, reload: load,
    updateRow, changeStatus, removeRow, addRow,
  }
}
