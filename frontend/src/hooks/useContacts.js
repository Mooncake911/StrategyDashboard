import { useState, useEffect, useCallback } from 'react'
import { fetchContacts, updateContact } from '../api/contacts'

export function useContacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchContacts()
      setContacts(data)
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const update = async (id, field, value) => {
    const prev = contacts
    setContacts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    try {
      await updateContact(id, { [field]: value })
    } catch {
      setContacts(prev)
    }
  }

  return { contacts, loading, update, reload: load }
}
