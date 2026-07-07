import client from './client'

export const importFile = (file, groupId) => {
  const form = new FormData()
  form.append('file', file)
  const params = groupId ? { group_id: groupId } : {}
  return client.post('/import', form, {
    params,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const exportFile = (groupId) =>
  client.get('/export', {
    responseType: 'blob',
    params: groupId ? { group_id: groupId } : {},
  }).then(r => r.data)
