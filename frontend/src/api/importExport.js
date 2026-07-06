import client from './client'

export const importFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const exportFile = () =>
  client.get('/export', { responseType: 'blob' }).then(r => r.data)
