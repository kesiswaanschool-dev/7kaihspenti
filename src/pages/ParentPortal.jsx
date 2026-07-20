import React, { useState } from 'react'
import { Search, ArrowLeft, Filter } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function ParentPortal() {
  const [nis, setNis] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [studentData, setStudentData] = useState(null)
  
  // Filter state
  const [filterType, setFilterType] = useState('semester') // hari, bulan, semester
  const [filterValue, setFilterValue] = useState('Ganjil')
  const [filterBulan, setFilterBulan] = useState('')
  const [filterHari, setFilterHari] = useState('')
  const [history, setHistory] = useState([])

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Fetch student
    const { data: student, error } = await supabase.from('students').select('*').eq('nis', nis).single()
    
    if (student) {
      setStudentData(student)
      setHasSearched(true)
      
      // Fetch history
      const { data: logs } = await supabase
        .from('habits_log')
        .select('*')
        .eq('student_id', student.id)
        .order('tanggal', { ascending: true })
        
      setHistory(logs || [])
    } else {
      alert('Data siswa dengan NIS tersebut tidak ditemukan.')
      setHasSearched(false)
      setStudentData(null)
    }
    
    setLoading(false)
  }

  const getFilteredHistory = () => {
    if (!history) return []
    return history.filter(log => {
      if (filterType === 'semester') return log.semester === filterValue
      if (filterType === 'hari' && filterHari) return log.tanggal === filterHari
      if (filterType === 'bulan' && filterBulan) return log.tanggal.startsWith(filterBulan)
      return true
    })
  }
  
  const filteredHistory = getFilteredHistory()

  const renderHabitCell = (isChecked, keterangan) => (
    <td className="text-center" style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
      <div>{isChecked ? '✅' : '❌'}</div>
      {keterangan && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '120px', wordWrap: 'break-word', margin: '0.25rem auto 0' }}>
          {keterangan}
        </div>
      )}
    </td>
  )

  return (
    <div className="app-container flex-col items-center py-10" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', minHeight: '100vh' }}>
      
      <div style={{ width: '100%', maxWidth: '900px', marginBottom: '2rem' }}>

        
        <div className="glass-panel text-center animate-fade-in mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="Logo SMP Negeri 3 Batam" style={{ width: '70px', height: 'auto', marginBottom: '1rem' }} />
          <h1 style={{ color: 'var(--primary-color)', marginBottom: '0.2rem' }}>Portal Orang Tua</h1>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary-color)', marginBottom: '0.5rem', fontWeight: 'bold' }}>SMP NEGERI 3 BATAM</h2>
          <p>Pantau perkembangan Kebiasaan Anak Indonesia Hebat (7 KAIH)</p>
          
          <form onSubmit={handleSearch} className="flex gap-2 justify-center mt-6" style={{ maxWidth: '500px', margin: '1.5rem auto 0' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '2.5rem', borderRadius: 'var(--radius-full)' }} 
                placeholder="Masukkan Nomor Induk Siswa (NIS)" 
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0 1.5rem' }} disabled={loading}>
              {loading ? 'Mencari...' : 'Cari Data'}
            </button>
          </form>
        </div>

        {hasSearched && studentData && (
          <div className="glass-panel animate-fade-in">
            <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ margin: 0 }}>Data Siswa</h3>
                <p style={{ margin: 0, fontWeight: 500, color: 'var(--primary-color)' }}>{studentData.nama_murid} - Kelas {studentData.kelas}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} color="var(--text-secondary)" />
                  <span className="text-sm">Filter:</span>
                </div>
                <select className="form-control" style={{ width: 'auto', padding: '0.4rem 1rem' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="hari">Per Hari</option>
                  <option value="bulan">Per Bulan</option>
                  <option value="semester">Per Semester</option>
                </select>
                
                {filterType === 'semester' && (
                  <select className="form-control" style={{ width: 'auto', padding: '0.4rem 1rem' }} value={filterValue} onChange={e => setFilterValue(e.target.value)}>
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                )}
                
                {filterType === 'bulan' && (
                  <input type="month" className="form-control" style={{ width: 'auto', padding: '0.4rem 1rem' }} value={filterBulan} onChange={e => setFilterBulan(e.target.value)} />
                )}
                
                {filterType === 'hari' && (
                  <input type="date" className="form-control" style={{ width: 'auto', padding: '0.4rem 1rem' }} value={filterHari} onChange={e => setFilterHari(e.target.value)} />
                )}
              </div>
            </div>

            <div className="table-container">
              <table className="modern-table text-sm">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Bangun Pagi</th>
                    <th>Beribadah</th>
                    <th>Berolahraga</th>
                    <th>Makan Sehat</th>
                    <th>Belajar</th>
                    <th>Sosial</th>
                    <th>Tidur Cepat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-secondary">
                        Belum ada data laporan untuk filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map(log => (
                      <tr key={log.id}>
                        <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{log.tanggal}</td>
                        {renderHabitCell(log.bangun_pagi, log.keterangan_bangun_pagi)}
                        {renderHabitCell(log.beribadah, log.keterangan_beribadah)}
                        {renderHabitCell(log.berolahraga, log.keterangan_berolahraga)}
                        {renderHabitCell(log.makan_sehat, log.keterangan_makan_sehat)}
                        {renderHabitCell(log.gemar_belajar, log.keterangan_gemar_belajar)}
                        {renderHabitCell(log.bermasyarakat, log.keterangan_bermasyarakat)}
                        {renderHabitCell(log.tidur_cepat, log.keterangan_tidur_cepat)}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
