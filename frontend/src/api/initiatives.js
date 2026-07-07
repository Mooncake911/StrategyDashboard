import client from './client'

export const fetchInitiatives = (params) =>
  client.get('/initiatives', { params }).then(r => r.data)

export const createInitiative = (data) =>
  client.post('/initiatives', data).then(r => r.data)

export const updateInitiative = (id, data) =>
  client.put(`/initiatives/${id}`, data).then(r => r.data)

export const deleteInitiative = (id) =>
  client.delete(`/initiatives/${id}`)

export const setStatus = (id, status) =>
  client.patch(`/initiatives/${id}/status`, { status }).then(r => r.data)
