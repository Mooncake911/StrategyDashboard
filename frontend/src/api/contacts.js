import client from './client'

export const fetchContacts = (params) =>
  client.get('/contacts', { params }).then(r => r.data)

export const updateContact = (id, data) =>
  client.put(`/contacts/${id}`, data).then(r => r.data)
