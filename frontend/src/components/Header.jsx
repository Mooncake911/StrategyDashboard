import React from 'react'
import { exportFile } from '../api/importExport'

async function handleExport() {
  try {
    const blob = await exportFile()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Дорожная_карта_Systeme_экспорт.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  } catch { /* ignore */ }
}

export default function Header({ onImportClick, rowsCount, onAddClick, fileName }) {
  return (
    <div style={containerStyle}>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', color: '#7EA8E0', textTransform: 'uppercase' }}>
          Systeme Electric
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>
          Дорожная карта продаж 2026
        </div>
        <div style={{ fontSize: 11, color: '#7EA8E0', marginTop: 1 }}>
          {fileName ? `📎 ${fileName}` : 'Газпром нефть · ЛУКОЙЛ'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onImportClick} style={btnGhost}>📂 Импорт xlsx</button>
        {rowsCount > 0 && (
          <>
            <button onClick={handleExport} style={{ ...btnGhost, background: '#1A5C3A' }}>
              ⬇ Экспорт xlsx
            </button>
            <button onClick={onAddClick} style={{ ...btnGhost, background: '#2E5FA3' }}>
              + Добавить строку
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const containerStyle = {
  background: '#1A2C4E', padding: '13px 20px',
  display: 'flex', alignItems: 'center',
  justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
}

const btnGhost = {
  padding: '6px 13px', background: 'rgba(255,255,255,.12)', color: '#fff',
  border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
}
