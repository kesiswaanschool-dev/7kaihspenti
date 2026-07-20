import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Save, Calendar, CheckSquare } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [student, setStudent] = useState({ nama_murid: '', kelas: '', nis: '' })
  
  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [semester, setSemester] = useState('Ganjil')
  
  const habitsList = [
    { id: 'bangun_pagi', label: 'Bangun Pagi' },
    { id: 'beribadah', label: 'Beribadah' },
    { id: 'berolahraga', label: 'Berolahraga' },
    { id: 'makan_sehat', label: 'Makan Sehat' },
    { id: 'gemar_belajar', label: 'Gemar Belajar' },
    { id: 'bermasyarakat', label: 'Bermasyarakat' },
    { id: 'tidur_cepat', label: 'Tidur Cepat' }
  ]

  const [habits, setHabits] = useState(
    habitsList.reduce((acc, curr) => {
      acc[curr.id] = { checked: false, keterangan: '' }
      return acc
    }, {})
  )

  const [history, setHistory] = useState([])

  const fetchHistory = async (studentId) => {
    const { data, error } = await supabase
      .from('habits_log')
      .select('*')
      .eq('student_id', studentId)
      .order('tanggal', { ascending: true })
    
    if (data) setHistory(data)
  }

  useEffect(() => {
    const role = localStorage.getItem('userRole')
    const data = localStorage.getItem('studentData')
    if (role !== 'student' || !data) {
      navigate('/')
    } else {
      const parsedData = JSON.parse(data)
      setStudent(parsedData)
      fetchHistory(parsedData.id)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('studentData')
    navigate('/')
  }

  const handleCheckboxChange = (id) => {
    setHabits(prev => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id].checked }
    }))
  }

  const handleKeteranganChange = (id, value) => {
    setHabits(prev => ({
      ...prev,
      [id]: { ...prev[id], keterangan: value }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      student_id: student.id,
      tanggal: tanggal,
      semester: semester,
      bangun_pagi: habits.bangun_pagi.checked,
      keterangan_bangun_pagi: habits.bangun_pagi.keterangan,
      beribadah: habits.beribadah.checked,
      keterangan_beribadah: habits.beribadah.keterangan,
      berolahraga: habits.berolahraga.checked,
      keterangan_berolahraga: habits.berolahraga.keterangan,
      makan_sehat: habits.makan_sehat.checked,
      keterangan_makan_sehat: habits.makan_sehat.keterangan,
      gemar_belajar: habits.gemar_belajar.checked,
      keterangan_gemar_belajar: habits.gemar_belajar.keterangan,
      bermasyarakat: habits.bermasyarakat.checked,
      keterangan_bermasyarakat: habits.bermasyarakat.keterangan,
      tidur_cepat: habits.tidur_cepat.checked,
      keterangan_tidur_cepat: habits.tidur_cepat.keterangan
    }

    const { error } = await supabase.from('habits_log').insert([payload])
    
    if (error) {
      if (error.code === '23505') {
         alert('Anda sudah mengisi 7 KAIH untuk tanggal ini.')
      } else {
         alert('Terjadi kesalahan: ' + error.message)
      }
    } else {
      alert('Data berhasil disimpan!')
      fetchHistory(student.id)
      
      // Reset checks
      setHabits(habitsList.reduce((acc, curr) => {
        acc[curr.id] = { checked: false, keterangan: '' }
        return acc
      }, {}))
    }
  }

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
    <div className="app-container flex-col" style={{ backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header className="glass-panel" style={{ borderRadius: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo SMP Negeri 3 Batam" style={{ width: '40px', height: 'auto' }} />
          <div>
            <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Aplikasi 7 KAIH <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', fontWeight: 'bold', marginLeft: '0.5rem' }}>SMPN 3 BATAM</span></h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Halo, {student.nama_murid} ({student.kelas})</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}>
          <LogOut size={18} /> Keluar
        </button>
      </header>

      <div className="main-content" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel animate-fade-in mb-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckSquare size={24} color="var(--primary-color)" />
            <h2 style={{ margin: 0 }}>Form 7 KAIH</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-6">
              <div className="form-group flex-1">
                <label className="form-label">Tanggal</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="date" className="form-control" style={{ paddingLeft: '2.5rem' }} value={tanggal} onChange={e => setTanggal(e.target.value)} required />
                </div>
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Semester</label>
                <select className="form-control" value={semester} onChange={e => setSemester(e.target.value)}>
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </div>

            <div className="table-container mb-6">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Kebiasaan</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>Checklist</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {habitsList.map(habit => (
                    <tr key={habit.id}>
                      <td style={{ fontWeight: 500 }}>{habit.label}</td>
                      <td style={{ textAlign: 'center' }}>
                        <label className="checkbox-container justify-center">
                          <input 
                            type="checkbox" 
                            checked={habits[habit.id].checked}
                            onChange={() => handleCheckboxChange(habit.id)}
                          />
                        </label>
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Tambahkan keterangan..." 
                          value={habits[habit.id].keterangan}
                          onChange={(e) => handleKeteranganChange(habit.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                <Save size={20} /> Simpan Data
              </button>
            </div>
          </form>
        </div>

        {/* History Section */}
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="mb-4">Riwayat Pengisian 7 KAIH</h3>
          <div className="table-container">
            <table className="modern-table text-sm">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Semester</th>
                  <th>Bangun Pagi</th>
                  <th>Beribadah</th>
                  <th>Berolahraga</th>
                  <th>Makan Sehat</th>
                  <th>Belajar</th>
                  <th>Sosial</th>
                  <th>Tidur</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-secondary">Belum ada riwayat pengisian.</td>
                  </tr>
                ) : (
                  history.map(log => (
                    <tr key={log.id}>
                      <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{log.tanggal}</td>
                      <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{log.semester}</td>
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
      </div>
    </div>
  )
}
