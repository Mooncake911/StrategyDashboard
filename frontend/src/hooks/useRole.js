import { useQuery } from '@tanstack/react-query'
import { fetchMembers } from '../api/groups'
import { useAuth } from './useAuth'

export function useRole(groupId) {
  const { user } = useAuth()

  const { data: members = [] } = useQuery({
    queryKey: ['members', groupId],
    queryFn: () => fetchMembers(groupId),
    enabled: !!groupId,
  })

  const me = members.find((m) => m.user_id === user?.id)

  return {
    role: me?.role ?? null,
    isAdmin: me?.role === 'admin',
    isMember: me?.status === 'approved',
    status: me?.status,
  }
}
