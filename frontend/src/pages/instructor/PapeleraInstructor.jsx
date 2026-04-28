import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarInstructor from '../../components/SidebarInstructor';
import { IconBell, IconTrash, IconEye, IconPencil } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import '../../pages/instructor/PapeleraInstructor.css';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';

const PapeleraInstructor = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [portatiles, setPortatiles] = useState([]);
  const [fichasEliminadas, setFichasEliminadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [editData, setEditData] = useState({ marca:'', modelo:'', tipo:'', estado:'disponible' });
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const cargar = () => {
    fetch('/api/portatiles', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.status === 401 ? navigate('/login') : r.json())
      .then(d => {
        const lista = Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
        setPortatiles(lista.filter(p => p.estado === 'dañado' || p.estado === 'mantenimiento'));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/fichas/papelera', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setFichasEliminadas(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  const handleRestaurar = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/portatiles/${seleccionado.id_portatil}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: editData.estado }),
      });
      if (res.ok) { setSeleccionado(null); cargar(); }
      else { const d = await res.json(); setError(d.mensaje || 'Error'); }
    } catch { setError('Error al conectar'); }
  };

  const abrirEditar = (p) => { setSeleccionado(p); setEditData({ marca: p.marca, modelo: p.modelo, tipo: p.tipo || '', estado: 'disponible' }); setError(''); };

  const filtrados = portatiles.filter(p => {
    const b = filtro.toLowerCase();
    return (!b || p.num_serie?.toLowerCase().includes(b) || p.marca?.toLowerCase().includes(b) || p.modelo?.toLowerCase().includes(b))
      && (!filtroEstado || p.estado === filtroEstado);
  });
  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="equipment-layout">
      <SidebarInstructor />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Papelera</h1>
            <p className="equipment-subtitle">Equipos con fallas o en mantenimiento: <span>{portatiles.length}</span></p>
          </div>
          <NotificacionesBtn />
        </div>

        {portatiles.length === 0 && !loading && filtro === '' && filtroEstado === '' && (
          <div className="pap-empty">
            <div className="pap-empty-icon"><IconTrash size={48} /></div>
            <h3>Sin equipos en papelera</h3>
            <p>No hay equipos dañados o en mantenimiento actualmente.</p>
          </div>
        )}

        {loading && <div className="pap-loading">Cargando...</div>}

        {!loading && portatiles.length > 0 && (<>
          <div className="filters-row">
            <input className="filter-input" placeholder="Buscar por serie, marca o modelo..." value={filtro} onChange={e => { setFiltro(e.target.value); setPage(1); }} />
            <select className="filter-input" value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}>
              <option value="">Todos</option>
              <option value="dañado">Dañado</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
            <button className="filter-clear" onClick={() => { setFiltro(''); setFiltroEstado(''); setPage(1); }}>Limpiar</button>
          </div>
          <div className="pap-grid">
            {paginados.map(p => (
              <div key={p.id_portatil} className={`pap-card ${p.estado === 'dañado' || p.estado === 'dañado' ? 'pap-card-danger' : 'pap-card-warning'}`}>
                <div className="pap-card-top">
                  <div className="pap-card-icon">
                    <IconTrash size={20} />
                  </div>
                  <span className={`pap-status ${p.estado === 'dañado' || p.estado === 'dañado' ? 'pap-status-danger' : 'pap-status-warning'}`}>
                    {p.estado}
                  </span>
                </div>
                <div className="pap-card-serial">{p.num_serie}</div>
                <div className="pap-card-info">{p.marca} · {p.modelo}</div>
                <div className="pap-card-id">ID #{p.id_portatil}</div>
                <div className="pap-card-actions">
                  <button className="pap-btn-restore" onClick={() => abrirEditar(p)}>
                    <IconPencil size={14} /> Restaurar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)} />
        </>)}

        {seleccionado && (
          <div className="modal-overlay" onClick={() => setSeleccionado(null)}>
            <div className="modal-content rp-modal" onClick={e => e.stopPropagation()}>
              <div className="rp-modal-header">
                <div className="rp-modal-icon" style={{background:'rgba(74,222,128,0.12)',borderColor:'rgba(74,222,128,0.3)',color:'#4ade80'}}>
                  <IconPencil size={18} />
                </div>
                <div>
                  <h2 className="modal-title" style={{marginBottom:'2px'}}>Restaurar Equipo</h2>
                  <p style={{fontSize:'13px',color:'var(--text-2)'}}>Cambia el estado para restaurarlo</p>
                </div>
                <button className="rp-close-btn" onClick={() => setSeleccionado(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleRestaurar}>
                <div className="form-group"><label>Marca</label><input value={editData.marca} onChange={e => setEditData({...editData, marca: e.target.value})} required /></div>
                <div className="form-group"><label>Modelo</label><input value={editData.modelo} onChange={e => setEditData({...editData, modelo: e.target.value})} required /></div>
                <div className="form-group"><label>Tipo</label><input value={editData.tipo} onChange={e => setEditData({...editData, tipo: e.target.value})} required /></div>
                <div className="form-group"><label>Nuevo Estado</label>
                  <select value={editData.estado} onChange={e => setEditData({...editData, estado: e.target.value})}>
                    <option value="disponible">Disponible</option>
                    <option value="asignado">Asignado</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setSeleccionado(null)}>Cancelar</button>
                  <button type="submit" className="btn-save">Restaurar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FICHAS ELIMINADAS */}
        {fichasEliminadas.length > 0 && (
          <div style={{marginTop:'32px'}}>
            <div style={{fontSize:'13px',fontWeight:700,color:'#b8a8d8',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'14px'}}>
              Fichas eliminadas
            </div>
            <div className="table-container">
              <table className="equipment-table">
                <thead><tr><th>Nombre</th><th>Programa</th><th>Jornada</th><th>Fecha eliminacion</th></tr></thead>
                <tbody>
                  {fichasEliminadas.map(f => (
                    <tr key={f.id}>
                      <td style={{fontWeight:600}}>{f.nombre}</td>
                      <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{f.programa_formacion}</td>
                      <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{f.jornada}</td>
                      <td style={{color:'#f87171',fontSize:'13px'}}>{f.fecha_eliminacion?.split('T')[0] || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PapeleraInstructor;


