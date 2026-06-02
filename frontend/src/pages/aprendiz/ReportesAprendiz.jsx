import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconClock, IconCheck, IconMonitor, IconReport } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarAprendiz from '../../components/SidebarAprendiz';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
import '../../pages/aprendiz/ReportesAprendiz.css';

const estadoColor = (e) => ({ pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80' }[e] || '#c9a8ff');
const estadoBg   = (e) => ({ pendiente:'rgba(250,204,21,0.12)', en_revision:'rgba(251,146,60,0.12)', resuelto:'rgba(74,222,128,0.12)' }[e] || 'rgba(201,168,255,0.12)');
const esImagen   = (f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f);

const ReportesAprendiz = () => {
  const navigate = useNavigate();
  const [reportes, setReportes]           = useState([]);
  const [portatiles, setPortatiles]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [successMsg, setSuccessMsg]       = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [showVerModal, setShowVerModal]   = useState(false);
  const [seleccionado, setSeleccionado]   = useState(null);
  const [equipoSel, setEquipoSel]         = useState(null);
  const [submitting, setSubmitting]       = useState(false);
  const [imagenFile, setImagenFile]       = useState(null);
  const [filtros, setFiltros]             = useState({ buscar: '', estado: '' });
  const [page, setPage]                   = useState(1);
  const PER_PAGE = 6;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const h = { Authorization: `Bearer ${token}` };
      const [rRes, pRes] = await Promise.all([
        fetch('/api/reportes',  { headers: h }),
        fetch('/api/portatiles', { headers: h }),
      ]);
      if (rRes.status === 401) { navigate('/login'); return; }
      const rData = await rRes.json();
      const pRaw  = await pRes.json();
      setReportes(Array.isArray(rData) ? rData : []);
      const lista = Array.isArray(pRaw) ? pRaw : (pRaw?.data || []);
      setPortatiles(lista.filter(p => p.estado === 'asignado'));
    } catch { setError('Error al cargar'); }
    finally { setLoading(false); }
  };

  const abrirReporte = (equipo) => {
    setEquipoSel(equipo);
    setFormData({ descripcion: '', fecha_reporte: new Date().toISOString().split('T')[0] });
    setImagenFile(null);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('descripcion',       formData.descripcion);
      fd.append('fecha_reporte',     formData.fecha_reporte);
      if (imagenFile) fd.append('archivo', imagenFile);
      const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        setShowModal(false);
        setSuccessMsg('Reporte enviado correctamente');
        setTimeout(() => setSuccessMsg(''), 3000);
        cargar(); setSubmitting(false); return;
      }
      const d = await res.json();
      setError(d.message || 'Error al enviar');
    } catch { setError('Error de conexión'); }
    setSubmitting(false);
  };

  const filtrados = reportes.filter(r => {
    const b = filtros.buscar.toLowerCase();
    return (!b || r.descripcion?.toLowerCase().includes(b) || String(r.id_reporte).includes(b))
      && (!filtros.estado || r.estado_reporte === filtros.estado);
  });
  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="equipment-layout">
      <SidebarAprendiz />
      <main className="equipment-main">

        {/* HEADER */}
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Mis Reportes</h1>
            <p className="equipment-subtitle">Reporta problemas con tus equipos asignados</p>
          </div>
          <NotificacionesBtn />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'#b8a8d8', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:'12px' }}>
            Equipos asignados
          </div>
          {loading ? (
            <div style={{ color:'#b8a8d8', fontSize:'13px' }}>Cargando equipos...</div>
          ) : portatiles.length === 0 ? (
            <div style={{ background:'#1a0f35', border:'1px solid rgba(127,90,240,0.2)', borderRadius:'16px', padding:'20px 24px', color:'#b8a8d8', fontSize:'13px', display:'flex', alignItems:'center', gap:'12px' }}>
              <IconMonitor size={20} /> No tienes equipos asignados actualmente
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {portatiles.map(p => (
                <div key={p.id_portatil} style={{ background:'linear-gradient(135deg,#2d1a55 0%,#1a0f35 100%)', border:'1px solid rgba(127,90,240,0.35)', borderRadius:'18px', display:'flex', overflow:'hidden' }}>
                  <div style={{ width:'6px', background:'linear-gradient(180deg,#7f5af0,#c9a8ff)', flexShrink:0 }} />
                  <div style={{ padding:'20px 18px', display:'flex', alignItems:'center', justifyContent:'center', borderRight:'1px dashed rgba(127,90,240,0.2)', flexShrink:0 }}>
                    <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'rgba(127,90,240,0.18)', display:'flex', alignItems:'center', justifyContent:'center', color:'#c9a8ff' }}>
                      <IconMonitor size={26} />
                    </div>
                  </div>
                  <div style={{ flex:1, padding:'18px 20px', display:'flex', flexDirection:'column', justifyContent:'center', gap:'6px' }}>
                    <div style={{ fontSize:'17px', fontWeight:800, color:'#f0eaff' }}>{p.marca} {p.modelo}</div>
                    <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'12px', color:'#b8a8d8' }}>Serie: <span style={{ color:'#f0eaff', fontFamily:'monospace' }}>{p.num_serie}</span></span>
                      {p.tipo && <span style={{ fontSize:'12px', color:'#b8a8d8' }}>Tipo: <span style={{ color:'#f0eaff' }}>{p.tipo}</span></span>}
                    </div>
                    <span style={{ fontSize:'11px', color:'#facc15', fontWeight:600, background:'rgba(250,204,21,0.1)', border:'1px solid rgba(250,204,21,0.25)', borderRadius:'50px', padding:'2px 10px', display:'inline-block', width:'fit-content' }}>{p.estado}</span>
                  </div>
                  <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'center', borderLeft:'1px dashed rgba(127,90,240,0.2)', flexShrink:0 }}>
                    <button onClick={() => abrirReporte(p)} style={{ background:'linear-gradient(135deg,#7f5af0,#5a3bc0)', border:'none', borderRadius:'12px', padding:'12px 20px', color:'#fff', fontSize:'13px', fontWeight:700, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', boxShadow:'0 4px 16px rgba(127,90,240,0.4)', minWidth:'100px' }}>
                      <IconReport size={18} />
                      <span>Reportar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="stats-grid" style={{ marginBottom:'20px' }}>
          <div className="stat-card">
            <div className="stat-icon"><IconReport size={20} /></div>
            <div className="stat-card-text"><div className="stat-value">{reportes.length}</div><div className="stat-label">Total</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconClock size={20} /></div>
            <div className="stat-card-text"><div className="stat-value" style={{ color:'#facc15' }}>{reportes.filter(r => r.estado_reporte === 'pendiente').length}</div><div className="stat-label">Pendientes</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconCheck size={20} /></div>
            <div className="stat-card-text"><div className="stat-value" style={{ color:'#4ade80' }}>{reportes.filter(r => r.estado_reporte === 'resuelto').length}</div><div className="stat-label">Resueltos</div></div>
          </div>
        </div>

        {successMsg && (
          <div style={{ background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:'10px', padding:'12px 18px', marginBottom:'16px', color:'#4ade80', fontSize:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
            <IconCheck size={16} /> {successMsg}
          </div>
        )}
        {error && <p className="table-error">{error}</p>}

        {/* FILTROS */}
        <div className="filters-row" style={{ gridTemplateColumns:'2fr 1fr auto' }}>
          <input className="filter-input" placeholder="Buscar reporte..." value={filtros.buscar} onChange={e => { setFiltros({ ...filtros, buscar: e.target.value }); setPage(1); }} />
          <select className="filter-input" value={filtros.estado} onChange={e => { setFiltros({ ...filtros, estado: e.target.value }); setPage(1); }}>
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resuelto</option>
          </select>
          <button className="filter-clear" onClick={() => { setFiltros({ buscar:'', estado:'' }); setPage(1); }}>Limpiar</button>
        </div>

        {/* TABLA */}
        <div className="table-container">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Evidencia</th>
                <th>Ver</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan="6" style={{ textAlign:'center', padding:'40px', color:'#b8a8d8' }}>Cargando...</td></tr>
                : paginados.length === 0
                  ? <tr><td colSpan="6" style={{ textAlign:'center', padding:'40px', color:'#b8a8d8' }}>Sin reportes</td></tr>
                  : paginados.map(r => (
                    <tr key={r.id_reporte}>
                      <td style={{ color:'#b8a8d8', fontSize:'13px' }}>#{r.id_reporte}</td>
                      <td style={{ maxWidth:'240px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.descripcion}</td>
                      <td>
                        <span style={{ background:estadoBg(r.estado_reporte), border:`1px solid ${estadoColor(r.estado_reporte)}44`, color:estadoColor(r.estado_reporte), borderRadius:'50px', padding:'3px 12px', fontSize:'12px', fontWeight:600 }}>
                          {r.estado_reporte}
                        </span>
                      </td>
                      <td style={{ color:'#b8a8d8', fontSize:'13px' }}>{r.fecha_reporte?.split('T')[0] || r.fecha_reporte}</td>
                      <td>
                        {r.archivo && esImagen(r.archivo)
                          ? <img
                              src={`/uploads/${r.archivo}`}
                              alt="evidencia"
                              onClick={() => { setSeleccionado(r); setShowVerModal(true); }}
                              style={{ width:'52px', height:'38px', objectFit:'cover', borderRadius:'7px', border:'1px solid rgba(127,90,240,0.35)', cursor:'pointer', display:'block' }}
                            />
                          : r.archivo
                            ? <a href={`/uploads/${r.archivo}`} target="_blank" rel="noreferrer" style={{ color:'#c9a8ff', fontSize:'12px', fontWeight:600 }}>Ver</a>
                            : <span style={{ color:'#6a5a8a', fontSize:'12px' }}>—</span>
                        }
                      </td>
                      <td>
                        <button className="action-btn view" onClick={() => { setSeleccionado(r); setShowVerModal(true); }}>
                          <IconEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)} />

        {/* MODAL CREAR REPORTE */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight:'90vh', overflowY:'auto' }}>
              <h2 className="modal-title">Nuevo Reporte</h2>
              {equipoSel && (
                <div style={{ background:'rgba(127,90,240,0.1)', border:'1px solid rgba(127,90,240,0.25)', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
                  <IconMonitor size={16} />
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:'#f0eaff' }}>{equipoSel.marca} {equipoSel.modelo}</div>
                    <div style={{ fontSize:'11px', color:'#b8a8d8', fontFamily:'monospace' }}>{equipoSel.num_serie}</div>
                  </div>
                </div>
              )}
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Descripción del problema <span style={{ color:'#f87171' }}>*</span></label>
                  <textarea rows={4} placeholder="Describe detalladamente el problema..." value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} maxLength={255} required style={{ borderRadius:'12px', resize:'vertical' }} />
                  <div style={{ textAlign:'right', fontSize:'11px', color:'#b8a8d8', marginTop:'4px' }}>{formData.descripcion.length}/255</div>
                </div>
                <div className="form-group">
                  <label>Fecha <span style={{ color:'#f87171' }}>*</span></label>
                  <input type="date" value={formData.fecha_reporte} onChange={e => setFormData({ ...formData, fecha_reporte: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Imagen o evidencia <span style={{ color:'#b8a8d8', fontWeight:400 }}>(opcional, JPG/PNG/PDF, máx 5MB)</span></label>
                  <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={e => setImagenFile(e.target.files[0] || null)}
                    style={{ background:'#1a0f35', border:'1px solid rgba(127,90,240,0.3)', borderRadius:'10px', padding:'10px', color:'#f0eaff', fontSize:'13px', cursor:'pointer', width:'100%' }} />
                  {imagenFile && <div style={{ fontSize:'12px', color:'#4ade80', marginTop:'6px' }}>✓ {imagenFile.name}</div>}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar Reporte'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL VER */}
        {showVerModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowVerModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight:'90vh', overflowY:'auto' }}>
              <h2 className="modal-title">Reporte #{seleccionado.id_reporte}</h2>
              <div className="detalle-grid">
                <div className="detalle-item">
                  <span className="detalle-label">Estado</span>
                  <span className="detalle-valor" style={{ color:estadoColor(seleccionado.estado_reporte), fontWeight:700 }}>{seleccionado.estado_reporte}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Fecha</span>
                  <span className="detalle-valor">{seleccionado.fecha_reporte?.split('T')[0]}</span>
                </div>
                {/* Descripción completa */}
                <div style={{ background:'#0f0820', border:'1px solid rgba(127,90,240,0.25)', borderRadius:'10px', padding:'14px 16px', display:'flex', flexDirection:'column', gap:'8px' }}>
                  <span className="detalle-label">Descripción</span>
                  <span style={{ fontSize:'14px', color:'#f0eaff', lineHeight:'1.7', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{seleccionado.descripcion}</span>
                </div>
                {/* Imagen / archivo */}
                {seleccionado.archivo && (
                  <div style={{ background:'#0f0820', border:'1px solid rgba(127,90,240,0.25)', borderRadius:'10px', padding:'14px 16px', display:'flex', flexDirection:'column', gap:'12px' }}>
                    <span className="detalle-label">Evidencia</span>
                    {esImagen(seleccionado.archivo) ? (
                      <>
                        <img
                          src={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`}
                          alt="evidencia del reporte"
                          style={{ width:'100%', maxHeight:'360px', objectFit:'contain', borderRadius:'10px', border:'1px solid rgba(127,90,240,0.25)', background:'#080810', display:'block' }}
                          onError={e => {
                            e.target.onerror = null;
                            e.target.src = '';
                            e.target.style.display = 'none';
                            e.target.parentNode.querySelector('.img-fallback').style.display = 'flex';
                          }}
                        />
                        <div className="img-fallback" style={{ display:'none', flexDirection:'column', alignItems:'center', gap:'10px', padding:'20px', background:'rgba(127,90,240,0.06)', borderRadius:'10px', border:'1px dashed rgba(127,90,240,0.3)' }}>
                          <span style={{ fontSize:'13px', color:'#b8a8d8' }}>No se pudo cargar la imagen</span>
                          <a
                            href={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`}
                            target="_blank" rel="noreferrer"
                            style={{ color:'#c9a8ff', fontSize:'13px', fontWeight:600 }}
                          >
                            Abrir imagen directamente →
                          </a>
                        </div>
                        <a
                          href={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`}
                          target="_blank" rel="noreferrer"
                          style={{ color:'#b8a8d8', fontSize:'11px', textAlign:'center', marginTop:'-4px' }}
                        >
                          Abrir en nueva pestaña ↗
                        </a>
                      </>
                    ) : (
                      <a
                        href={`/uploads/${seleccionado.archivo.replace(/^.*[\\/]/, '')}`}
                        target="_blank" rel="noreferrer"
                        style={{ color:'#c9a8ff', fontSize:'13px', fontWeight:600, display:'inline-flex', alignItems:'center', gap:'6px' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Ver archivo adjunto
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="btn-save" onClick={() => setShowVerModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ReportesAprendiz;