import client from './client'

export const fetchGroups = () =>
  client.get('/groups').then(r => r.data)

export const createGroup = (data) =>
  client.post('/groups', data).then(r => r.data)

export const getGroup = (id) =>
  client.get(`/groups/${id}`).then(r => r.data)

export const joinGroup = (id) =>
  client.post(`/groups/${id}/join`).then(r => r.data)

export const leaveGroup = (id) =>
  client.post(`/groups/${id}/leave`).then(r => r.data)

export const fetchMembers = (id) =>
  client.get(`/groups/${id}/members`).then(r => r.data)

export const approveMember = (groupId, userId) =>
  client.patch(`/groups/${groupId}/members/${userId}/approve`)

export const rejectMember = (groupId, userId) =>
  client.patch(`/groups/${groupId}/members/${userId}/reject`)

export const kickMember = (groupId, userId) =>
  client.delete(`/groups/${groupId}/members/${userId}`)

export const changeRole = (groupId, userId, role) =>
  client.put(`/groups/${groupId}/members/${userId}/role`, { role })

export const inviteUser = (groupId, userId) =>
  client.post(`/groups/${groupId}/invite?user_id=${userId}`)

export const deleteGroup = (id) =>
  client.delete(`/groups/${id}`)
