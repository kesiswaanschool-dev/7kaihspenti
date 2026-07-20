import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, FileText, Settings, LogOut, Upload, Download } from 'lucide-react'
import { supabase } from '../supabaseClient'
import * as XLSX from 'xlsx'

const DataSiswa = () => {
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    nis: '', nama_murid: '', kelas: '', wali_kelas: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (!error && data) setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDownloadTemplate = () => {
    const templateData = [
      { "nis": "12345", "nama_murid": "Budi Santoso", "kelas": "7A", "wali_kelas": "Bpk. Guru" },
      { "nis": "12346", "nama_murid": "Siti Aminah", "kelas": "7A", "wali_kelas": "Bpk. Guru" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template_Siswa");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Template_Data_Siswa.xlsx`;
    link.click();
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(buffer, { type: 'array' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const formattedData = data.map(row => ({
          nis: String(row.nis || row.NIS || ''),
          nama_murid: String(row.nama_murid || row['Nama Siswa'] || row.Nama || ''),
          kelas: String(row.kelas || row.Kelas || '-'),
          wali_kelas: String(row.wali_kelas || row['Wali Kelas'] || '-')
        })).filter(row => row.nis && row.nama_murid);

        if (formattedData.length === 0) {
          alert('Format data salah atau kosong. Pastikan ada kolom nis dan nama_murid.');
          return;
        }

        const { error } = await supabase.from('students').insert(formattedData);
        if (error) {
          alert('Gagal import data: ' + error.message);
        } else {
          alert(`Berhasil mengimport ${formattedData.length} data siswa!`);
          fetchStudents();
        }
      } catch (err) {
        alert('Terjadi kesalahan saat membaca file Excel.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null; // reset input
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('students').insert([formData]);
    if (error) {
      alert('Gagal menambahkan siswa: ' + error.message);
    } else {
      alert('Data Siswa berhasil ditambahkan!');
      setFormData({ nis: '', nama_murid: '', kelas: '', wali_kelas: '' });
      setShowForm(false);
      fetchStudents();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2>Data Siswa</h2>
        <div className="flex gap-2">
          <button onClick={handleDownloadTemplate} className="btn btn-outline" style={{ borderColor: '#10B981', color: '#10B981' }}>
            <Download size={18}/> Template Excel
          </button>
          <label className="btn btn-primary cursor-pointer mb-0 flex items-center justify-center gap-2">
            <Upload size={18}/> Import Excel
            <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleImportExcel} />
          </label>
          <button className="btn btn-outline" onClick={() => setShowForm(!showForm)} style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
            {showForm ? 'Batal' : '+ Tambah Manual'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="glass-panel mb-6 animate-fade-in">
          <h3 className="mb-4" style={{ color: 'var(--primary-color)' }}>Form Tambah Siswa</h3>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4">
              <div className="form-group flex-1">
                <label className="form-label">NIS</label>
                <input type="text" name="nis" value={formData.nis} onChange={handleChange} className="form-control" required placeholder="Masukkan NIS" />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Nama Murid</label>
                <input type="text" name="nama_murid" value={formData.nama_murid} onChange={handleChange} className="form-control" required placeholder="Masukkan Nama Murid" />
              </div>
            </div>
            <div className="flex gap-4 mb-4">
              <div className="form-group flex-1">
                <label className="form-label">Kelas</label>
                <input type="text" name="kelas" value={formData.kelas} onChange={handleChange} className="form-control" required placeholder="Contoh: 6A" />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Wali Kelas</label>
                <input type="text" name="wali_kelas" value={formData.wali_kelas} onChange={handleChange} className="form-control" required placeholder="Nama Wali Kelas" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">Simpan Data Siswa</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>NIS</th>
              <th>Nama Murid</th>
              <th>Kelas</th>
              <th>Wali Kelas</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center">Memuat data...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-secondary">Belum ada data siswa</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.nis}</td>
                  <td>{student.nama_murid}</td>
                  <td>{student.kelas}</td>
                  <td>{student.wali_kelas}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 p-4 glass-panel text-sm text-center">
        <p className="mb-2"><strong>Format Excel:</strong> NIS, Nama Murid, Kelas, Wali Kelas</p>
        <a href="#" className="btn btn-outline">Download Template Excel</a>
      </div>
    </div>
  )
}

const Laporan = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterNama, setFilterNama] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  
  const [filterType, setFilterType] = useState('semester');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterHari, setFilterHari] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterNama, filterKelas, filterType, filterSemester, filterBulan, filterHari]);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase.from('habits_log').select('*, students(nis, nama_murid, kelas)');
    
    if (filterType === 'semester' && filterSemester) query = query.eq('semester', filterSemester);
    if (filterType === 'hari' && filterHari) query = query.eq('tanggal', filterHari);
    if (filterType === 'bulan' && filterBulan) query = query.like('tanggal', `${filterBulan}%`);
    
    const { data, error } = await query.order('tanggal', { ascending: true });
    if (!error && data) {
      let filtered = data;
      if (filterNama) filtered = filtered.filter(l => l.students?.nama_murid.toLowerCase().includes(filterNama.toLowerCase()));
      if (filterKelas) filtered = filtered.filter(l => l.students?.kelas.toLowerCase().includes(filterKelas.toLowerCase()));
      setLogs(filtered);
    } else {
      setLogs([]);
    }
    setLoading(false);
  };

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

  const handleExportExcel = () => {
    if (logs.length === 0) {
      alert("Tidak ada data laporan untuk diexport!");
      return;
    }
    
    // Siapkan data untuk diexport
    const dataToExport = logs.map(log => ({
      "Tanggal": log.tanggal,
      "Semester": log.semester,
      "NIS": log.students?.nis,
      "Nama Siswa": log.students?.nama_murid,
      "Kelas": log.students?.kelas,
      "Bangun Pagi": log.bangun_pagi ? "Ya" : "Tidak",
      "Keterangan Bangun Pagi": log.keterangan_bangun_pagi || "",
      "Beribadah": log.beribadah ? "Ya" : "Tidak",
      "Keterangan Beribadah": log.keterangan_beribadah || "",
      "Berolahraga": log.berolahraga ? "Ya" : "Tidak",
      "Keterangan Berolahraga": log.keterangan_berolahraga || "",
      "Gemar Belajar": log.gemar_belajar ? "Ya" : "Tidak",
      "Keterangan Belajar": log.keterangan_gemar_belajar || "",
      "Makan Sehat": log.makan_sehat ? "Ya" : "Tidak",
      "Keterangan Makan Sehat": log.keterangan_makan_sehat || "",
      "Bermasyarakat": log.bermasyarakat ? "Ya" : "Tidak",
      "Keterangan Bermasyarakat": log.keterangan_bermasyarakat || "",
      "Tidur Cepat": log.tidur_cepat ? "Ya" : "Tidak",
      "Keterangan Tidur": log.keterangan_tidur_cepat || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan_7KAIH");
    
    // Buat nama file berdasarkan filter jika ada
    let fileName = "Laporan_7KAIH";
    if (filterType === 'semester' && filterSemester) fileName += `_Semester_${filterSemester}`;
    if (filterType === 'bulan' && filterBulan) fileName += `_Bulan_${filterBulan}`;
    if (filterType === 'hari' && filterHari) fileName += `_Tanggal_${filterHari}`;
    if (filterKelas) fileName += `_Kelas_${filterKelas}`;
    
    // Gunakan Blob agar lebih kompatibel dengan berbagai browser dan perangkat
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    const url = window.URL.createObjectURL(fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xlsx`;
    link.click();
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2>Laporan 7 KAIH</h2>
        <button onClick={handleExportExcel} className="btn btn-primary"><Download size={18}/> Export Excel</button>
      </div>
      <div className="glass-panel mb-6">
        <h3 className="mb-4 text-sm">Filter Laporan</h3>
        <div className="flex gap-4 mb-4">
          <div className="form-group flex-1">
            <label className="form-label">Nama Siswa</label>
            <input type="text" className="form-control" placeholder="Cari nama..." value={filterNama} onChange={e => setFilterNama(e.target.value)} />
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Kelas</label>
            <input type="text" className="form-control" placeholder="Semua Kelas" value={filterKelas} onChange={e => setFilterKelas(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="form-group" style={{ width: '200px' }}>
            <label className="form-label">Rentang Waktu</label>
            <select className="form-control" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="semester">Per Semester</option>
              <option value="bulan">Per Bulan</option>
              <option value="hari">Per Hari</option>
            </select>
          </div>
          <div className="form-group flex-1">
            <label className="form-label">Pilih {filterType === 'hari' ? 'Hari' : filterType === 'bulan' ? 'Bulan' : 'Semester'}</label>
            {filterType === 'semester' && (
              <select className="form-control" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
                <option value="">Semua Semester</option>
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            )}
            {filterType === 'bulan' && (
              <input type="month" className="form-control" value={filterBulan} onChange={e => setFilterBulan(e.target.value)} />
            )}
            {filterType === 'hari' && (
              <input type="date" className="form-control" value={filterHari} onChange={e => setFilterHari(e.target.value)} />
            )}
          </div>
        </div>
      </div>
      <div className="table-container">
        <table className="modern-table text-sm">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama</th>
              <th>Kelas</th>
              <th className="text-center">Bangun Pagi</th>
              <th className="text-center">Beribadah</th>
              <th className="text-center">Berolahraga</th>
              <th className="text-center">Belajar</th>
              <th className="text-center">Makan Sehat</th>
              <th className="text-center">Sosial</th>
              <th className="text-center">Tidur</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" className="text-center">Memuat laporan...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="10" className="text-center text-secondary">Belum ada data laporan</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{log.tanggal}</td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{log.students?.nama_murid}</td>
                  <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{log.students?.kelas}</td>
                  {renderHabitCell(log.bangun_pagi, log.keterangan_bangun_pagi)}
                  {renderHabitCell(log.beribadah, log.keterangan_beribadah)}
                  {renderHabitCell(log.berolahraga, log.keterangan_berolahraga)}
                  {renderHabitCell(log.gemar_belajar, log.keterangan_gemar_belajar)}
                  {renderHabitCell(log.makan_sehat, log.keterangan_makan_sehat)}
                  {renderHabitCell(log.bermasyarakat, log.keterangan_bermasyarakat)}
                  {renderHabitCell(log.tidur_cepat, log.keterangan_tidur_cepat)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PengaturanAkun = () => {
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [userForm, setUserForm] = useState({ nis: '', nama_murid: '' });
  const [adminsList, setAdminsList] = useState([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const { data } = await supabase.from('admins').select('id, username, password, created_at').order('created_at', { ascending: false });
    if (data) setAdminsList(data);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('admins').insert([adminForm]);
    if (error) alert('Gagal: ' + error.message);
    else { 
      alert('Akun admin berhasil ditambahkan!'); 
      setAdminForm({ username: '', password: '' }); 
      fetchAdmins();
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('students').insert([{ nis: userForm.nis, nama_murid: userForm.nama_murid, kelas: '-', wali_kelas: '-' }]);
    if (error) alert('Gagal: ' + error.message);
    else { alert('Akun user berhasil ditambahkan!'); setUserForm({ nis: '', nama_murid: '' }); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2>Pengaturan Akun</h2>
      </div>
      
      <div className="flex gap-6">
        <div className="glass-panel flex-1">
          <h3 className="mb-4" style={{ color: 'var(--primary-color)' }}>Tambah Akun Admin</h3>
          <form onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label className="form-label">Username Admin</label>
              <input type="text" className="form-control" required placeholder="Masukkan username baru" value={adminForm.username} onChange={e => setAdminForm({...adminForm, username: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password Admin</label>
              <input type="password" className="form-control" required placeholder="Masukkan password" value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4">Simpan Admin</button>
          </form>

          <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="mb-4">Daftar Akun Admin</h4>
            <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Tanggal Dibuat</th>
                  </tr>
                </thead>
                <tbody>
                  {adminsList.map(admin => (
                    <tr key={admin.id}>
                      <td className="font-medium">{admin.username}</td>
                      <td>{admin.password}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                    </tr>
                  ))}
                  {adminsList.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center">Belum ada data admin</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="glass-panel flex-1">
          <h3 className="mb-4" style={{ color: 'var(--primary-color)' }}>Tambah Akun User (Siswa)</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Akun user berfungsi untuk login siswa. ID menggunakan Nama Murid, dan Password menggunakan NIS.
          </p>
          <form onSubmit={handleUserSubmit}>
            <div className="form-group">
              <label className="form-label">ID / Nama Murid</label>
              <input type="text" className="form-control" required placeholder="Contoh: Budi Santoso" value={userForm.nama_murid} onChange={e => setUserForm({...userForm, nama_murid: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password / NIS</label>
              <input type="text" className="form-control" required placeholder="Contoh: 12345" value={userForm.nis} onChange={e => setUserForm({...userForm, nis: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-4">Simpan User</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dataSiswa')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    navigate('/')
  }

  const renderContent = () => {
    switch(activeMenu) {
      case 'dataSiswa': return <DataSiswa />
      case 'laporan': return <Laporan />
      case 'pengaturan': return <PengaturanAkun />
      default: return <DataSiswa />
    }
  }

  return (
    <div className="app-container" style={{ backgroundColor: '#f1f5f9' }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ width: '280px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div className="p-6 flex flex-col items-center text-center" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <img src="/logo.png" alt="Logo SMP Negeri 3 Batam" style={{ width: '60px', height: 'auto', marginBottom: '0.5rem' }} />
          <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>7 KAIH</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary-color)', margin: 0 }}>SMPN 3 BATAM</p>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>Admin Dashboard</p>
        </div>
        
        <div className="flex-col flex-1 p-4 gap-2">
          <button 
            className={`btn w-full justify-start ${activeMenu === 'dataSiswa' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeMenu !== 'dataSiswa' ? 'none' : '' }}
            onClick={() => setActiveMenu('dataSiswa')}
          >
            <Users size={20} /> Data Siswa
          </button>
          
          <button 
            className={`btn w-full justify-start ${activeMenu === 'laporan' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeMenu !== 'laporan' ? 'none' : '' }}
            onClick={() => setActiveMenu('laporan')}
          >
            <FileText size={20} /> Laporan
          </button>
          
          <button 
            className={`btn w-full justify-start ${activeMenu === 'pengaturan' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: activeMenu !== 'pengaturan' ? 'none' : '' }}
            onClick={() => setActiveMenu('pengaturan')}
          >
            <Settings size={20} /> Pengaturan Akun
          </button>
        </div>

        <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} className="btn btn-outline w-full justify-start" style={{ color: 'var(--danger-color)', border: 'none' }}>
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  )
}
