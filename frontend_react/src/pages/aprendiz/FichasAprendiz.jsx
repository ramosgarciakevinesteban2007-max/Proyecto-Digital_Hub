import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconBell } from '../../components/Icons';
import SidebarAprendiz from '../../components/SidebarAprendiz';
import ChatFicha from '../../components/ChatFicha';
import '../../pages/aprendiz/FichasAprendiz.css';

const FichasAprendiz = () => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
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
    } catch { setError('Error al cargar fichas'); }
    finally { setLoading(false); }
  };

  const estadoColor = (e) => ({ activa: '#4ade80', inactiva: '#f87171', cerrada: '#facc15' }[e] || '#c9a8ff');
  const getFichaDisplay = (f) => f?.nombre ?? f?.id_ficha ?? f?.id ?? '---';
  const getFichaRouteId = (f) => f?.id ?? f?.id_ficha ?? '---';
  const filtrados = fichas.filter(f => {
    const b = filtro.toLowerCase();
    const fichaId = getFichaDisplay(f);
    return (!b || fichaId?.toString().includes(b) || f.nombre?.toLowerCase().includes(b) || f.programa_formacion?.toLowerCase().includes(b))
      && (!filtroEstado || f.estado === filtroEstado);
  });

  return (
    <div className="equipment-layout">
      <SidebarAprendiz />
      <main className="equipment-main">
        <div className="equipment-header">
          <div><h1 className="equipment-title">Mi Ficha</h1><p className="equipment-subtitle">Ficha asignada por tu instructor</p></div>
          <button className="notification-btn"><IconBell size={20} /></button>
        </div>

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row">
          <input className="filter-input" placeholder="Buscar por ficha, nombre o programa..." value={filtro} onChange={e => setFiltro(e.target.value)} />
          <select className="filter-input" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
            <option value="cerrada">Cerrada</option>
          </select>
          <button className="filter-clear" onClick={() => { setFiltro(''); setFiltroEstado(''); }}>Limpiar</button>
        </div>

        <div className="table-container">
          <table className="equipment-table">
            <thead><tr><th>Ficha</th><th>Programa</th><th>Jornada</th><th>Cupo</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan="6" style={{textAlign:'center',padding:'32px'}}>Cargando...</td></tr>
                : fichas.length === 0
                  ? <tr><td colSpan="6" style={{textAlign:'center',padding:'32px',color:'var(--text-muted-dark)'}}>No tienes ninguna ficha asignada</td></tr>
                  : filtrados.map(f => (
                    <tr key={f.id ?? f.id_ficha}>
                      <td>#{getFichaDisplay(f)}</td>
                      <td style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.programa_formacion}</td>
                      <td>{f.jornada}</td>
                      <td>{f.cupo_maximo}</td>
                      <td><span style={{color:estadoColor(f.estado),fontWeight:600,fontSize:'13px'}}>{f.estado}</span></td>
                      <td><div className="action-buttons">
                        <button className="action-btn view" onClick={() => setSeleccionado(f)}><IconEye size={16} /></button>
                      </div></td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {seleccionado && (
          <div className="modal-overlay" onClick={() => setSeleccionado(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Detalle de Ficha</h2>
              <div className="ficha-chat-wrapper">
                <div className="detalle-grid">
                  <div className="detalle-item"><span className="detalle-label">Ficha</span><span className="detalle-valor">#{getFichaDisplay(seleccionado)}</span></div>
                  <div className="detalle-item"><span className="detalle-label">Programa</span><span className="detalle-valor">{seleccionado.programa_formacion}</span></div>
                  <div className="detalle-item"><span className="detalle-label">Jornada</span><span className="detalle-valor">{seleccionado.jornada}</span></div>
                  <div className="detalle-item"><span className="detalle-label">Cupo</span><span className="detalle-valor">{seleccionado.cupo_maximo}</span></div>
                  <div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{color:estadoColor(seleccionado.estado),fontWeight:600}}>{seleccionado.estado}</span></div>
                </div>
                <div className="ficha-chat-panel">
                  <div className="ficha-chat-panel-header">
                    <div className="ficha-chat-panel-title">Chat de la ficha</div>
                    <div className="ficha-chat-panel-subtitle">#{getFichaDisplay(seleccionado)}</div>
                  </div>
                  <ChatFicha idFicha={getFichaRouteId(seleccionado)} token={token} />
                </div>
              </div>
              <div className="modal-actions"><button className="btn-save" onClick={() => setSeleccionado(null)}>Cerrar</button></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FichasAprendiz;
