import React, { useState, useMemo, useRef } from 'react'
import Header from './components/Header'
import DropZone from './components/DropZone'
import AddModal from './components/AddModal'
import Toast from './components/Toast'
import RoadmapPage from './pages/RoadmapPage'
import GanttPage from './pages/GanttPage'
import KPIPage from './pages/KPIPage'
import ContactsPage from './pages/ContactsPage'
import KPIBar from './components/KPIBar'
import { useInitiatives } from './hooks/useInitiatives'
import { useContacts } from './hooks/useContacts'
import { importFile } from './api/importExport'

const TABS = [
  ['roadmap', '📋 Карта инициатив'],
  ['gantt', '📅 Временная шкала'],
  ['kpi', '📊 KPI Дашборд'],
  ['contacts', '👥 Трекер контактов'],
]

export default function App() {
  const [tab, setTab] = useState('drop')
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef(null)

  const {
    rows, reload,
    updateRow, changeStatus, removeRow, addRow,
  } = useInitiatives()
  const { contacts, update: updateContact, reload: reloadContacts } = useContacts()

  const kpiData = useMemo(() => {
    const total = rows.length
    const done = rows.filter(r => r.status === 'done').length
    const active = rows.filter(r => r.status === 'active').length
    const risk = rows.filter(r => r.status === 'risk').length
    const potential = rows.reduce((s, r) => s + (r.potential || 0), 0)
    const pct = total ? Math.round(done / total * 100) : 0
    return { pct, done, active, risk, potential, total }
  }, [rows])

  const showToast = (msg) => setToast(msg)

  const handleImportSuccess = (result, name) => {
    setFileName(name || 'Импортировано')
    setTab('roadmap')
    reload()
    reloadContacts()
    showToast(`✅ Загружено ${result.imported} инициатив и ${result.contacts} контактов`)
  }

  const handleImportClick = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    try {
      const result = await importFile(file)
      handleImportSuccess(result, file.name)
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.detail || err.message))
    }
    fileRef.current.value = ''
  }

  const handleAdd = async (data) => {
    const created = await addRow(data)
    showToast(created ? '✅ Добавлено' : '❌ Ошибка при добавлении')
  }

  if (tab === 'drop') {
    return (
      <div style={layoutStyle}>
        <Header rowsCount={0} onImportClick={() => fileRef.current?.click()} onAddClick={() => {}} fileName="" />
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportClick} />
        <DropZone onImportSuccess={(r) => handleImportSuccess(r, '')} />
      </div>
    )
  }

  return (
    <div style={layoutStyle}>
      <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportClick} />
      <Header
        rowsCount={rows.length}
        onImportClick={() => fileRef.current?.click()}
        onAddClick={() => setShowModal(true)}
        fileName={fileName}
      />

      <div style={tabBarStyle}>
        {TABS.map(([id, label]) => (
          <div key={id} onClick={() => setTab(id)} style={{
            padding: '11px 15px', fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer',
            fontWeight: tab === id ? 600 : 500, color: tab === id ? '#2E5FA3' : '#6B7A99',
            borderBottom: tab === id ? '2.5px solid #2E5FA3' : '2.5px solid transparent',
            marginBottom: -1.5, transition: 'all .15s',
          }}>
            {label}
          </div>
        ))}
      </div>

      {(tab === 'roadmap' || tab === 'kpi') && <KPIBar kpi={kpiData} />}

      {tab === 'roadmap' && (
        <RoadmapPage rows={rows} updateRow={updateRow} changeStatus={changeStatus} removeRow={removeRow} />
      )}
      {tab === 'gantt' && <GanttPage rows={rows} />}
      {tab === 'kpi' && <KPIPage rows={rows} />}
      {tab === 'contacts' && <ContactsPage contacts={contacts} updateContact={updateContact} />}

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}

const layoutStyle = {
  minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F4F7FC', fontFamily: "'Inter', sans-serif",
}

const tabBarStyle = {
  background: '#fff', borderBottom: '1.5px solid #DDE3EF', display: 'flex', padding: '0 20px', overflowX: 'auto',
}
