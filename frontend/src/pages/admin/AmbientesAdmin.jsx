import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconPencil, IconTrash, IconEye } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarAdmin from '../../components/SidebarAdmin';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
import '../../pages/admin/AmbientesAdmin.css';

const LS_AMB = 'amb_local';
const getLocalA = () => { try { return JSON.parse(localStorage.getItem(LS_AMB)) || []; } catch { return []; } };
const saveLocalA = (data) => localStorage.setItem(LS_AMB, JSON.stringify(data));
const nextIdA = (list) => list.length ? Math.max(...list.map(a => a.id_ambiente || 0)) + 1 : 1;
import './AmbientesAdmin.css';

const AmbientesAdmin = () => {
  const navigate = useNavigate();
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', direccion: '' });
  const [editData, setEditData] = useState({ nombre: '', direccion: '' });
  const [filtro, setFiltro] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;
  const token = localStorage.getItem('token');

  useEffect(() => { if (!token) { navigate('/login'); return; } cargar(); }, []);

  const exportarExcel = async () => {
  try {
    const res = await fetch('/ambiente/excel', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { const text = await res.text(); let m = 'Error al exportar'; try { m = JSON.parse(text).mensaje || m; } catch {} alert(m); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ambientes.xlsx'; a.click();
    URL.revokeObjectURL(url);
  } catch (err) { alert('Error al exportar: ' + err.message); }
};

const importarExcel = async (e) => {
  const archivo = e.target.files[0]; if (!archivo) return;
  const formData = new FormData(); formData.append('archivo', archivo);
  try {
    const res = await fetch('/importacion/ambientes', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al importar');
    alert(data.mensaje || `${data.insertados} ambientes importados`);
    cargar();
  } catch (err) { alert(err.message); }
  e.target.value = '';
};

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/ambiente', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const local = getLocalA();
        const ids = data.map(a => a.id_ambiente);
        const soloLocales = local.filter(a => !ids.includes(a.id_ambiente));
        const merged = [...data, ...soloLocales];
        saveLocalA(merged); setAmbientes(merged);
      } else { setAmbientes(getLocalA()); }
    } catch { setAmbientes(getLocalA()); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch('/ambiente', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      const d = await res.json();
      if (!res.ok) { setError(d.message || 'Error'); return; }
      setShowModal(false); setFormData({ nombre: '', direccion: '' }); cargar();
    } catch {}
    const local = getLocalA();
    local.push({ ...formData, id_ambiente: nextIdA(local) });
    saveLocalA(local); setAmbientes(local);
    setShowModal(false); setFormData({ nombre: '', direccion: '' });
  };

  const handleEditar = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch(`/ambiente/${seleccionado.id_ambiente}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editData) });
      const d = await res.json();
      if (!res.ok) { setError(d.message || 'Error'); return; }
      setShowEditModal(false); cargar();
    } catch {}
    const local = getLocalA().map(a => a.id_ambiente === seleccionado.id_ambiente ? { ...a, ...editData } : a);
    saveLocalA(local); setAmbientes(local); setShowEditModal(false);
  };

  const handleEliminar = async (id) => {
    if (!confirm('Eliminar este ambiente?')) return;
    try {
      const res = await fetch(`/ambiente/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) cargar();
    } catch {}
    const local = getLocalA().filter(a => a.id_ambiente !== id);
    saveLocalA(local); setAmbientes(local);
  };

  const filtrados = ambientes.filter(a => !filtro || a.nombre?.toLowerCase().includes(filtro.toLowerCase()) || a.direccion?.toLowerCase().includes(filtro.toLowerCase()));
  const paginados = filtrados.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const COLORS = ['#c9a8ff','#60a5fa','#4ade80','#fb923c','#f472b6','#34d399','#facc15','#a78bfa'];

  return (
    <div className="equipment-layout">
      <SidebarAdmin />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Ambientes</h1>
            <p className="equipment-subtitle">Total: <span>{ambientes.length}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <NotificacionesBtn />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><IconEye size={20}/></div>
            <div className="stat-card-text"><div className="stat-value">{ambientes.length}</div><div className="stat-label">Total</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconEye size={20}/></div>
            <div className="stat-card-text"><div className="stat-value" style={{color:'#4ade80'}}>{ambientes.length}</div><div className="stat-label">Registrados</div></div>
          </div>
        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row" style={{gridTemplateColumns:'1fr auto'}}>
          <input className="filter-input" placeholder="Buscar por nombre o direccion..." value={filtro} onChange={e => setFiltro(e.target.value)}/>
          <button className="filter-clear" onClick={() => setFiltro('')}>Limpiar</button>
        </div>

        {loading ? <div style={{textAlign:'center',padding:'48px',color:'#b8a8d8'}}>Cargando...</div> : (
          <div className="amb-grid">
            {paginados.length === 0
              ? <div style={{gridColumn:'1/-1',textAlign:'center',padding:'48px',color:'#b8a8d8'}}>Sin ambientes</div>
              : paginados.map((a, i) => (
                <div key={a.id_ambiente} className="amb-card">
                  <div className="amb-card-icon" style={{background:`${COLORS[i % COLORS.length]}18`,border:`1px solid ${COLORS[i % COLORS.length]}33`,color:COLORS[i % COLORS.length]}}>
                    {a.nombre?.[0]?.toUpperCase()}
                  </div>
                  <div className="amb-card-body">
                    <div className="amb-card-nombre">{a.nombre}</div>
                    <div className="amb-card-dir">{a.direccion}</div>
                    <div className="amb-card-id">ID #{a.id_ambiente}</div>
                  </div>
                  <div className="amb-card-actions">
                    <button className="action-btn edit" onClick={() => { setSeleccionado(a); setEditData({ nombre: a.nombre, direccion: a.direccion }); setShowEditModal(true); }}><IconPencil size={14}/></button>
                    <button className="action-btn delete" onClick={() => handleEliminar(a.id_ambiente)}><IconTrash size={14}/></button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)}/>
        <button className="btn-add-equipment" style={{marginTop:'16px'}} onClick={() => { setError(''); setShowModal(true); }}>Nuevo Ambiente</button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Nuevo Ambiente</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Nombre</label><input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required/></div>
                <div className="form-group"><label>Dirección</label><input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} required/></div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Editar Ambiente</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleEditar}>
                <div className="form-group"><label>Nombre</label><input type="text" value={editData.nombre} onChange={e => setEditData({...editData, nombre: e.target.value})} required/></div>
                <div className="form-group"><label>Dirección</label><input type="text" value={editData.direccion} onChange={e => setEditData({...editData, direccion: e.target.value})} required/></div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AmbientesAdmin;
