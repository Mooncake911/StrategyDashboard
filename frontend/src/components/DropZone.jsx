import React, { useState, useRef } from 'react'
import { importFile } from '../api/importExport'

export default function DropZone({ onImportSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setLoading(true)
    try {
      const result = await importFile(file)
      onImportSuccess(result)
    } catch (err) {
      alert('Ошибка импорта: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
    // reset input value so the same file can be re-imported
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <input
        type="file" accept=".xlsx,.xls" ref={fileRef}
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2.5px dashed ${dragging ? '#2E5FA3' : '#7EA8E0'}`,
          borderRadius: 16, padding: '60px 40px', textAlign: 'center',
          cursor: 'pointer', transition: 'all .2s',
          background: dragging ? 'rgba(46,95,163,.08)' : 'rgba(46,95,163,.03)',
          maxWidth: 500, width: '100%', opacity: loading ? 0.6 : 1,
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A2C4E', marginBottom: 8 }}>
          {loading ? 'Загрузка…' : 'Перетащите файл Excel сюда'}
        </div>
        <div style={{ fontSize: 13, color: '#6B7A99', marginBottom: 20 }}>
          Или нажмите для выбора файла · Поддерживается <b>.xlsx</b>
        </div>
        <button
          onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
          style={{
            padding: '9px 20px', background: '#2E5FA3', color: '#fff',
            border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          📂 Выбрать файл
        </button>
      </div>
    </div>
  )
}
