import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '../api/initiatives'

export function useInitiatives(groupId) {
  const qc = useQueryClient()
  const key = ['initiatives', groupId]

  const { data: rows = [] } = useQuery({
    queryKey: key,
    queryFn: () => api.fetchInitiatives(groupId ? { group_id: groupId } : {}),
  })

  const updateRow = useMutation({
    mutationFn: ({ id, data }) => api.updateInitiative(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries(key)
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old) => old?.map((r) => (r.id === id ? { ...r, ...data } : r)))
      return { prev }
    },
    onError: (_, { id, data }, ctx) => qc.setQueryData(key, ctx.prev),
  })

  const changeStatus = useMutation({
    mutationFn: ({ id, status }) => api.setStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries(key)
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old) => old?.map((r) => (r.id === id ? { ...r, status } : r)))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(key, ctx.prev),
  })

  const removeRow = useMutation({
    mutationFn: (id) => api.deleteInitiative(id),
    onMutate: async (id) => {
      await qc.cancelQueries(key)
      const prev = qc.getQueryData(key)
      qc.setQueryData(key, (old) => old?.filter((r) => r.id !== id))
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(key, ctx.prev),
  })

  const addRow = useMutation({
    mutationFn: (data) => api.createInitiative(groupId ? { ...data, group_id: groupId } : data),
    onSuccess: (created) => {
      qc.setQueryData(key, (old) => [...(old || []), created])
    },
  })

  return {
    rows,
    reload: () => qc.invalidateQueries(key),
    updateRow: (id, field, value) => updateRow.mutate({ id, data: { [field]: value } }),
    changeStatus: (id, status) => changeStatus.mutate({ id, status }),
    removeRow: (id) => removeRow.mutate(id),
    addRow: (data) => addRow.mutateAsync(data),
    saving: updateRow.isPending || changeStatus.isPending || removeRow.isPending || addRow.isPending,
  }
}
