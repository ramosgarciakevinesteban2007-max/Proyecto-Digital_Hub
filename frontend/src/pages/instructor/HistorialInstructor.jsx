import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarInstructor from '../../components/SidebarInstructor';
import { IconBell, IconHistory, IconMonitor, IconCheck } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import './HistorialInstructor.css';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';

const estadoColor = (e) => ({ disponible:'#4ade80', asignado:'#facc15', 'dañado':'#f87171', mantenimiento:'#fb923c' }[e] || '#c9a8ff');

const HistorialInstructor = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [portatiles, setPortatiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [seleccionado, setSeleccionado] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargar = () => {
    fetch('/api/portatiles?limit=500', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.status === 401 ? navigate('/login') : r.json())
      .then(d => {
        const lista = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
        setPortatiles(lista);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const filtrados = portatiles.filter(p => {
    const b = filtro.toLowerCase();
    return (!b || p.num_serie?.toLowerCase().includes(b) || p.marca?.toLowerCase().includes(b))
      && (!filtroEstado || p.estado === filtroEstado);
  });

  const total      = portatiles.length;
  const disponibles = portatiles.filter(p => p.estado === 'disponible').length;
  const asignados   = portatiles.filter(p => p.estado === 'asignado').length;

  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="equipment-layout">
      <SidebarInstructor />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Historial de Equipos</h1>
            <p className="equipment-subtitle">Registro completo de todos los equipos en el sistema</p>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <button onClick={cargar} style={{background:'rgba(127,90,240,0.15)',border:'1px solid rgba(127,90,240,0.35)',borderRadius:'10px',padding:'8px 16px',color:'#c9a8ff',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>
              ↻ Actualizar
            </button>
            <NotificacionesBtn />
          </div>
        </div>

        <div className="hist-summary">
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(127,90,240,0.15)',color:'#c9a8ff'}}><IconMonitor size={20}/></div>
            <div><div className="hist-summary-num">{total}</div><div className="hist-summary-label">Total registrados</div></div>
          </div>
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(74,222,128,0.12)',color:'#4ade80'}}><IconCheck size={20}/></div>
            <div><div className="hist-summary-num" style={{color:'#4ade80'}}>{disponibles}</div><div className="hist-summary-label">Disponibles</div></div>
          </div>
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(250,204,21,0.12)',color:'#facc15'}}><IconHistory size={20}/></div>
            <div><div className="hist-summary-num" style={{color:'#facc15'}}>{asignados}</div><div className="hist-summary-label">En uso</div></div>
          </div>
          <div className="hist-summary-card">
            <div className="hist-summary-icon" style={{background:'rgba(248,113,113,0.12)',color:'#f87171'}}><IconMonitor size={20}/></div>
            <div><div className="hist-summary-num" style={{color:'#f87171'}}>{portatiles.filter(p=>p.estado==='dañado').length}</div><div className="hist-summary-label">Con fallas</div></div>
          </div>
        </div>

        <div className="filters-row">
          <input
            className="filter-input"
            placeholder="Buscar por serie, marca o modelo..."
            value={filtro}
            onChange={e => { setFiltro(e.target.value); setPage(1); }}
          />
          <select className="filter-input" value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}>
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="asignado">Asignado</option>
            <option value="dañado">Dañado</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
          <button className="filter-clear" onClick={() => { setFiltro(''); setFiltroEstado(''); setPage(1); }}>Limpiar</button>
          <span className="hist-count">{filtrados.length} registros</span>
        </div>

        <div className="hist-timeline">
          {loading ? (
            <div className="hist-empty">Cargando historial...</div>
          ) : filtrados.length === 0 ? (
            <div className="hist-empty">Sin registros encontrados</div>
          ) : paginados.map((p, i) => (
            <div key={p.id_portatil} className="hist-item">
              <div className="hist-dot" style={{background: estadoColor(p.estado), boxShadow: `0 0 8px ${estadoColor(p.estado)}`}} />
              <div className="hist-line" style={{opacity: i < filtrados.length - 1 ? 1 : 0}} />
              <div className="hist-card" onClick={() => setSeleccionado(p)}>
                <div className="hist-card-header">
                  <span className="hist-serial">{p.num_serie}</span>
                  <span className="hist-badge" style={{background:`${estadoColor(p.estado)}18`, border:`1px solid ${estadoColor(p.estado)}55`, color: estadoColor(p.estado)}}>
                    {p.estado}
                  </span>
                </div>
                <div className="hist-card-body">
                  <span>{p.marca} {p.modelo}</span>
                  <span className="hist-id">ID #{p.id_portatil}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)} />
      </main>
    </div>
  );
};

export default HistorialInstructor;



