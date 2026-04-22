import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconBell, IconMonitor, IconBarChart } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import SidebarAprendiz from '../../components/SidebarAprendiz';
import '../../pages/aprendiz/EquiposAprendiz.css';

const EquiposAprendiz = () => {
  const navigate = useNavigate();
  const [portatiles, setPortatiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showVerModal, setShowVerModal] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtros, setFiltros] = useState({ buscar: '', estado: '', marca: '' });
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const cargar = async () => {
  try {
    setLoading(true);
    localStorage.removeItem('portatiles_local');
    const res = await fetch('/api/portatiles', { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 401) { navigate('/login'); return; }
    const data = await res.json();
    console.log('respuesta portatiles:', data);
    const lista = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    setPortatiles(lista);
  } catch { setError('Error al cargar los portatiles'); }
  finally { setLoading(false); }
};


  const abrirVer = (p) => { setSeleccionado(p); setShowVerModal(true); };
  const estadoColor = (e) => ({ disponible: '#4ade80', asignado: '#facc15', 'dañado': '#f87171', mantenimiento: '#fb923c' }[e] || '#c9a8ff');

  const filtrados = portatiles.filter(p => {
    const b = filtros.buscar.toLowerCase();
    return (!b || p.num_serie?.toLowerCase().includes(b) || p.marca?.toLowerCase().includes(b) || p.modelo?.toLowerCase().includes(b))
      && (!filtros.estado || p.estado === filtros.estado)
      && (!filtros.marca || p.marca?.toLowerCase().includes(filtros.marca.toLowerCase()));
  });

  return (
    <div className="equipment-layout">
      <SidebarAprendiz />
      <main className="equipment-main">
        <div className="equipment-header">
          <div><h1 className="equipment-title">Equipos</h1><p className="equipment-subtitle">Total: <span>{portatiles.length}</span></p></div>
          <NotificacionesBtn />
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{portatiles.length}</div></div>
          <div className="stat-card"><div className="stat-icon"><IconMonitor size={24} /></div><div className="stat-label">Disponibles</div><div className="stat-value">{portatiles.filter(p => p.estado === 'disponible').length}</div></div>
          <div className="stat-card"><div className="stat-icon"><IconBarChart size={24} /></div><div className="stat-label">Asignados</div><div className="stat-value">{portatiles.filter(p => p.estado === 'asignado').length}</div></div>
        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row">
          <input className="filter-input" placeholder="Buscar por serie, marca o modelo..." value={filtros.buscar} onChange={e => setFiltros({...filtros, buscar: e.target.value})} />
          <select className="filter-input" value={filtros.estado} onChange={e => setFiltros({...filtros, estado: e.target.value})}>
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="asignado">Asignado</option>
            <option value="dañado">Dañado</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
          <input className="filter-input" placeholder="Filtrar por marca..." value={filtros.marca} onChange={e => setFiltros({...filtros, marca: e.target.value})} />
          <button className="filter-clear" onClick={() => setFiltros({ buscar: '', estado: '', marca: '' })}>Limpiar</button>
        </div>

        <div className="table-container">
          <table className="equipment-table">
            <thead><tr><th>N. Serie</th><th>Marca</th><th>Modelo</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan="5" style={{textAlign:'center',padding:'32px'}}>Cargando...</td></tr>
                : filtrados.length === 0
                  ? <tr><td colSpan="5" style={{textAlign:'center',padding:'32px',color:'var(--text-muted-dark)'}}>Sin equipos asignados</td></tr>
                  : filtrados.map(p => (
                    <tr key={p.id_portatil}>
                      <td>{p.num_serie}</td><td>{p.marca}</td><td>{p.modelo}</td>
                      <td><span style={{color:estadoColor(p.estado),fontWeight:600,fontSize:'13px'}}>{p.estado}</span></td>
                      <td><div className="action-buttons">
                        <button className="action-btn view" onClick={() => abrirVer(p)}><IconEye size={16} /></button>
                      </div></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {showVerModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowVerModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Detalle del pórtatil</h2>
              <div className="detalle-grid">
                <div className="detalle-item"><span className="detalle-label">ID</span><span className="detalle-valor">#{seleccionado.id_portatil}</span></div>
                <div className="detalle-item"><span className="detalle-label">N. Serie</span><span className="detalle-valor">{seleccionado.num_serie}</span></div>
                <div className="detalle-item"><span className="detalle-label">Marca</span><span className="detalle-valor">{seleccionado.marca}</span></div>
                <div className="detalle-item"><span className="detalle-label">Modelo</span><span className="detalle-valor">{seleccionado.modelo}</span></div>
                <div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{color:estadoColor(seleccionado.estado),fontWeight:600}}>{seleccionado.estado}</span></div>
              </div>
              <div className="modal-actions"><button className="btn-save" onClick={() => setShowVerModal(false)}>Cerrar</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EquiposAprendiz;
