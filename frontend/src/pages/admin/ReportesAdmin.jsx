import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconEye, IconPencil, IconTrash, IconClock, IconCheck, IconReport } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarAdmin from '../../components/SidebarAdmin';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import '../../components/Pagination.css';
import '../../pages/admin/ReportesAdmin.css';

const LS_REP = 'rep_local';
const getLocalRep = () => { try { return JSON.parse(localStorage.getItem(LS_REP)) || []; } catch { return []; } };
const saveLocalRep = (data) => localStorage.setItem(LS_REP, JSON.stringify(data));

const estadoColor = (e) => ({ pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80' }[e] || '#c9a8ff');
const estadoBg   = (e) => ({ pendiente:'rgba(250,204,21,0.12)', en_revision:'rgba(251,146,60,0.12)', resuelto:'rgba(74,222,128,0.12)' }[e] || 'rgba(201,168,255,0.12)');

const ReportesAdmin = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [editData, setEditData] = useState({ estado_reporte: 'pendiente' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [filtros, setFiltros] = useState({ buscar: '', estado: '' });
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;
  const [confirmId, setConfirmId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => { if (!token) { navigate('/login'); return; } cargar(); }, []);

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
    a.href = url; a.download = `Reporte_DigitalHub_${new Date().toISOString().split('T')[0]}.xlsx`; a.click();
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
      if (Array.isArray(data) && data.length > 0) {
        saveLocalRep(data); setReportes(data);
      } else { setReportes(getLocalRep()); }
    } catch { setReportes(getLocalRep()); }
    finally { setLoading(false); }
  };

  const handleEditar = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch(`/reportes/${seleccionado.id_reporte}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData)
      });
      if (res.ok) { setShowEditModal(false); cargar(); return; }
    } catch {}
    const local = getLocalRep().map(r => r.id_reporte === seleccionado.id_reporte ? { ...r, ...editData } : r);
    saveLocalRep(local); setReportes(local); setShowEditModal(false);
  };

  const handleEliminar = async (id) => {
    try {
      const res = await fetch(`/api/reportes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setConfirmId(null); cargar(); return; }
    } catch {}
    setConfirmId(null);
  };

  const filtrados = reportes.filter(r => {
    const b = filtros.buscar.toLowerCase();
    return (!b || r.descripcion?.toLowerCase().includes(b) || String(r.id_reporte).includes(b))
      && (!filtros.estado || r.estado_reporte === filtros.estado);
  });
  const paginados = filtrados.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const pendientes  = reportes.filter(r => r.estado_reporte === 'pendiente').length;
  const enRevision  = reportes.filter(r => r.estado_reporte === 'en_revision').length;
  const resueltos   = reportes.filter(r => r.estado_reporte === 'resuelto').length;

  return (
    <div className="equipment-layout">
      <SidebarAdmin />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Reportes</h1>
            <p className="equipment-subtitle">Total: <span>{reportes.length}</span></p>
          </div>
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
          <div className="stat-card">
            <div className="stat-icon"><IconReport size={20}/></div>
            <div className="stat-card-text"><div className="stat-value">{reportes.length}</div><div className="stat-label">Total</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconClock size={20}/></div>
            <div className="stat-card-text"><div className="stat-value" style={{ color: '#facc15' }}>{pendientes}</div><div className="stat-label">Pendientes</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconReport size={20}/></div>
            <div className="stat-card-text"><div className="stat-value" style={{ color: '#fb923c' }}>{enRevision}</div><div className="stat-label">En revision</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconCheck size={20}/></div>
            <div className="stat-card-text"><div className="stat-value" style={{ color: '#4ade80' }}>{resueltos}</div><div className="stat-label">Resueltos</div></div>
          </div>
        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row" style={{ gridTemplateColumns: '2fr 1fr auto' }}>
          <input className="filter-input" placeholder="Buscar reporte..." value={filtros.buscar} onChange={e => { setFiltros({ ...filtros, buscar: e.target.value }); setPage(1); }}/>
          <select className="filter-input" value={filtros.estado} onChange={e => { setFiltros({ ...filtros, estado: e.target.value }); setPage(1); }}>
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resuelto</option>
          </select>
          <button className="filter-clear" onClick={() => { setFiltros({ buscar: '', estado: '' }); setPage(1); }}>Limpiar</button>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '48px', color: '#b8a8d8' }}>Cargando...</div> : (
          <div className="table-container">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Aprendiz</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Evidencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginados.length === 0
                  ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '48px', color: '#b8a8d8' }}>Sin resultados</td></tr>
                  : paginados.map(r => (
                    <tr key={r.id_reporte}>
                      <td style={{ color: '#b8a8d8', fontSize: '13px' }}>#{r.id_reporte}</td>
                      <td style={{ fontSize: '13px' }}>{r.nombre_aprendiz || '—'}</td>
                      <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.descripcion}</td>
                      <td>
                        <span style={{ background: estadoBg(r.estado_reporte), color: estadoColor(r.estado_reporte), border: `1px solid ${estadoColor(r.estado_reporte)}44`, borderRadius: '50px', padding: '3px 12px', fontSize: '12px', fontWeight: 600 }}>
                          {r.estado_reporte}
                        </span>
                      </td>
                      <td style={{ color: '#b8a8d8', fontSize: '13px' }}>{r.fecha_reporte?.split('T')[0] || r.fecha_reporte}</td>
                      <td>
                        {r.archivo
                          ? <a href={`/uploads/${r.archivo}`} target="_blank" rel="noreferrer" style={{ color: '#c9a8ff', fontSize: '12px', fontWeight: 600 }}>Ver</a>
                          : <span style={{ color: '#6a5a8a', fontSize: '12px' }}>—</span>
                        }
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view" onClick={() => setSeleccionado(r)}><IconEye size={15}/></button>
                          <button className="action-btn edit" onClick={() => { setSeleccionado(r); setEditData({ estado_reporte: r.estado_reporte }); setShowEditModal(true); }}><IconPencil size={15}/></button>
                          <button className="action-btn delete" onClick={() => setConfirmId(r.id_reporte)}><IconTrash size={15}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)}/>
        {confirmId && <ConfirmModal mensaje="Esta acción no se puede deshacer." onConfirm={() => handleEliminar(confirmId)} onCancel={() => setConfirmId(null)} />}

        {seleccionado && !showEditModal && (
          <div className="modal-overlay" onClick={() => setSeleccionado(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'520px'}}>
              <h2 className="modal-title">Reporte #{seleccionado.id_reporte}</h2>
              <div className="detalle-grid">
                <div className="detalle-item"><span className="detalle-label">Aprendiz</span><span className="detalle-valor">{seleccionado.nombre_aprendiz || '—'}</span></div>
                <div className="detalle-item"><span className="detalle-label">Correo</span><span className="detalle-valor" style={{fontSize:'13px'}}>{seleccionado.correo_aprendiz || '—'}</span></div>
                <div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{ color: estadoColor(seleccionado.estado_reporte), fontWeight: 700 }}>{seleccionado.estado_reporte}</span></div>
                <div className="detalle-item"><span className="detalle-label">Fecha</span><span className="detalle-valor">{seleccionado.fecha_reporte?.split('T')[0]}</span></div>
                <div className="detalle-item" style={{ gridColumn:'1/-1', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="detalle-label">Descripción</span>
                  <span style={{ fontSize: '14px', color: '#f0eaff', lineHeight: '1.6', whiteSpace:'pre-wrap' }}>{seleccionado.descripcion}</span>
                </div>
                {seleccionado.archivo && (
                  <div className="detalle-item" style={{ gridColumn:'1/-1', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                    <span className="detalle-label">Evidencia adjunta</span>
                    {/\.(jpg|jpeg|png|gif|webp)$/i.test(seleccionado.archivo) ? (
                      <img
                        src={`/uploads/${seleccionado.archivo}`}
                        alt="evidencia"
                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit:'contain', borderRadius: '10px', border: '1px solid rgba(127,90,240,0.3)', cursor: 'pointer' }}
                        onClick={() => window.open(`/uploads/${seleccionado.archivo}`, '_blank')}
                      />
                    ) : (
                      <a href={`/uploads/${seleccionado.archivo}`} target="_blank" rel="noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:'8px', color:'#c9a8ff', fontSize:'13px', fontWeight:600, background:'rgba(127,90,240,0.1)', border:'1px solid rgba(127,90,240,0.3)', borderRadius:'8px', padding:'8px 14px', textDecoration:'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Ver archivo adjunto
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => { setSeleccionado(null); setShowEditModal(true); setEditData({ estado_reporte: seleccionado.estado_reporte }); }}>Cambiar estado</button>
                <button className="btn-save" onClick={() => setSeleccionado(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Cambiar estado</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleEditar}>
                <div className="form-group"><label>Estado</label>
                  <select value={editData.estado_reporte} onChange={e => setEditData({ ...editData, estado_reporte: e.target.value })}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_revision">En revisión</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default ReportesAdmin;
