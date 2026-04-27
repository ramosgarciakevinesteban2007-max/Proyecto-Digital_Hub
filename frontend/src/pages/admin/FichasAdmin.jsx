import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconUser, IconMonitor, IconReport, IconPencil, IconTrash, IconEye, JornadaIcon } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarAdmin from '../../components/SidebarAdmin';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
import '../../pages/admin/EquiposAdmin.css';
import '../../pages/admin/FichasAdmin.css';
import ConfirmModal from '../../components/ConfirmModal';

<<<<<<< HEAD
const estadoColor = (e) => ({ activa:'#4ade80', inactiva:'#f87171', cerrada:'#facc15', disponible:'#4ade80', asignado:'#facc15', danado:'#f87171', mantenimiento:'#fb923c', pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80' }[e] || '#c9a8ff');
const jornadaIcon = (j) => ({ Mañana:'🌅', tarde:'🌇', noche:'🌙'}[j] || '📅');
=======
const estadoColor = (e) => ({ activa:'#4ade80', inactiva:'#f87171', cerrada:'#facc15', disponible:'#4ade80', asignado:'#facc15', 'dañado':'#f87171', mantenimiento:'#fb923c', pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80' }[e] || '#c9a8ff');
const jornadaIcon = (j) => ({ Mañana:'🌅', Tarde:'🌇', Noche:'🌙'}[j] || '📅');
>>>>>>> main

const FichasAdmin = () => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('lista');
  const [fichaActiva, setFichaActiva] = useState(null);
  const [tab, setTab] = useState('aprendices');
  const [aprendices, setAprendices] = useState([]);
  const [portatiles, setPortatiles] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroJornada, setFiltroJornada] = useState('');
  const [tabPrincipal, setTabPrincipal] = useState('fichas');
  const [ambientes, setAmbientes] = useState([]);
  const [loadingAmb, setLoadingAmb] = useState(false);
  const [filtroAmb, setFiltroAmb] = useState('');
  const [showModalAmb, setShowModalAmb] = useState(false);
  const [showEditAmb, setShowEditAmb] = useState(false);
  const [selAmb, setSelAmb] = useState(null);
  const [formAmb, setFormAmb] = useState({ nombre: '', direccion: '' });
  const [editAmb, setEditAmb] = useState({ nombre: '', direccion: '' });
  const [errorAmb, setErrorAmb] = useState('');
  const [confirmAmbId, setConfirmAmbId] = useState(null);
  const [page, setPage] = useState(1);
  const [errorExport, setErrorExport] = useState('');
  const [showModalFicha, setShowModalFicha] = useState(false);
  const [formFicha, setFormFicha] = useState({ nombre: '', programa_formacion: '', jornada: 'manana', cupo_maximo: 30, ambiente: '', nave: '' });
  const [errorFicha, setErrorFicha] = useState('');
  const PER_PAGE = 9;
  const token = localStorage.getItem('token');

  useEffect(() => { if (!token) { navigate('/login'); return; } cargar(); }, [token]);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/fichas', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate('/login'); return; }
      setFichas(await res.json());
    } catch (err) { console.error('Error cargando fichas:', err); }
    finally { setLoading(false); }
  };

  const cargarDetalle = async (ficha) => {
    setLoadingDetalle(true);
    const h = { Authorization: `Bearer ${token}` };
    const id = ficha.id_ficha ?? ficha.id;
    try {
      const [ra, rp, rr] = await Promise.all([
        fetch(`/api/fichas/${id}/aprendices`, { headers: h }).then(r => r.json()).catch(() => []),
        fetch(`/api/fichas/${id}/portatiles`, { headers: h }).then(r => r.json()).catch(() => []),
        fetch(`/api/fichas/${id}/reportes`,   { headers: h }).then(r => r.json()).catch(() => []),
      ]);
      setAprendices(Array.isArray(ra) ? ra : []);
      setPortatiles(Array.isArray(rp) ? rp : []);
      setReportes(Array.isArray(rr) ? rr : []);
    } catch (err) { console.error('Error cargando detalle:', err); }
    finally { setLoadingDetalle(false); }
  };

  const abrirFicha = (f) => { setFichaActiva(f); setVista('detalle'); setTab('aprendices'); cargarDetalle(f); };

  const filtrados = fichas.filter(f => {
    const b = filtro.toLowerCase();
    return (!b || f.nombre?.toLowerCase().includes(b) || f.programa_formacion?.toLowerCase().includes(b))
      && (!filtroEstado || f.estado === filtroEstado)
      && (!filtroJornada || f.jornada === filtroJornada);
  });
  const paginados = filtrados.slice((page-1)*PER_PAGE, page*PER_PAGE);

  // ===== DETALLE =====
  if (vista === 'detalle' && fichaActiva) {
    const pct = fichaActiva.cupo_maximo > 0 ? Math.round((aprendices.length / fichaActiva.cupo_maximo) * 100) : 0;
    return (
      <div className="equipment-layout">
        <SidebarAdmin />
        <main className="equipment-main">
          <div className="fd-header">
            <button onClick={() => setVista('lista')} className="fd-back-btn">← Volver</button>
            <div className="fd-header-info" style={{display:'flex',alignItems:'center',gap:'10px',flex:1,flexWrap:'wrap'}}>
              <span className="fd-jornada-pill"><JornadaIcon jornada={fichaActiva.jornada} size={13}/> {fichaActiva.jornada}</span>
              <h1 className="fd-title" style={{margin:0,fontSize:'20px',fontWeight:800,color:'#fff'}}>{fichaActiva.nombre}</h1>
              <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
              <p className="fd-subtitle" style={{margin:0,fontSize:'14px',color:'#b8a8d8'}}>{fichaActiva.programa_formacion}</p>
              {(fichaActiva.ambiente_nombre || fichaActiva.ambiente || fichaActiva.ambiente_nave || fichaActiva.nave) && (
                <>
                  <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
                  <span style={{fontSize:'12px',color:'#aaa'}}>
                    {(fichaActiva.ambiente_nombre || fichaActiva.ambiente) && `Ambiente ${fichaActiva.ambiente_nombre || fichaActiva.ambiente}`}
                    {(fichaActiva.ambiente_nombre || fichaActiva.ambiente) && (fichaActiva.ambiente_nave || fichaActiva.nave) && ' en '}
                    {(fichaActiva.ambiente_nave || fichaActiva.nave) && `Nave ${fichaActiva.ambiente_nave || fichaActiva.nave}`}
                  </span>
                </>
              )}
            </div>
            <div className="fd-header-actions">
              <span className="fd-estado-pill" style={{background:`${estadoColor(fichaActiva.estado)}18`,border:`1px solid ${estadoColor(fichaActiva.estado)}44`,color:estadoColor(fichaActiva.estado)}}>{fichaActiva.estado}</span>
              <NotificacionesBtn />
            </div>
          </div>

          <div className="fd-bento">
            <div className="fd-widget fd-widget-cupo">
              <div className="fd-widget-label">Ocupación</div>
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
          </div>

          <div className="fd-tabs-bar">
            <button className={`fd-tab ${tab==='aprendices'?'fd-tab-active':''}`} onClick={()=>setTab('aprendices')}><IconUser size={14}/> Aprendices <span className="fd-tab-badge" style={{background:'rgba(127,90,240,0.2)',color:'#c9a8ff'}}>{aprendices.length}</span></button>
            <button className={`fd-tab ${tab==='dispositivos'?'fd-tab-active':''}`} onClick={()=>setTab('dispositivos')}><IconMonitor size={14}/> Dispositivos <span className="fd-tab-badge" style={{background:'rgba(96,165,250,0.2)',color:'#60a5fa'}}>{portatiles.length}</span></button>
            <button className={`fd-tab ${tab==='reportes'?'fd-tab-active':''}`} onClick={()=>setTab('reportes')}><IconReport size={14}/> Reportes <span className="fd-tab-badge" style={{background:'rgba(251,146,60,0.2)',color:'#fb923c'}}>{reportes.length}</span></button>
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
                          <td><span style={{color:estadoColor(a.estado),fontWeight:600,fontSize:'12px',display:'inline-flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:estadoColor(a.estado)}} />{a.estado}</span></td>
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
                          <td><span style={{color:estadoColor(p.estado),fontWeight:600,fontSize:'12px',display:'inline-flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:estadoColor(p.estado)}} />{p.estado}</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
              {tab === 'reportes' && (
                <table className="equipment-table">
                  <thead><tr><th>Aprendiz</th><th>Descripción</th><th>Estado</th><th>Fecha</th><th>Ver</th></tr></thead>
                  <tbody>
                    {reportes.length === 0
                      ? <tr><td colSpan="5" className="fd-empty-row">Sin reportes en esta ficha</td></tr>
                      : reportes.map(r => (
                        <tr key={r.id_reporte}>
                          <td>{r.aprendiz}</td>
                          <td style={{maxWidth:'260px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-muted-dark)',fontSize:'13px'}}>{r.descripcion}</td>
                          <td><span style={{color:estadoColor(r.estado_reporte),fontWeight:600,fontSize:'12px',display:'inline-flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:estadoColor(r.estado_reporte)}} />{r.estado_reporte}</span></td>
                          <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{r.fecha_reporte?.split('T')[0] || r.fecha_reporte}</td>
                          <td><button className="action-btn view" onClick={() => setReporteSeleccionado(r)}><IconEye size={15}/></button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {reporteSeleccionado && (
            <div className="modal-overlay" onClick={() => setReporteSeleccionado(null)}>
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
                        <img src={`/uploads/${reporteSeleccionado.archivo}`} alt="evidencia"
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
                <div className="modal-actions"><button className="btn-save" onClick={() => setReporteSeleccionado(null)}>Cerrar</button></div>
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  const cargarAmbientes = async () => {
    setLoadingAmb(true);
    try {
      const res = await fetch('/api/ambientes', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAmbientes(Array.isArray(data) ? data : []);
    } catch (err) { console.error('Error cargando ambientes:', err); }
    finally { setLoadingAmb(false); }
  };

  const handleAmbSubmit = async (e) => {
    e.preventDefault(); setErrorAmb('');
    try {
      const res = await fetch('/api/ambientes', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(formAmb) });
      if (res.ok) { setShowModalAmb(false); setFormAmb({ nombre: '', direccion: '' }); cargarAmbientes(); }
      else { const d = await res.json(); setErrorAmb(d.message || 'Error'); }
    } catch { setErrorAmb('Error de conexión'); }
  };

  const handleAmbEditar = async (e) => {
    e.preventDefault(); setErrorAmb('');
    try {
      const res = await fetch(`/api/ambientes/${selAmb.id_ambiente}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editAmb) });
      if (res.ok) { setShowEditAmb(false); cargarAmbientes(); }
      else { const d = await res.json(); setErrorAmb(d.message || 'Error'); }
    } catch { setErrorAmb('Error de conexión'); }
  };

  const handleAmbEliminar = async (id) => {
    setConfirmAmbId(id);
  };

  const doAmbEliminar = async (id) => {
    try {
      const res = await fetch(`/api/ambientes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) cargarAmbientes();
    } catch (err) { console.error('Error eliminando ambiente:', err); }
  };

  const ambFiltrados = ambientes.filter(a => !filtroAmb || a.nombre?.toLowerCase().includes(filtroAmb.toLowerCase()) || a.direccion?.toLowerCase().includes(filtroAmb.toLowerCase()));
  const AMB_COLORS = ['#c9a8ff','#60a5fa','#4ade80','#fb923c','#f472b6','#34d399','#facc15','#a78bfa'];

  const exportarFichas = async () => {
    setErrorExport('');
    try {
      const res = await fetch('/exportar/fichas/excel', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setErrorExport('Error al exportar. Intenta de nuevo.'); return; }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'fichas.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) { console.error('Error exportando:', err); setErrorExport('Error de conexión al exportar.'); }
  };

  const handleFichaSubmit = async (e) => {
    e.preventDefault(); setErrorFicha('');
    try {
      const res = await fetch('/api/fichas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formFicha)
      });
      const data = await res.json();
      if (!res.ok) { setErrorFicha(data.mensaje || data.message || 'Error al crear'); return; }
      setShowModalFicha(false);
      setFormFicha({ nombre: '', programa_formacion: '', jornada: 'manana', cupo_maximo: 30, ambiente: '', nave: '' });
      cargar();
    } catch { setErrorFicha('Error al conectar'); }
  };

  // ===== LISTA =====
  return (
    <div className="equipment-layout">
      <SidebarAdmin />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Fichas</h1>
            <p className="equipment-subtitle">Total: <span>{fichas.length}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexDirection: 'column' }}>
            {errorExport && <p style={{color:'#f87171',fontSize:'12px',margin:0}}>{errorExport}</p>}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={exportarFichas} style={{ background: '#039b5b', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Excel
            </button>
            <NotificacionesBtn />
            </div>
          </div>
        </div>

        <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><IconUser size={20}/></div>
              <div className="stat-card-text"><div className="stat-value">{fichas.length}</div><div className="stat-label">Total</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><IconUser size={20}/></div>
              <div className="stat-card-text"><div className="stat-value" style={{color:'#4ade80'}}>{fichas.filter(f=>f.estado==='activa').length}</div><div className="stat-label">Activas</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><IconUser size={20}/></div>
              <div className="stat-card-text"><div className="stat-value" style={{color:'#f87171'}}>{fichas.filter(f=>f.estado!=='activa').length}</div><div className="stat-label">Inactivas</div></div>
            </div>
          </div>

          <div className="filters-row">
            <input className="filter-input" placeholder="Buscar ficha..." value={filtro} onChange={e => { setFiltro(e.target.value); setPage(1); }}/>
            <select className="filter-input" value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}>
              <option value="">Todos los estados</option>
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="cerrada">Cerrada</option>
              <option value="finalizada">Finalizada</option>
            </select>
            <select className="filter-input" value={filtroJornada} onChange={e => { setFiltroJornada(e.target.value); setPage(1); }}>
              <option value="">Todas las jornadas</option>
              <option value="Mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
            <button className="filter-clear" onClick={() => { setFiltro(''); setFiltroEstado(''); setFiltroJornada(''); setPage(1); }}>Limpiar</button>
          </div>

          {loading ? <div style={{textAlign:'center',padding:'48px',color:'#b8a8d8'}}>Cargando...</div> : (
            <div className="fichas-grid">
              {paginados.length === 0
                ? <div style={{gridColumn:'1/-1',textAlign:'center',padding:'48px',color:'#b8a8d8'}}>Sin fichas</div>
                : paginados.map(f => (
                  <div key={f.id_ficha ?? f.id} className="ficha-card" onClick={() => abrirFicha(f)}>
                    <div className="ficha-card-top">
                      <span className="ficha-jornada-badge"><JornadaIcon jornada={f.jornada} size={12}/> {f.jornada}</span>
                      <span style={{background:`${estadoColor(f.estado)}18`,border:`1px solid ${estadoColor(f.estado)}44`,color:estadoColor(f.estado),borderRadius:'50px',padding:'2px 10px',fontSize:'11px',fontWeight:600}}>{f.estado}</span>
                    </div>
                    <div className="ficha-card-nombre">{f.nombre}</div>
                    <div className="ficha-card-programa">{f.programa_formacion}</div>
                    {(f.ambiente_nombre || f.ambiente || f.ambiente_nave || f.nave) && (
                      <div style={{fontSize:'11px',color:'#7a6a9a',marginTop:'4px'}}>
                        {(f.ambiente_nombre || f.ambiente) && `Ambiente ${f.ambiente_nombre || f.ambiente}`}
                        {(f.ambiente_nombre || f.ambiente) && (f.ambiente_nave || f.nave) && ' • '}
                        {(f.ambiente_nave || f.nave) && `Nave ${f.ambiente_nave || f.nave}`}
                      </div>
                    )}
                    <div className="ficha-card-footer">
                      <span><IconUser size={13}/> Cupo: {f.cupo_maximo}</span>
                      <span className="ficha-card-ver">Ver ficha →</span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
          <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)}/>
      </main>
    </div>
  );
};

export default FichasAdmin;
