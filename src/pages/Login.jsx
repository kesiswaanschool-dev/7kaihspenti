import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, User, Lock, ArrowRight } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if it's an admin
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('username', userId)
        .eq('password', password)
        .single()

      if (admin) {
        localStorage.setItem('userRole', 'admin')
        navigate('/admin')
        return
      }

      // Check if it's a student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .ilike('nama_murid', userId)
        .eq('nis', password)
        .single()

      if (student) {
        localStorage.setItem('userRole', 'student')
        localStorage.setItem('studentData', JSON.stringify(student))
        navigate('/student')
      } else {
        setError('ID atau Password salah. Gunakan Nama Murid dan NIS yang terdaftar.')
      }
    } catch (err) {
      console.error(err)
      setError('Koneksi database gagal atau kredensial salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="text-center mb-6">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-white p-2 rounded-full mb-4 shadow-sm">
              <img src="/logo.png" alt="Logo SMP Negeri 3 Batam" style={{ width: '80px', height: 'auto' }} />
            </div>
            <h1 className="text-4xl font-bold text-center mb-1" style={{ color: 'var(--primary-color)' }}>Aplikasi 7 KAIH</h1>
            <h2 className="text-xl font-bold text-center mb-4" style={{ color: 'var(--secondary-color)' }}>SMP NEGERI 3 BATAM</h2>
            <p className="text-center text-sm opacity-80 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Membangun karakter unggul melalui pembiasaan positif setiap hari.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3" style={{ backgroundColor: 'var(--danger-color)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">ID / Nama Murid</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Masukkan ID atau Nama"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password / NIS</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Masukkan Password atau NIS"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-full mt-4" style={{ padding: '0.75rem', fontSize: '1rem' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'} <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          &copy; 2026 Aplikasi 7 KAIH
        </p>
      </div>
    </div>
  )
}
