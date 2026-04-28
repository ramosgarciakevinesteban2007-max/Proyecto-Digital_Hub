import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconBell, IconClock, IconCheck } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarInstructor from '../../components/SidebarInstructor';
import '../../pages/instructor/ReportesInstructor.css';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
const LS_REPORTES = 'reportes_local';
const getLocalR = () => { try { return JSON.parse(localStorage.getItem(LS_REPORTES)) || []; } catch { return []; } };
const saveLocalR = (data) => localStorage.setItem(LS_REPORTES, JSON.stringify(data));
const nextIdR = (list) => list.length ? Math.max(...list.map(r => r.id_reporte || 0)) + 1 : 1;

const ReportesInstructor = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showVerModal, setShowVerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [formData, setFormData] = useState({ descripcion: '', estado_reporte: 'pendiente', fecha_reporte: new Date().toISOString().split('T')[0] });
  const [editData, setEditData] = useState({ estado_reporte: 'pendiente' });
  const [filtros, setFiltros] = useState({ buscar: '', estado: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const exportarExcel = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('/reportes/excel', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const text = await res.text(); // leer como texto primero
      let mensaje = 'Error al exportar';
      try { mensaje = JSON.parse(text).mensaje || mensaje; } catch {}
      alert(mensaje);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reportes.xlsx'; a.click();
    URL.revokeObjectURL(url);

  } catch (err) {
    alert('Error al exportar: ' + err.message);
  }
};

const importarExcel = async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;

  const formData = new FormData();
  formData.append('archivo', archivo);

  try {
    const res = await fetch('/importacion/reportes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al importar');
    alert(data.mensaje);
    cargar(); // refresca la tabla
  } catch (err) {
    alert(err.message);
  }
  e.target.value = '';
};

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reportes', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) { setReportes(data); saveLocalR(data); }
      else { setReportes(getLocalR()); }
    } catch { setReportes(getLocalR()); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/reportes', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      if (res.ok) { setShowModal(false); setFormData({ descripcion: '', estado_reporte: 'pendiente', fecha_reporte: new Date().toISOString().split('T')[0] }); cargar(); return; }
    } catch {}
    const local = getLocalR();
    local.push({ ...formData, id_reporte: nextIdR(local) });
    saveLocalR(local); setReportes(local);
    setShowModal(false); setFormData({ descripcion: '', estado_reporte: 'pendiente', fecha_reporte: new Date().toISOString().split('T')[0] });
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`/reportes/${seleccionado.id_reporte}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editData) });
      if (res.ok) { setShowEditModal(false); cargar(); return; }
    } catch {}
    const local = getLocalR().map(r => r.id_reporte === seleccionado.id_reporte ? { ...r, ...editData } : r);
    saveLocalR(local); setReportes(local); setShowEditModal(false);
  };

  const handleEliminar = async (id) => {
    if (!confirm('Eliminar este reporte?')) return;
    try {
      const res = await fetch(`/api/reportes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { cargar(); return; }
    } catch {}
    const local = getLocalR().filter(r => r.id_reporte !== id);
    saveLocalR(local); setReportes(local);
  };

  const abrirVer = (r) => { setSeleccionado(r); setShowVerModal(true); };
  const abrirEditar = (r) => { setSeleccionado(r); setEditData({ estado_reporte: r.estado_reporte }); setShowEditModal(true); };
  const estadoColor = (e) => ({ pendiente: '#facc15', en_revision: '#fb923c', resuelto: '#4ade80' }[e] || '#c9a8ff');

  // reset page on filter change
  const filtrados = reportes.filter(r => {
    const b = filtros.buscar.toLowerCase();
    return (!b || r.descripcion?.toLowerCase().includes(b) || String(r.id_reporte).includes(b)) && (!filtros.estado || r.estado_reporte === filtros.estado);
  });

  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="equipment-layout">
      <SidebarInstructor />
      <main className="equipment-main">
        <div className="equipment-header">
          <div><h1 className="equipment-title">Comentarios y Reportes</h1><p className="equipment-subtitle">Total: <span>{reportes.length}</span></p></div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={exportarExcel} style={{ background: '#039b5b', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exportar
            </button>

            <input
              type="file"
              accept=".xlsx"
              style={{ display: 'none' }}
              id="importar-input"
              onChange={importarExcel}
            />
            <button onClick={() => document.getElementById('importar-input').click()} style={{ background: '#039b5b', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Importar
            </button>

            <NotificacionesBtn />
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-card-text"><div className="stat-label">Total</div><div className="stat-value">{reportes.length}</div></div></div>
          <div className="stat-card"><div className="stat-icon"><IconClock size={24} /></div><div className="stat-card-text"><div className="stat-label">Pendientes</div><div className="stat-value">{reportes.filter(r => r.estado_reporte === 'pendiente').length}</div></div></div>
          <div className="stat-card"><div className="stat-icon"><IconCheck size={24} /></div><div className="stat-card-text"><div className="stat-label">Resueltos</div><div className="stat-value">{reportes.filter(r => r.estado_reporte === 'resuelto').length}</div></div></div>
        </div>
        {error && <p className="table-error">{error}</p>}
        <div className="filters-row">
          <input className="filter-input" placeholder="Buscar..." value={filtros.buscar} onChange={e => setFiltros({...filtros, buscar: e.target.value})} />
          <select className="filter-input" value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resuelto</option>
          </select>
          <button className="filter-clear" onClick={() => setFiltros({ buscar: '', estado: '' })}>Limpiar</button>
        </div>
        <div className="table-container">
          <table className="equipment-table">
            <thead><tr><th>ID</th><th>Aprendiz</th><th>Descripción</th><th>Estado</th><th>Fecha</th><th>Evidencia</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan="7" style={{textAlign:'center',padding:'32px'}}>Cargando...</td></tr>
              : filtrados.length === 0 ? <tr><td colSpan="7" style={{textAlign:'center',padding:'32px',color:'var(--text-muted-dark)'}}>Sin resultados</td></tr>
              : paginados.map(r => (
                <tr key={r.id_reporte}>
                  <td style={{color:'#b8a8d8',fontSize:'13px'}}>#{r.id_reporte}</td>
                  <td style={{fontSize:'13px'}}>{r.nombre_aprendiz || '—'}</td>
                  <td style={{maxWidth:'220px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.descripcion}</td>
                  <td><span style={{color:estadoColor(r.estado_reporte),fontWeight:600,fontSize:'13px',display:'inline-flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:estadoColor(r.estado_reporte)}} />{r.estado_reporte}</span></td>
                  <td style={{color:'#b8a8d8',fontSize:'13px'}}>{r.fecha_reporte?.split('T')[0] || r.fecha_reporte}</td>
                  <td>
                    {r.archivo && /\.(jpg|jpeg|png|gif|webp)$/i.test(r.archivo)
                      ? <img
                          src={`/uploads/${r.archivo}`}
                          alt="evidencia"
                          onClick={() => abrirVer(r)}
                          style={{width:'52px',height:'38px',objectFit:'cover',borderRadius:'7px',border:'1px solid rgba(127,90,240,0.35)',cursor:'pointer',display:'block'}}
                        />
                      : r.archivo
                        ? <a href={`/uploads/${r.archivo}`} target="_blank" rel="noreferrer" style={{color:'#c9a8ff',fontSize:'12px',fontWeight:600}}>Ver</a>
                        : <span style={{color:'#6a5a8a',fontSize:'12px'}}>—</span>
                    }
                  </td>
                  <td><div className="action-buttons">
                    <button className="action-btn view" onClick={() => abrirVer(r)}><IconEye size={16} /></button>
                    <button className="action-btn edit" onClick={() => abrirEditar(r)} style={{fontSize:'11px',padding:'4px 8px',borderRadius:'8px',color:'#60a5fa',border:'1px solid rgba(96,165,250,0.3)'}}>Estado</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-add-equipment" onClick={() => { setError(''); setShowModal(true); }}>Añadir Reporte</button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Añadir reporte</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group"><label>Descripción</label><textarea rows={3} value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required style={{borderRadius:'10px',resize:'vertical'}} /></div>
                <div className="form-group"><label>Estado</label>
                  <select value={formData.estado_reporte} onChange={e => setFormData({...formData, estado_reporte: e.target.value})}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En revisión</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>
                <div className="form-group"><label>Fecha</label><input type="date" value={formData.fecha_reporte} onChange={e => setFormData({...formData, fecha_reporte: e.target.value})} required /></div>
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
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'520px'}}>
              <h2 className="modal-title">Reporte #{seleccionado.id_reporte}</h2>
              <div className="detalle-grid">
                <div className="detalle-item"><span className="detalle-label">Aprendiz</span><span className="detalle-valor">{seleccionado.nombre_aprendiz || '—'}</span></div>
                <div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{color:estadoColor(seleccionado.estado_reporte),fontWeight:600}}>{seleccionado.estado_reporte}</span></div>
                <div className="detalle-item"><span className="detalle-label">Fecha</span><span className="detalle-valor">{seleccionado.fecha_reporte?.split('T')[0] || seleccionado.fecha_reporte}</span></div>
                <div className="detalle-item" style={{gridColumn:'1/-1',flexDirection:'column',alignItems:'flex-start',gap:'8px'}}>
                  <span className="detalle-label">Descripción</span>
                  <span style={{fontSize:'14px',color:'#f0eaff',lineHeight:'1.6',whiteSpace:'pre-wrap'}}>{seleccionado.descripcion}</span>
                </div>
                {seleccionado.archivo && (
                  <div className="detalle-item" style={{gridColumn:'1/-1',flexDirection:'column',alignItems:'flex-start',gap:'10px'}}>
                    <span className="detalle-label">Evidencia adjunta</span>
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(seleccionado.archivo) ? (
                      <>
                        <img
                          src={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`}
                          alt="evidencia"
                          style={{width:'100%',maxHeight:'320px',objectFit:'contain',borderRadius:'10px',border:'1px solid rgba(127,90,240,0.3)',background:'#080810',display:'block',cursor:'pointer'}}
                          onClick={() => window.open(`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`, '_blank')}
                          onError={e => { e.target.onerror=null; e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                        />
                        <div style={{display:'none',flexDirection:'column',alignItems:'center',gap:'8px',padding:'16px',background:'rgba(127,90,240,0.06)',borderRadius:'10px',border:'1px dashed rgba(127,90,240,0.3)'}}>
                          <span style={{fontSize:'13px',color:'#b8a8d8'}}>No se pudo cargar la imagen</span>
                          <a href={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`} target="_blank" rel="noreferrer" style={{color:'#c9a8ff',fontSize:'13px',fontWeight:600}}>Abrir directamente →</a>
                        </div>
                        <a href={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`} target="_blank" rel="noreferrer" style={{color:'#b8a8d8',fontSize:'11px',textAlign:'center'}}>Abrir en nueva pestaña ↗</a>
                      </>
                    ) : (
                      <a href={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`} target="_blank" rel="noreferrer"
                        style={{display:'inline-flex',alignItems:'center',gap:'8px',color:'#c9a8ff',fontSize:'13px',fontWeight:600,background:'rgba(127,90,240,0.1)',border:'1px solid rgba(127,90,240,0.3)',borderRadius:'8px',padding:'8px 14px',textDecoration:'none'}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Ver archivo adjunto
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-actions"><button className="btn-save" onClick={() => setShowVerModal(false)}>Cerrar</button></div>
            </div>
          </div>
        )}

        {showEditModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Editar reporte</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleEditar}>
                <div className="form-group"><label>Estado del Reporte</label>
                  <select value={editData.estado_reporte} onChange={e => setEditData({...editData, estado_reporte: e.target.value})}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En revisión</option>
                    <option value="resuelto">Resuelto</option>
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
      </main>
    </div>
  );
};

export default ReportesInstructor;