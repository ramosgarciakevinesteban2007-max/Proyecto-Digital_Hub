import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { IconBell, IconPencil, IconTrash, IconUser, IconMonitor, IconReport, IconEye, JornadaIcon } from '../../components/Icons';

import NotificacionesBtn from '../../components/NotificacionesBtn';

import SidebarInstructor from '../../components/SidebarInstructor';

import './FichasInstructor.css';

import Pagination from '../../components/Pagination';

import '../../components/Pagination.css';

import ConfirmModal from '../../components/ConfirmModal';

import ChatFicha from '../../components/ChatFicha';



const FichasInstructor = () => {

  const navigate = useNavigate();

  const [fichas, setFichas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  const [vista, setVista] = useState('lista');

  const [fichaActiva, setFichaActiva] = useState(null);

  const [tab, setTab] = useState('aprendices');

  const [aprendices, setAprendices] = useState([]);

  const [portatiles, setPortatiles] = useState([]);

  const [reportes, setReportes] = useState([]);

  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [correoAsignar, setCorreoAsignar] = useState('');

  const [formData, setFormData] = useState({ nombre: '', programa_formacion: '', jornada: 'manana', cupo_maximo: 30, ambiente: '', nave: '' });

  const [editData, setEditData] = useState({ nombre: '', programa_formacion: '', jornada: 'manana', cupo_maximo: 30, estado: 'activa', ambiente: '', nave: '' });

  const [filtro, setFiltro] = useState('');

  const [filtroEstadoF, setFiltroEstadoF] = useState('');

  const [filtroJornadaF, setFiltroJornadaF] = useState('');

  const [page, setPage] = useState(1);

  const PER_PAGE = 9;

  const token = localStorage.getItem('token');



  useEffect(() => {

    if (!token) { navigate('/login'); return; }

    cargar();

  }, []);



  const cargar = async () => {

    try {

      setLoading(true);

      const res = await fetch('/api/fichas', { headers: { Authorization: `Bearer ${token}` } });

      if (res.status === 401) { navigate('/login'); return; }

      const data = await res.json();

      setFichas(Array.isArray(data) ? data : []);

    } catch { setFichas([]); }

    finally { setLoading(false); }

  };



  const cargarDetalle = async (ficha) => {

    setLoadingDetalle(true);

    const h = { Authorization: `Bearer ${token}` };

    const id = ficha.id;

    try {

      const [ra, rp, rr] = await Promise.all([

        fetch(`/api/fichas/${id}/aprendices`, { headers: h }).then(r => r.json()).catch(() => []),

        fetch(`/api/fichas/${id}/portatiles`, { headers: h }).then(r => r.json()).catch(() => []),

        fetch(`/api/fichas/${id}/reportes`,   { headers: h }).then(r => r.json()).catch(() => []),

      ]);

      setAprendices(Array.isArray(ra) ? ra : []);

      setPortatiles(Array.isArray(rp) ? rp : []);

      setReportes(Array.isArray(rr) ? rr : []);

    } catch {}

    finally { setLoadingDetalle(false); }

  };



  const exportarExcel = async () => {

    try {

      const res = await fetch(`/exportar/reportes/ficha/${fichaActiva.id}`, { headers: { Authorization: `Bearer ${token}` } });

      if (!res.ok) { alert('Error al exportar'); return; }

      const blob = await res.blob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url; a.download = `Reportes_${fichaActiva.nombre}_${new Date().toISOString().split('T')[0]}.xlsx`; a.click();

      URL.revokeObjectURL(url);

    } catch { alert('Error al exportar'); }

  };



  const abrirFicha = (f) => {

    setFichaActiva(f); setVista('detalle');

    setTab('aprendices'); setError(''); setSuccessMsg('');

    cargarDetalle(f);

  };



  const handleSubmit = async (e) => {

    e.preventDefault(); setError('');

    try {

      const res = await fetch('/api/fichas', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

        body: JSON.stringify(formData)

      });

      const data = await res.json();

      if (!res.ok) { setError(data.mensaje || data.message || 'Error al crear'); return; }

      setShowModal(false);

      setFormData({ nombre: '', programa_formacion: '', jornada: 'manana', cupo_maximo: 30 });

      cargar();

    } catch { setError('Error al conectar'); }

  };



  const handleEditar = async (e) => {

    e.preventDefault(); setError('');

    try {

      const res = await fetch(`/api/fichas/${fichaActiva.id}`, {

        method: 'PUT',

        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

        body: JSON.stringify(editData)

      });

      const data = await res.json();

      if (!res.ok) { setError(data.mensaje || data.message || 'Error al editar'); return; }

      setShowEditModal(false);

      const updated = { ...fichaActiva, ...editData };

      setFichaActiva(updated); cargar();

    } catch { setError('Error al conectar'); }

  };



  const handleEliminar = async (id) => {

    try {

      const res = await fetch(`/api/fichas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

      if (res.ok) { setConfirmFichaId(null); setVista('lista'); setFichaActiva(null); cargar(); }

      else { const d = await res.json(); setError(d.mensaje || d.message || 'Error'); }

    } catch { setError('Error al eliminar'); }

  };



  const handleAsignar = async (e) => {

    e.preventDefault(); setError(''); setSuccessMsg('');

    try {

      const res = await fetch(`/api/fichas/${fichaActiva.id}/asignar`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

        body: JSON.stringify({ correo_aprendiz: correoAsignar })

      });

      const data = await res.json();

      if (!res.ok) { setError(data.mensaje || data.message || 'Error al asignar'); return; }

      setSuccessMsg('Aprendiz asignado correctamente');

      setCorreoAsignar('');

      setTimeout(() => setSuccessMsg(''), 3000);

      cargarDetalle(fichaActiva);

    } catch { setError('Error al conectar'); }

  };



  const [showVerReporte, setShowVerReporte] = useState(false);

  const [showEditReporte, setShowEditReporte] = useState(false);

  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  const [editReporteData, setEditReporteData] = useState({ estado_reporte: 'pendiente' });

  const [confirmFichaId, setConfirmFichaId] = useState(null);

  const [confirmReporteId, setConfirmReporteId] = useState(null);



  const abrirVerReporte = (r) => { setReporteSeleccionado(r); setShowVerReporte(true); };

  const abrirEditarReporte = (r) => { setReporteSeleccionado(r); setEditReporteData({ estado_reporte: r.estado_reporte }); setShowEditReporte(true); };



  const handleEditarReporte = async (e) => {

    e.preventDefault();

    try {

      const res = await fetch(`/api/reportes/${reporteSeleccionado.id_reporte}`, {

        method: 'PUT',

        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },

        body: JSON.stringify(editReporteData)

      });

      if (res.ok) {

        setShowEditReporte(false);

        setReportes(prev => prev.map(r => r.id_reporte === reporteSeleccionado.id_reporte ? { ...r, ...editReporteData } : r));

      }

    } catch {}

  };



  const handleEliminarReporte = async (id) => {

    try {

      const res = await fetch(`/api/reportes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

      if (res.ok) { setConfirmReporteId(null); setReportes(prev => prev.filter(r => r.id_reporte !== id)); }

    } catch {}

    setConfirmReporteId(null);

  };



  const estadoColor = (e) => ({ activa:'#4ade80', inactiva:'#f87171', cerrada:'#facc15', disponible:'#4ade80', asignado:'#facc15', 'dañado':'#f87171', mantenimiento:'#fb923c', pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80' }[e] || '#c9a8ff');

  const filtrados = fichas.filter(f => {

    const b = filtro.toLowerCase();

    return (!b || f.nombre?.toLowerCase().includes(b) || f.programa_formacion?.toLowerCase().includes(b))

      && (!filtroEstadoF || f.estado === filtroEstadoF)

      && (!filtroJornadaF || f.jornada === filtroJornadaF);

  });

  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);



  if (vista === 'detalle' && fichaActiva) {

    const pct = fichaActiva.cupo_maximo > 0 ? Math.round((aprendices.length / fichaActiva.cupo_maximo) * 100) : 0;

    return (

      <div className="equipment-layout">

        <SidebarInstructor />

        <main className="equipment-main">

          <div className="fd-header">

            <button onClick={() => setVista('lista')} className="fd-back-btn">← Volver</button>

            <div className="fd-header-info" style={{display:'flex',alignItems:'center',gap:'10px',flex:1,flexWrap:'wrap'}}>

              <span style={{fontSize:'16px',fontWeight:800,color:'#fff'}}>{fichaActiva.nombre}</span>

              <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>

              <span style={{fontSize:'13px',color:'#aaa'}}>{fichaActiva.programa_formacion}</span>

              <span className="fd-topbar-sep">·</span>

              <span className="fd-jornada-pill"><JornadaIcon jornada={fichaActiva.jornada} size={13}/> {fichaActiva.jornada}</span>

              <span style={{fontSize:'12px',color:'#aaa'}}>

                Ambiente {fichaActiva.ambiente_nombre || fichaActiva.ambiente } en Nave {fichaActiva.ambiente_nave || fichaActiva.nave}

              </span>

            </div>

            <div className="fd-header-actions">

              <span className="fd-estado-pill" style={{background:`${estadoColor(fichaActiva.estado)}22`,border:`1px solid ${estadoColor(fichaActiva.estado)}55`,color:estadoColor(fichaActiva.estado)}}>{fichaActiva.estado}</span>

              <button onClick={exportarExcel} style={{background:'linear-gradient(135deg,#4ade80,#22c55e)',border:'none',borderRadius:'10px',padding:'8px 14px',color:'#0a0a0f',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>

                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>

                Excel

              </button>

              <button className="fd-icon-btn fd-edit-btn" onClick={() => {

                setEditData({

                  nombre: fichaActiva.nombre,

                  programa_formacion: fichaActiva.programa_formacion,

                  jornada: fichaActiva.jornada,

                  cupo_maximo: fichaActiva.cupo_maximo,

                  estado: fichaActiva.estado || 'activa',

                  ambiente: fichaActiva.ambiente_nombre || fichaActiva.ambiente || '',

                  nave: fichaActiva.ambiente_nave || fichaActiva.nave || ''

                });

                setShowEditModal(true);

              }}><IconPencil size={14}/></button>

              <button className="fd-icon-btn fd-del-btn" onClick={() => setConfirmFichaId(fichaActiva.id)}><IconTrash size={14}/></button>

            </div>

          </div>



          <div className="fd-bento">

            <div className="fd-widget fd-widget-cupo">

              <div className="fd-widget-label">Ocupacion</div>

              <div className="fd-cupo-ring-wrap">

                <svg viewBox="0 0 80 80" className="fd-ring-svg">

                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>

                  <circle cx="40" cy="40" r="32" fill="none"

                    stroke={pct >= 90 ? '#f87171' : pct >= 60 ? '#facc15' : '#4ade80'}

                    strokeWidth="8" strokeLinecap="round"

                    strokeDasharray={`${2*Math.PI*32}`}

                    strokeDashoffset={`${2*Math.PI*32*(1-pct/100)}`}

                    transform="rotate(-90 40 40)"

                    style={{transition:'stroke-dashoffset 0.6s ease'}}

                  />

                </svg>

                <div className="fd-ring-center">

                  <div className="fd-ring-pct" style={{color: pct >= 90 ? '#f87171' : pct >= 60 ? '#facc15' : '#4ade80'}}>{pct}%</div>

                  <div className="fd-ring-sub">{aprendices.length}/{fichaActiva.cupo_maximo}</div>

                </div>

              </div>

              <div className="fd-cupo-label">Cupo utilizado</div>

            </div>

            <div className="fd-widget fd-widget-apr" onClick={() => setTab('aprendices')}>

              <div className="fd-widget-icon-wrap" style={{background:'rgba(127,90,240,0.2)'}}><IconUser size={22} style={{color:'#c9a8ff'}}/></div>

              <div className="fd-widget-num" style={{color:'#c9a8ff'}}>{aprendices.length}</div>

              <div className="fd-widget-label">Aprendices</div>

              <div className="fd-widget-hint">Ver lista →</div>

            </div>

            <div className="fd-widget fd-widget-dev" onClick={() => setTab('dispositivos')}>

              <div className="fd-widget-icon-wrap" style={{background:'rgba(96,165,250,0.2)'}}><IconMonitor size={22} style={{color:'#60a5fa'}}/></div>

              <div className="fd-widget-num" style={{color:'#60a5fa'}}>{portatiles.length}</div>

              <div className="fd-widget-label">Dispositivos</div>

              <div className="fd-widget-hint">Ver lista →</div>

            </div>

            <div className="fd-widget fd-widget-rep" onClick={() => setTab('reportes')}>

              <div className="fd-widget-icon-wrap" style={{background:'rgba(251,146,60,0.2)'}}><IconReport size={22} style={{color:'#fb923c'}}/></div>

              <div className="fd-widget-num" style={{color:'#fb923c'}}>{reportes.length}</div>

              <div className="fd-widget-label">Reportes</div>

              <div className="fd-widget-hint">Ver lista →</div>

            </div>

            <div className="fd-widget fd-widget-asignar">

              <div className="fd-asignar-header"><IconUser size={13}/> Asignar aprendiz a esta ficha</div>

              {error && <p className="table-error" style={{margin:'0 0 8px'}}>{error}</p>}

              {successMsg && <div className="fd-success-msg">{successMsg}</div>}

              <form onSubmit={handleAsignar} className="fd-asignar-form">

                <input className="filter-input" type="email" placeholder="correo@aprendiz.com" value={correoAsignar} onChange={e => setCorreoAsignar(e.target.value)} required style={{flex:1,margin:0}}/>

                <button type="submit" className="fd-asignar-btn">Asignar</button>

              </form>

            </div>

          </div>



          <div className="fd-tabs-bar">

            <button className={`fd-tab ${tab==='chat'?'fd-tab-active':''}`} onClick={()=>setTab('chat')}>

              Chat

            </button>

            <button className={`fd-tab ${tab==='aprendices'?'fd-tab-active':''}`} onClick={()=>setTab('aprendices')}>

              <IconUser size={14}/> Aprendices <span className="fd-tab-badge" style={{background:'rgba(127,90,240,0.2)',color:'#c9a8ff'}}>{aprendices.length}</span>

            </button>

            <button className={`fd-tab ${tab==='dispositivos'?'fd-tab-active':''}`} onClick={()=>setTab('dispositivos')}>

              <IconMonitor size={14}/> Dispositivos <span className="fd-tab-badge" style={{background:'rgba(96,165,250,0.2)',color:'#60a5fa'}}>{portatiles.length}</span>

            </button>

            <button className={`fd-tab ${tab==='reportes'?'fd-tab-active':''}`} onClick={()=>setTab('reportes')}>

              <IconReport size={14}/> Reportes <span className="fd-tab-badge" style={{background:'rgba(251,146,60,0.2)',color:'#fb923c'}}>{reportes.length}</span>

            </button>

          </div>



          {loadingDetalle ? (

            <div className="fd-loading">Cargando datos...</div>

          ) : (

            <div className="fd-table-wrap">

              {tab === 'aprendices' && (

                <table className="equipment-table">

                  <thead><tr><th>Nombre</th><th>Correo</th><th>Estado</th><th>Fecha unión</th></tr></thead>

                  <tbody>

                    {aprendices.length === 0

                      ? <tr><td colSpan="4" className="fd-empty-row">Sin aprendices en esta ficha</td></tr>

                      : aprendices.map(a => (

                        <tr key={a.id_usuario}>

                          <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="fd-avatar" style={{background:'rgba(127,90,240,0.25)',color:'#c9a8ff'}}>{a.nombre?.[0]?.toUpperCase()}</div>{a.nombre}</div></td>

                          <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{a.correo}</td>

                          <td><span style={{color:estadoColor(a.estado),fontWeight:600,fontSize:'12px'}}>{a.estado}</span></td>

                          <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{a.fecha_union?.split('T')[0] || a.fecha_union}</td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              )}

              {tab === 'dispositivos' && (

                <table className="equipment-table">

                  <thead><tr><th>N. Serie</th><th>Marca</th><th>Modelo</th><th>Estado</th></tr></thead>

                  <tbody>

                    {portatiles.length === 0

                      ? <tr><td colSpan="4" className="fd-empty-row">Sin dispositivos asignados</td></tr>

                      : portatiles.map(p => (

                        <tr key={p.id_portatil}>

                          <td style={{fontFamily:'monospace',fontSize:'13px'}}>{p.num_serie}</td>

                          <td>{p.marca}</td><td>{p.modelo}</td>

                          <td><span style={{color:estadoColor(p.estado),fontWeight:600,fontSize:'12px'}}>{p.estado}</span></td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              )}

              {tab === 'reportes' && (

                <table className="equipment-table">

                  <thead><tr><th>Aprendiz</th><th>Descripción</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>

                  <tbody>

                    {reportes.length === 0

                      ? <tr><td colSpan="5" className="fd-empty-row">Sin reportes en esta ficha</td></tr>

                      : reportes.map(r => (

                        <tr key={r.id_reporte}>

                          <td>{r.aprendiz}</td>

                          <td style={{maxWidth:'220px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-muted-dark)',fontSize:'13px'}}>{r.descripcion}</td>

                          <td><span style={{color:estadoColor(r.estado_reporte),fontWeight:600,fontSize:'12px'}}>{r.estado_reporte}</span></td>

                          <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{r.fecha_reporte?.split('T')[0] || r.fecha_reporte}</td>

                          <td><div className="action-buttons">

                            <button className="action-btn view" onClick={() => abrirVerReporte(r)}><IconEye size={15}/></button>

                            <button className="action-btn edit" onClick={() => abrirEditarReporte(r)} style={{fontSize:'11px',padding:'4px 8px',borderRadius:'8px'}}>Estado</button>

                            <button className="action-btn delete" onClick={() => setConfirmReporteId(r.id_reporte)}><IconTrash size={15}/></button>

                          </div></td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              )}

              {tab === 'chat' && (

                <ChatFicha idFicha={fichaActiva.id} token={token} />

              )}

            </div>

          )}



          {showEditModal && (

            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>

              <div className="modal-content" onClick={e => e.stopPropagation()}>

                <h2 className="modal-title">Editar Ficha</h2>

                {error && <p className="table-error">{error}</p>}

                <form onSubmit={handleEditar}>

                  <div className="form-group"><label>Número de ficha</label><input type="text" placeholder="ej: 4110" value={editData.nombre} onChange={e => setEditData({...editData, nombre: e.target.value})} required /></div>

                  <div className="form-group"><label>Programa de formación</label><input type="text" value={editData.programa_formacion} onChange={e => setEditData({...editData, programa_formacion: e.target.value})} required /></div>

                  <div className="form-group"><label>Jornada</label>

                    <select value={editData.jornada} onChange={e => setEditData({...editData, jornada: e.target.value})}>

                      <option value="manana">Mañana</option><option value="tarde">Tarde</option>

                      <option value="noche">Noche</option>

                    </select>

                  </div>

                  <div className="form-group"><label>Cupo máximo</label><input type="number" min="1" value={editData.cupo_maximo} onChange={e => setEditData({...editData, cupo_maximo: parseInt(e.target.value)})} required /></div>

                  <div className="form-group">

                    <label>Ambiente</label>

                    <input 

                      type="text"

                      value={editData.ambiente || ''} 

                      onChange={e => setEditData({...editData, ambiente: e.target.value})}

                    />

                  </div>



                  <div className="form-group">

                    <label>Nave</label>

                    <input 

                      type="text"

                      value={editData.nave || ''} 

                      onChange={e => setEditData({...editData, nave: e.target.value})}

                    />

                  </div>

                  <div className="form-group"><label>Estado</label>

                    <select value={editData.estado} onChange={e => setEditData({...editData, estado: e.target.value})}>

                      <option value="activa">Activa</option><option value="inactiva">Inactiva</option><option value="cerrada">Cerrada</option>

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



          {showVerReporte && reporteSeleccionado && (

            <div className="modal-overlay" onClick={() => setShowVerReporte(false)}>

              <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'520px'}}>

                <h2 className="modal-title">Reporte #{reporteSeleccionado.id_reporte}</h2>

                <div className="detalle-grid">

                  <div className="detalle-item"><span className="detalle-label">Aprendiz</span><span className="detalle-valor">{reporteSeleccionado.aprendiz}</span></div>

                  <div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{color:estadoColor(reporteSeleccionado.estado_reporte),fontWeight:600}}>{reporteSeleccionado.estado_reporte}</span></div>

                  <div className="detalle-item"><span className="detalle-label">Fecha</span><span className="detalle-valor">{reporteSeleccionado.fecha_reporte?.split('T')[0]}</span></div>

                  <div className="detalle-item" style={{gridColumn:'1/-1',flexDirection:'column',alignItems:'flex-start',gap:'8px'}}>
                    <span className="detalle-label">Descripción</span>
                    <span style={{fontSize:'14px',color:'#f0eaff',lineHeight:'1.6',whiteSpace:'pre-wrap'}}>{reporteSeleccionado.descripcion}</span>
                  </div>

                  {reporteSeleccionado.archivo && (
                    <div className="detalle-item" style={{gridColumn:'1/-1',flexDirection:'column',alignItems:'flex-start',gap:'10px'}}>
                      <span className="detalle-label">Evidencia adjunta</span>
                      {/\.(jpg|jpeg|png|gif|webp)$/i.test(reporteSeleccionado.archivo) ? (
                        <img
                          src={`/uploads/${reporteSeleccionado.archivo}`}
                          alt="evidencia"
                          style={{maxWidth:'100%',maxHeight:'300px',objectFit:'contain',borderRadius:'10px',border:'1px solid rgba(127,90,240,0.3)',cursor:'pointer'}}
                          onClick={() => window.open(`/uploads/${reporteSeleccionado.archivo}`, '_blank')}
                        />
                      ) : (
                        <a href={`/uploads/${reporteSeleccionado.archivo}`} target="_blank" rel="noreferrer"
                          style={{display:'inline-flex',alignItems:'center',gap:'8px',color:'#c9a8ff',fontSize:'13px',fontWeight:600,background:'rgba(127,90,240,0.1)',border:'1px solid rgba(127,90,240,0.3)',borderRadius:'8px',padding:'8px 14px',textDecoration:'none'}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Ver archivo adjunto
                        </a>
                      )}
                    </div>
                  )}

                </div>

                <div className="modal-actions"><button className="btn-save" onClick={() => setShowVerReporte(false)}>Cerrar</button></div>

              </div>

            </div>

          )}



          {showEditReporte && reporteSeleccionado && (

            <div className="modal-overlay" onClick={() => setShowEditReporte(false)}>

              <div className="modal-content" onClick={e => e.stopPropagation()}>

                <h2 className="modal-title">Cambiar estado del reporte</h2>

                <form onSubmit={handleEditarReporte}>

                  <div className="form-group"><label>Estado</label>

                    <select value={editReporteData.estado_reporte} onChange={e => setEditReporteData({...editReporteData, estado_reporte: e.target.value})}>

                      <option value="pendiente">Pendiente</option>

                      <option value="en_revision">En revisión</option>

                      <option value="resuelto">Resuelto</option>

                    </select>

                  </div>

                  <div className="modal-actions">

                    <button type="button" className="btn-cancel" onClick={() => setShowEditReporte(false)}>Cancelar</button>

                    <button type="submit" className="btn-save">Guardar</button>

                  </div>

                </form>

              </div>

            </div>

          )}

          {confirmFichaId && <ConfirmModal mensaje="¿Eliminar esta ficha?" onConfirm={() => handleEliminar(confirmFichaId)} onCancel={() => setConfirmFichaId(null)} />}

          {confirmReporteId && <ConfirmModal mensaje="¿Eliminar este reporte?" onConfirm={() => handleEliminarReporte(confirmReporteId)} onCancel={() => setConfirmReporteId(null)} />}

        </main>

      </div>

    );

  }



  return (

    <div className="equipment-layout">

      <SidebarInstructor />

      <main className="equipment-main">

        <div className="equipment-header">

          <div><h1 className="equipment-title">Mis Fichas</h1><p className="equipment-subtitle">Selecciona una ficha para gestionarla</p></div>

          <NotificacionesBtn />

        </div>

        <div className="stats-grid">

          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{fichas.length}</div></div>

          <div className="stat-card"><div className="stat-label">Activas</div><div className="stat-value" style={{color:'#4ade80'}}>{fichas.filter(f => f.estado === 'activa').length}</div></div>

          <div className="stat-card"><div className="stat-label">Inactivas</div><div className="stat-value" style={{color:'#f87171'}}>{fichas.filter(f => f.estado !== 'activa').length}</div></div>

        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row">

          <input className="filter-input" placeholder="Buscar ficha..." value={filtro} onChange={e => { setFiltro(e.target.value); setPage(1); }} />

          <select className="filter-input" value={filtroEstadoF} onChange={e => { setFiltroEstadoF(e.target.value); setPage(1); }}>

            <option value="">Todos los estados</option>

            <option value="activa">Activa</option>

            <option value="inactiva">Inactiva</option>

            <option value="cerrada">Cerrada</option>

          </select>

          <select className="filter-input" value={filtroJornadaF} onChange={e => { setFiltroJornadaF(e.target.value); setPage(1); }}>

            <option value="">Todas las jornadas</option>

            <option value="manana">Mañana</option>

            <option value="tarde">Tarde</option>

            <option value="noche">Noche</option>

          </select>

          <button className="filter-clear" onClick={() => { setFiltro(''); setFiltroEstadoF(''); setFiltroJornadaF(''); setPage(1); }}>Limpiar</button>

        </div>

        {loading ? (

          <div style={{textAlign:'center',padding:'48px',color:'var(--text-muted-dark)'}}>Cargando fichas...</div>

        ) : filtrados.length === 0 ? (

          <div style={{textAlign:'center',padding:'48px',color:'var(--text-muted-dark)'}}>No hay fichas registradas</div>

        ) : (

          <div className="fichas-grid">

            {paginados.map(f => (

              <div key={f.id} className="ficha-card" onClick={() => abrirFicha(f)}>

                <div className="ficha-card-top">

                  <span className="ficha-jornada-badge"><JornadaIcon jornada={f.jornada} size={12}/> {f.jornada}</span>

                  <span style={{background:`${estadoColor(f.estado)}18`,border:`1px solid ${estadoColor(f.estado)}44`,color:estadoColor(f.estado),borderRadius:'50px',padding:'2px 10px',fontSize:'11px',fontWeight:600}}>{f.estado}</span>

                </div>

                <div className="ficha-card-nombre">{f.nombre}</div>

                <div className="ficha-card-programa">{f.programa_formacion}</div>

                <div className="ficha-card-footer">

                  <span><IconUser size={13}/> Cupo: {f.cupo_maximo}</span>

                  <span className="ficha-card-ver">Ver ficha →</span>

                </div>

              </div>

            ))}

          </div>

        )}

        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)} />

        <button className="btn-add-equipment" onClick={() => { setError(''); setShowModal(true); }}>Nueva Ficha</button>



        {showModal && (

          <div className="modal-overlay" onClick={() => setShowModal(false)}>

            <div className="modal-content" onClick={e => e.stopPropagation()}>

              <h2 className="modal-title">Nueva Ficha</h2>

              {error && <p className="table-error">{error}</p>}

              <form onSubmit={handleSubmit}>

                <div className="form-group"><label>Número de ficha</label><input type="text" placeholder="ej: 3146013" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required /></div>

                <div className="form-group"><label>Programa de formación</label><input type="text" value={formData.programa_formacion} onChange={e => setFormData({...formData, programa_formacion: e.target.value})} required /></div>

                <div className="form-group"><label>Jornada</label>

                  <select value={formData.jornada} onChange={e => setFormData({...formData, jornada: e.target.value})}>

                    <option value="manana">Mañana</option><option value="tarde">Tarde</option>

                    <option value="noche">Noche</option>

                  </select>

                </div>

                <div className="form-group"><label>Cupo máximo</label><input type="number" min="1" value={formData.cupo_maximo} onChange={e => setFormData({...formData, cupo_maximo: parseInt(e.target.value)})} required /></div>

                <div className="form-group">

                <label>Ambiente</label>

                  <input 

                    type="text"

                    placeholder="ej: 4110"

                    value={formData.ambiente || ''} 

                    onChange={e => setFormData({...formData, ambiente: e.target.value})}

                  />

                </div>



                <div className="form-group">

                  <label>Nave</label>

                  <input 

                    type="text"

                    placeholder="ej: 4"

                    value={formData.nave || ''} 

                    onChange={e => setFormData({...formData, nave: e.target.value})}

                  />

                </div>

                <div className="modal-actions">

                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>

                  <button type="submit" className="btn-save">Crear Ficha</button>

                </div>

              </form>

            </div>

          </div>

        )}

      </main>

    </div>

  );

};



export default FichasInstructor;

