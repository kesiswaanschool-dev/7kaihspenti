import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import StudentDashboard from './pages/StudentDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/student/*" element={<StudentDashboard />} />
        <Route path="*" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Halaman Tidak Ditemukan (404)</h2>
            <p>Sepertinya Anda salah memasukkan alamat (URL).</p>
            <p>Jika Anda mencari Portal Orang Tua, silakan kunjungi: <strong><a href="/orangtua.html">/orangtua.html</a></strong></p>
            <br/>
            <a href="/" style={{ padding: '0.5rem 1rem', background: '#4F46E5', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Kembali ke Login Utama</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
