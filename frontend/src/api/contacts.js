import client from './client'

export const fetchContacts = () =>
  client.get('/contacts').then(r => r.data)

export const updateContact = (id, data) =>
  client.put(`/contacts/${id}`, data).then(r => r.data)
