import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/contacts'

export function useContacts(groupId) {
  const qc = useQueryClient()
  const key = ['contacts', groupId]

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => api.fetchContacts(groupId ? { group_id: groupId } : {}),
  })

  const update = useMutation({
    mutationFn: ({ id, data }) => api.updateContact(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries(key)
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old) => old?.map((c) => (c.id === id ? { ...c, ...data } : c)))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(key, ctx.prev),
  })

  return {
    contacts,
    loading: isLoading,
    reload: () => qc.invalidateQueries(key),
    update: (id, field, value) => update.mutate({ id, data: { [field]: value } }),
  }
}
