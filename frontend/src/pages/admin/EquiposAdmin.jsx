import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconPencil, IconTrash, IconBell, IconMonitor, IconBarChart } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarAdmin from '../../components/SidebarAdmin';
import './EquiposAdmin.css';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
import ConfirmModal from '../../components/ConfirmModal';

const LS_KEY = 'portatiles_local';
const getLocal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveLocal = (data) => localStorage.setItem(LS_KEY, JSON.stringify(data));
const nextId = (list) => list.length ? Math.max(...list.map(p => p.id_portatil || 0)) + 1 : 1;

const EquiposAdmin = () => {
  const navigate = useNavigate();
  const [portatiles, setPortatiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showVerModal, setShowVerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [formData, setFormData] = useState({ num_serie: '', marca: '', tipo: '', modelo: '', estado: 'Disponible' });
  const [editData, setEditData] = useState({ marca: '', tipo: '', modelo: '', estado: 'Disponible' });
  const [filtros, setFiltros] = useState({ buscar: '', estado: '', marca: '' });
  const [confirmId, setConfirmId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portatiles', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate('/login'); return; }
      if (!res.ok) { setError('Error al cargar equipos'); setLoading(false); return; }
      const json = await res.json();
      const data = Array.isArray(json) ? json : (json.data || []);
      setPortatiles(data);
    } catch { setError('Error de conexión'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch('/api/portatiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { setShowModal(false); setFormData({ num_serie: '', marca: '', tipo: '', modelo: '', estado: 'Disponible' }); cargar(); return; }
      setError(d.mensaje || 'Error al guardar');
    } catch { setError('Error de conexión'); }
  };

  const handleEditar = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch(`/api/portatiles/${seleccionado.id_portatil}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData)
      });
      if (res.ok) { setShowEditModal(false); cargar(); return; }
      const d = await res.json().catch(() => ({}));
      setError(d.mensaje || 'Error al editar');
    } catch { setError('Error de conexión'); }
  };

  const handleEliminar = async (id) => {
    try {
      const res = await fetch(`/api/portatiles/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: 'Dañado' })
      });
      if (res.ok) { setConfirmId(null); cargar(); }
    } catch {}
    setConfirmId(null);
  };

  const exportar = async (formato) => {
    try {
      const url = `/exportar/portatiles/${formato}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        setError(`Error al exportar: ${msg.error || res.status}`);
        return;
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `portatiles.${formato === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      setError('Error de conexión al exportar');
    }
  };

  const abrirVer = (p) => { setSeleccionado(p); setShowVerModal(true); };
  const abrirEditar = (p) => {
    setSeleccionado(p);
    setEditData({ marca: p.marca, tipo: p.tipo || '', modelo: p.modelo, estado: p.estado });
    setShowEditModal(true);
  };

  const estadoColor = (e) => ({ Disponible: '#4ade80', Asignado: '#facc15', 'Dañado': '#f87171', Mantenimiento: '#fb923c' }[e] || '#c9a8ff');

  const filtrados = portatiles.filter(p => {
    const b = filtros.buscar.toLowerCase();
    return (!b || p.num_serie?.toLowerCase().includes(b) || p.marca?.toLowerCase().includes(b) || p.modelo?.toLowerCase().includes(b))
      && (!filtros.estado || p.estado === filtros.estado)
      && (!filtros.marca || p.marca?.toLowerCase().includes(filtros.marca.toLowerCase()));
  });
  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="equipment-layout">
      <SidebarAdmin />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Gestion de equipos</h1>
            <p className="equipment-subtitle">Total: <span>{portatiles.length}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => exportar('excel')} style={{ background: '#039b5b', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Excel
            </button>
            <button onClick={() => exportar('csv')} style={{ background: '#6366f1', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
            <NotificacionesBtn />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-text"><div className="stat-label">Total</div><div className="stat-value">{portatiles.length}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconMonitor size={24} /></div>
            <div className="stat-card-text"><div className="stat-label">Disponibles</div><div className="stat-value">{portatiles.filter(p => p.estado === 'Disponible').length}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconBarChart size={24} /></div>
            <div className="stat-card-text"><div className="stat-label">Asignados</div><div className="stat-value">{portatiles.filter(p => p.estado === 'Asignado').length}</div></div>
          </div>
        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row">
          <input className="filter-input" placeholder="Buscar por serie, marca o modelo..." value={filtros.buscar} onChange={e => { setFiltros({ ...filtros, buscar: e.target.value }); setPage(1); }} />
          <select className="filter-input" value={filtros.estado} onChange={e => { setFiltros({ ...filtros, estado: e.target.value }); setPage(1); }}>
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Asignado">Asignado</option>
            <option value="Dañado">Dañado</option>
            <option value="Mantenimiento">Mantenimiento</option>
            </select>
          <button className="filter-clear" onClick={() => { setFiltros({ buscar: '', estado: '', marca: '' }); setPage(1); }}>Limpiar</button>
        </div>

        <div className="table-container">
          <table className="equipment-table">
            <thead><tr><th>N Serie</th><th>Marca</th><th>Modelo</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Cargando...</td></tr>
              : filtrados.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted-dark)' }}>Sin resultados</td></tr>
              : paginados.map(p => (
                <tr key={p.id_portatil}>
                  <td>{p.num_serie}</td><td>{p.marca}</td><td>{p.modelo}</td>
                  <td><span style={{ color: estadoColor(p.estado), fontWeight: 600, fontSize: '13px' }}>{p.estado}</span></td>
                  <td><div className="action-buttons">
                    <button className="action-btn view" onClick={() => abrirVer(p)}><IconEye size={16} /></button>
                    <button className="action-btn edit" onClick={() => abrirEditar(p)}><IconPencil size={16} /></button>
                    <button className="action-btn delete" onClick={() => setConfirmId(p.id_portatil)}><IconTrash size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-add-equipment" onClick={() => { setError(''); setShowModal(true); }}>Añadir Portatil</button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Añadir portatil</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Número de serie</label><input type="text" value={formData.num_serie} onChange={e => setFormData({ ...formData, num_serie: e.target.value })} required /></div>
                <div className="form-group"><label>Marca</label><input type="text" value={formData.marca} onChange={e => setFormData({ ...formData, marca: e.target.value })} required /></div>
                <div className="form-group"><label>Tipo</label><input type="text" placeholder="ej: laptop, tablet..." value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} required /></div>
                <div className="form-group"><label>Modelo</label><input type="text" value={formData.modelo} onChange={e => setFormData({ ...formData, modelo: e.target.value })} required /></div>
                <div className="form-group"><label>Estado</label>
                  <select value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })}>
                    <option value="Disponible">Disponible</option>
                    <option value="Asignado">Asignado</option>
                    <option value="Dañado">Dañado</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showVerModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowVerModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Detalle del pórtatil</h2>
              <div className="detalle-grid">
                <div className="detalle-item"><span className="detalle-label">ID</span><span className="detalle-valor">#{seleccionado.id_portatil}</span></div>
                <div className="detalle-item"><span className="detalle-label">N Serie</span><span className="detalle-valor">{seleccionado.num_serie}</span></div>
                <div className="detalle-item"><span className="detalle-label">Marca</span><span className="detalle-valor">{seleccionado.marca}</span></div>
                <div className="detalle-item"><span className="detalle-label">Tipo</span><span className="detalle-valor">{seleccionado.tipo}</span></div>
                <div className="detalle-item"><span className="detalle-label">Modelo</span><span className="detalle-valor">{seleccionado.modelo}</span></div>
                <div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{ color: estadoColor(seleccionado.estado), fontWeight: 600 }}>{seleccionado.estado}</span></div>
              </div>
              <div className="modal-actions"><button className="btn-save" onClick={() => setShowVerModal(false)}>Cerrar</button></div>
            </div>
          </div>
        )}

        {showEditModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Editar pórtatil</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleEditar}>
                <div className="form-group"><label>Marca</label><input type="text" value={editData.marca} onChange={e => setEditData({ ...editData, marca: e.target.value })} required /></div>
                <div className="form-group"><label>Tipo</label><input type="text" value={editData.tipo} onChange={e => setEditData({ ...editData, tipo: e.target.value })} required /></div>
                <div className="form-group"><label>Modelo</label><input type="text" value={editData.modelo} onChange={e => setEditData({ ...editData, modelo: e.target.value })} required /></div>
                <div className="form-group"><label>Estado</label>
                  <select value={editData.estado} onChange={e => setEditData({ ...editData, estado: e.target.value })}>
                    <option value="Disponible">Disponible</option>
                    <option value="Asignado">Asignado</option>
                    <option value="Dañado">Dañado</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)} />
        {confirmId && <ConfirmModal mensaje="Esta acción no se puede deshacer." onConfirm={() => handleEliminar(confirmId)} onCancel={() => setConfirmId(null)} />}
      </main>
    </div>
  );
};

export default EquiposAdmin;
