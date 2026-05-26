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
  const [formData, setFormData] = useState({ num_serie: '', marca: '', tipo: '', modelo: '', estado: 'disponible', ubicacion: '', descripcion: '' });
  const [editData, setEditData] = useState({ marca: '', tipo: '', modelo: '', estado: 'disponible', ubicacion: '', descripcion: '' });
  const [filtros, setFiltros] = useState({ buscar: '', estado: '', marca: '' });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portatiles?limit=500', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate('/login'); return; }
      if (!res.ok) { setError('Error al cargar equipos'); setLoading(false); return; }
      const json = await res.json();
      const data = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
      setPortatiles(data);
    } catch (e) { setError('Error de conexión: ' + e.message); }
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
      if (res.ok) { setShowModal(false); setFormData({ num_serie: '', marca: '', tipo: '', modelo: '', estado: 'disponible' }); setFiltros({ buscar: '', estado: '', marca: '' }); setPage(1); cargar(); return; }
      setError(d.mensaje || d.error || JSON.stringify(d) || 'Error al guardar');
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
        body: JSON.stringify({ estado: 'dañado' })
      });
      if (res.ok) { setConfirmId(null); cargar(); }
    } catch {}
    setConfirmId(null);
  };

  const exportar = async (formato) => {
    try {
      const q = new URLSearchParams();
      if (filtros.buscar) q.set('buscar', filtros.buscar);
      if (filtros.estado) q.set('estado', filtros.estado);
      if (filtros.marca) q.set('marca', filtros.marca);
      const query = q.toString();
      const url = `/exportar/portatiles/${formato}${query ? `?${query}` : ''}`;
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
  const abrirEditar = async (p) => {
  setSeleccionado(p);
  setEditData({ marca: p.marca, tipo: p.tipo || '', modelo: p.modelo, estado: (p.estado || '').toString().toLowerCase(), ubicacion: p.ubicacion || '', descripcion: p.descripcion || '' });
  setShowHistorial(false);
  setHistorial([]);
  setShowEditModal(true);
  try {
    setLoadingHistorial(true);
    const res = await fetch(`/api/portatiles/${p.id_portatil}/historial`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setHistorial(data);
    }
  } catch {}
  finally { setLoadingHistorial(false); }
};

  const estadoColor = (e) => {
    const estado = (e || '').toLowerCase();
    return { disponible: '#4ade80', asignado: '#facc15', 'dañado': '#f87171', mantenimiento: '#fb923c' }[estado] || '#c9a8ff';
  };

  const filtrados = portatiles.filter(p => {
    const b = (filtros.buscar || '').toLowerCase();
    const estadoFiltro = (filtros.estado || '').toLowerCase();
    const marcaFiltro = (filtros.marca || '').toLowerCase();
    const pEstado = (p.estado || '').toLowerCase();
    const pMarca = (p.marca || '').toLowerCase();
    return (!b || (p.num_serie||'').toLowerCase().includes(b) || pMarca.includes(b) || (p.modelo||'').toLowerCase().includes(b))
      && (!estadoFiltro || pEstado === estadoFiltro)
      && (!marcaFiltro || pMarca.includes(marcaFiltro));
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
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowExportMenu(v => !v)} style={{ background: '#039b5b', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Exportar
                </button>
                {showExportMenu && (
                  <div style={{ position: 'absolute', right: 0, top: '46px', background: '#1a0f35', border: '1px solid rgba(127,90,240,0.25)', borderRadius: '8px', padding: '6px', zIndex: 40 }}>
                    <button onClick={() => { exportar('excel'); setShowExportMenu(false); }} style={{ display: 'block', background: '#039b5b', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '6px' }}>Excel</button>
                    <button onClick={() => { exportar('csv'); setShowExportMenu(false); }} style={{ display: 'block', background: '#039b5b', border: 'none', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>CSV</button>
                  </div>
                )}
              </div>
              <NotificacionesBtn />
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-text"><div className="stat-label">Total</div><div className="stat-value">{portatiles.length}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconMonitor size={24} /></div>
            <div className="stat-card-text"><div className="stat-label">Disponibles</div><div className="stat-value">{portatiles.filter(p => p.estado?.toLowerCase() === 'disponible').length}</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconBarChart size={24} /></div>
            <div className="stat-card-text"><div className="stat-label">Asignados</div><div className="stat-value">{portatiles.filter(p => p.estado?.toLowerCase() === 'asignado').length}</div></div>
          </div>
        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row">
          <input className="filter-input" placeholder="Buscar por serie, marca o modelo..." value={filtros.buscar} onChange={e => { setFiltros({ ...filtros, buscar: e.target.value }); setPage(1); }} />
          <input className="filter-input" placeholder="Marca" value={filtros.marca} onChange={e => { setFiltros({ ...filtros, marca: e.target.value }); setPage(1); }} />
          <select className="filter-input" value={filtros.estado} onChange={e => { setFiltros({ ...filtros, estado: e.target.value }); setPage(1); }}>
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="asignado">Asignado</option>
            <option value="dañado">Dañado</option>
            <option value="mantenimiento">Mantenimiento</option>
            </select>
          <button className="filter-clear" onClick={() => { setFiltros({ buscar: '', estado: '', marca: '' }); setPage(1); }}>Limpiar</button>
        </div>

        <div className="table-container">
          <table className="equipment-table">
            <thead><tr><th>N Serie</th><th>Marca</th><th>Modelo</th><th>Ubicación</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>Cargando...</td></tr>
              : filtrados.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted-dark)' }}>Sin resultados</td></tr>
              : paginados.map(p => (
                <tr key={p.id_portatil}>
                  <td>{p.num_serie}</td><td>{p.marca}</td><td>{p.modelo}</td>
                  <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{p.ubicacion || '—'}</td>
                  <td style={{color:'var(--text-muted-dark)',fontSize:'13px',maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={p.descripcion}>{p.descripcion || '—'}</td>
                  <td><span style={{ color: estadoColor(p.estado), fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:estadoColor(p.estado)}} />{p.estado}</span></td>
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
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'560px'}}>
              <h2 className="modal-title">Añadir portátil</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div className="form-group"><label>Número de serie</label><input type="text" value={formData.num_serie} onChange={e => setFormData({ ...formData, num_serie: e.target.value })} required /></div>
                  <div className="form-group"><label>Marca</label><input type="text" value={formData.marca} onChange={e => setFormData({ ...formData, marca: e.target.value })} required /></div>
                  <div className="form-group"><label>Tipo</label><input type="text" placeholder="ej: laptop, tablet..." value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value })} required /></div>
                  <div className="form-group"><label>Modelo</label><input type="text" value={formData.modelo} onChange={e => setFormData({ ...formData, modelo: e.target.value })} required /></div>
                  <div className="form-group"><label>Estado</label>
                    <select value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })}>
                      <option value="disponible">Disponible</option>
                      <option value="asignado">Asignado</option>
                      <option value="dañado">Dañado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Ubicación</label><input type="text" placeholder="ej: Sala 3, Bloque B..." value={formData.ubicacion} onChange={e => setFormData({ ...formData, ubicacion: e.target.value })} /></div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}><label>Descripción</label><textarea rows="2" placeholder="Observaciones del equipo..." value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} style={{resize:'vertical'}} /></div>
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
                <div className="detalle-item"><span className="detalle-label">Ubicación</span><span className="detalle-valor">{seleccionado.ubicacion || '—'}</span></div>
                <div className="detalle-item" style={{gridColumn:'1/-1'}}><span className="detalle-label">Descripción</span><span className="detalle-valor" style={{whiteSpace:'pre-wrap'}}>{seleccionado.descripcion || '—'}</span></div>
              </div>
              <div className="modal-actions"><button className="btn-save" onClick={() => setShowVerModal(false)}>Cerrar</button></div>
            </div>
          </div>
        )}

        {showEditModal && seleccionado && (
  <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'520px'}}>

      {/* TABS */}
      <div style={{display:'flex', gap:'8px', marginBottom:'18px'}}>
        <button
          type="button"
          onClick={() => setShowHistorial(false)}
          style={{
            flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer',
            background: !showHistorial ? '#7f5af0' : 'rgba(127,90,240,0.15)',
            color: !showHistorial ? '#fff' : '#b8a8d8',
            fontWeight:700, fontSize:'13px'
          }}>
          Editar
        </button>
        <button
          type="button"
          onClick={() => setShowHistorial(true)}
          style={{
            flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer',
            background: showHistorial ? '#7f5af0' : 'rgba(127,90,240,0.15)',
            color: showHistorial ? '#fff' : '#b8a8d8',
            fontWeight:700, fontSize:'13px'
          }}>
          Historial {historial.length > 0 && `(${historial.length})`}
        </button>
      </div>

      {!showHistorial ? (
        <>
          <h2 className="modal-title">Editar portátil — {seleccionado.num_serie}</h2>
          {error && <p className="table-error">{error}</p>}
          <form onSubmit={handleEditar}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div className="form-group"><label>Marca</label>
                <input type="text" value={editData.marca} onChange={e => setEditData({...editData, marca: e.target.value})} required />
              </div>
              <div className="form-group"><label>Tipo</label>
                <input type="text" value={editData.tipo} onChange={e => setEditData({...editData, tipo: e.target.value})} required />
              </div>
              <div className="form-group"><label>Modelo</label>
                <input type="text" value={editData.modelo} onChange={e => setEditData({...editData, modelo: e.target.value})} required />
              </div>
              <div className="form-group"><label>Estado</label>
                <select value={editData.estado} onChange={e => setEditData({...editData, estado: e.target.value})}>
                  <option value="disponible">Disponible</option>
                  <option value="asignado">Asignado</option>
                  <option value="dañado">Dañado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Ubicación</label>
                <input type="text" placeholder="ej: Sala 3, Bloque B..." value={editData.ubicacion} onChange={e => setEditData({...editData, ubicacion: e.target.value})} />
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Descripción</label>
                <textarea rows="2" value={editData.descripcion} onChange={e => setEditData({...editData, descripcion: e.target.value})} style={{resize:'vertical'}} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button type="submit" className="btn-save">Guardar cambios</button>
            </div>
          </form>
        </>
      ) : (
        <>
          <h2 className="modal-title">Historial — {seleccionado.marca} {seleccionado.modelo}</h2>
          {loadingHistorial ? (
            <p style={{color:'#b8a8d8', textAlign:'center', padding:'30px 0'}}>Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p style={{color:'#7a6a9a', textAlign:'center', padding:'30px 0'}}>Sin cambios registrados aún.</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'10px', maxHeight:'320px', overflowY:'auto'}}>
              {historial.map(h => (
                <div key={h.id} style={{
                  background:'rgba(127,90,240,0.08)',
                  border:'1px solid rgba(127,90,240,0.25)',
                  borderRadius:'10px', padding:'12px 14px'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                    <span style={{color:'#c9a8ff', fontWeight:700, fontSize:'13px', textTransform:'capitalize'}}>
                      {h.campo_modificado}
                    </span>
                    <span style={{color:'#7a6a9a', fontSize:'11px'}}>
                      {new Date(h.fecha).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px'}}>
                    <span style={{color:'#f87171', background:'rgba(248,113,113,0.1)', borderRadius:'6px', padding:'2px 8px'}}>
                      {h.valor_anterior}
                    </span>
                    <span style={{color:'#7a6a9a'}}>→</span>
                    <span style={{color:'#4ade80', background:'rgba(74,222,128,0.1)', borderRadius:'6px', padding:'2px 8px'}}>
                      {h.valor_nuevo}
                    </span>
                  </div>
                  <div style={{marginTop:'6px', fontSize:'11px', color:'#7a6a9a'}}>
                    Por: {h.modificado_por}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="modal-actions" style={{marginTop:'16px'}}>
            <button className="btn-save" onClick={() => setShowEditModal(false)}>Cerrar</button>
          </div>
        </>
      )}
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