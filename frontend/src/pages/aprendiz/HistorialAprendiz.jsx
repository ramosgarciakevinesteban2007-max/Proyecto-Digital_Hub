import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconBell, IconClock, IconCheck, IconReport } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarAprendiz from '../../components/SidebarAprendiz';
import '../../pages/aprendiz/HistorialAprendiz.css';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';
import '../admin/HistorialAdmin.css';

const estadoColor = (e) => ({ pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80' }[e] || '#c9a8ff');
const estadoBadge = (e) => ({
  pendiente:   { bg:'rgba(250,204,21,0.15)',  border:'rgba(250,204,21,0.45)'  },
  en_revision: { bg:'rgba(251,146,60,0.15)',  border:'rgba(251,146,60,0.45)'  },
  resuelto:    { bg:'rgba(74,222,128,0.15)',  border:'rgba(74,222,128,0.45)'  },
}[e] || { bg:'rgba(201,168,255,0.15)', border:'rgba(201,168,255,0.45)' });

const HistorialAprendiz = () => {
  const navigate = useNavigate();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtros, setFiltros] = useState({ buscar: '', estado: '', desde: '', hasta: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch('/api/reportes', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (r.status === 401) { navigate('/login'); return []; } return r.json(); })
      .then(data => {
        if (Array.isArray(data)) setReportes(data);
        else setReportes([]);
      })
      .catch(() => setError('Error al cargar el historial'))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = reportes.filter(r => {
    const b = filtros.buscar.toLowerCase();
    const fecha = r.fecha_reporte?.split('T')[0] || r.fecha_reporte || '';
    return (!b || r.descripcion?.toLowerCase().includes(b) || String(r.id_reporte).includes(b))
      && (!filtros.estado || r.estado_reporte === filtros.estado)
      && (!filtros.desde || fecha >= filtros.desde)
      && (!filtros.hasta || fecha <= filtros.hasta);
  });
  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resueltos  = reportes.filter(r => r.estado_reporte === 'resuelto').length;
  const pendientes = reportes.filter(r => r.estado_reporte === 'pendiente').length;
  const enRevision = reportes.filter(r => r.estado_reporte === 'en_revision').length;

  return (
    <div className="equipment-layout">
      <SidebarAprendiz />
      <main className="equipment-main">

        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Mis Reportes</h1>
            <p className="equipment-subtitle">Total: <span>{reportes.length}</span></p>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <button onClick={cargar} style={{background:'#7f5af0',border:'1px solid #7f5af0',borderRadius:'10px',padding:'8px 16px',color:'#ffffff',fontSize:'13px',fontWeight:600,cursor:'pointer',boxShadow:'0 2px 8px rgba(127,90,240,0.25)',transition:'all 0.2s ease'}}>
              ↻ Actualizar
            </button>
            <NotificacionesBtn />
          </div>
        </div>

        <div className="hist-summary">
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(127,90,240,0.15)',color:'#c9a8ff'}}><IconReport size={20}/></div>
            <div><div className="hist-summary-num">{reportes.length}</div><div className="hist-summary-label">Total</div></div>
          </div>
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(250,204,21,0.12)',color:'#facc15'}}><IconClock size={20}/></div>
            <div><div className="hist-summary-num" style={{color:'#facc15'}}>{pendientes}</div><div className="hist-summary-label">Pendientes</div></div>
          </div>
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(251,146,60,0.12)',color:'#fb923c'}}><IconClock size={20}/></div>
            <div><div className="hist-summary-num" style={{color:'#fb923c'}}>{enRevision}</div><div className="hist-summary-label">En revisión</div></div>
          </div>
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(74,222,128,0.12)',color:'#4ade80'}}><IconCheck size={20}/></div>
            <div><div className="hist-summary-num" style={{color:'#4ade80'}}>{resueltos}</div><div className="hist-summary-label">Resueltos</div></div>
          </div>
        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="hist-search-row">
          <div style={{display:'flex',gap:'10px',flex:1,flexWrap:'wrap'}}>
            <input className="filter-input" placeholder="Buscar por descripcion o ID..." value={filtros.buscar} onChange={e => { setFiltros({...filtros, buscar: e.target.value}); setPage(1); }} style={{flex:'2',minWidth:'200px'}} />
            <select className="filter-input" value={filtros.estado} onChange={e => { setFiltros({...filtros, estado: e.target.value}); setPage(1); }} style={{flex:'1',minWidth:'140px'}}>
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_revision">En revisión</option>
              <option value="resuelto">Resuelto</option>
            </select>
            <input className="filter-input" type="date" title="Desde" value={filtros.desde} onChange={e => { setFiltros({...filtros, desde: e.target.value}); setPage(1); }} style={{flex:'1',minWidth:'130px'}} />
            <input className="filter-input" type="date" title="Hasta" value={filtros.hasta} onChange={e => { setFiltros({...filtros, hasta: e.target.value}); setPage(1); }} style={{flex:'1',minWidth:'130px'}} />
            <button className="filter-clear" onClick={() => { setFiltros({ buscar:'', estado:'', desde:'', hasta:'' }); setPage(1); }}>Limpiar</button>
          </div>
          <span className="hist-count">{filtrados.length} registros</span>
        </div>

        <div className="hist-timeline">
          {loading ? (
            <div className="hist-empty">Cargando historial...</div>
          ) : filtrados.length === 0 ? (
            <div className="hist-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,255,0.25)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>Sin reportes en el historial</span>
            </div>
          ) : paginados.map((r, i) => (
            <div key={r.id_reporte} className="hist-item">
              <div className="hist-dot" style={{background: estadoColor(r.estado_reporte), boxShadow: `0 0 8px ${estadoColor(r.estado_reporte)}`}} />
              <div className="hist-line" style={{opacity: i < filtrados.length - 1 ? 1 : 0}} />
              <div className="hist-card" onClick={() => setSeleccionado(r)}>
                <div className="hist-card-header">
                  <span className="hist-serial" style={{maxWidth:'60%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.descripcion}</span>
                  <span className="hist-badge" style={{background: estadoBadge(r.estado_reporte).bg, border:`1px solid ${estadoBadge(r.estado_reporte).border}`, color: estadoColor(r.estado_reporte)}}>
                    {r.estado_reporte}
                  </span>
                </div>
                <div className="hist-card-body">
                  <span>{r.fecha_reporte?.split('T')[0] || r.fecha_reporte}</span>
                  <span className="hist-id">Reporte #{r.id_reporte}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {seleccionado && (
          <div className="modal-overlay" onClick={() => setSeleccionado(null)}>
            <div className="modal-content rp-modal" onClick={e => e.stopPropagation()}>
              <div className="rp-modal-header">
                <div className="rp-modal-icon"><IconEye size={18} /></div>
                <div>
                  <h2 className="modal-title" style={{marginBottom:'2px'}}>Detalle del Reporte</h2>
                  <p style={{fontSize:'13px',color:'var(--text-2)'}}>Reporte #{seleccionado.id_reporte}</p>
                </div>
                <button className="rp-close-btn" onClick={() => setSeleccionado(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="rp-detail-body">
                <div className="rp-detail-desc">
                  <div style={{fontSize:'11px',color:'var(--text-2)',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'1px'}}>Descripcion</div>
                  <p style={{fontSize:'15px',color:'var(--text)',lineHeight:'1.7'}}>{seleccionado.descripcion}</p>
                </div>
                <div className="rp-detail-meta">
                  <div className="rp-meta-item">
                    <span className="rp-meta-label">Estado</span>
                    <span style={{background:estadoBadge(seleccionado.estado_reporte).bg,border:`1px solid ${estadoBadge(seleccionado.estado_reporte).border}`,color:estadoColor(seleccionado.estado_reporte),borderRadius:'50px',padding:'4px 14px',fontSize:'13px',fontWeight:600}}>{seleccionado.estado_reporte}</span>
                  </div>
                  <div className="rp-meta-item">
                    <span className="rp-meta-label">Fecha</span>
                    <span className="rp-meta-val">{seleccionado.fecha_reporte?.split('T')[0] || seleccionado.fecha_reporte}</span>
                  </div>
                  <div className="rp-meta-item">
                    <span className="rp-meta-label">ID</span>
                    <span className="rp-meta-val">#{seleccionado.id_reporte}</span>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-save" onClick={() => setSeleccionado(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)} />
      </main>
    </div>
  );
};

export default HistorialAprendiz;

