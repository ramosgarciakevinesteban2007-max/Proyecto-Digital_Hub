import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconPencil, IconTrash, IconBell, IconUser } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import ConfirmModal from '../../components/ConfirmModal';
import SidebarAdmin from '../../components/SidebarAdmin';
import '../../pages/admin/UsuariosAdmin.css';
import Pagination from '../../components/Pagination';
import '../../components/Pagination.css';

const LS_KEY = 'usuarios_local';
const getLocalU = () => { try { return JSON.parse(localStorage.getItem('usuarios_local')) || []; } catch { return []; } };
const saveLocalU = (data) => localStorage.setItem('usuarios_local', JSON.stringify(data));
const nextIdU = (list) => list.length ? Math.max(...list.map(u => u.id_usuario || 0)) + 1 : 1;

const normalizeEstado = (estado) => {
  if (!estado) return 'activo';
  const value = estado.toString().trim().toLowerCase();
  return value === 'activo' ? 'activo' : 'inhabilitado';
};

const displayEstado = (estado) => normalizeEstado(estado) === 'activo' ? 'Activo' : 'Inhabilitado';

const normalizeRole = (rol) => {
  if (!rol) return '';
  const value = rol.toString().trim().toLowerCase();
  if (value === 'administrador') return 'administrador';
  if (value === 'instructor') return 'instructor';
  return 'aprendiz';
};

const displayRole = (rol) => {
  const normalized = normalizeRole(rol);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const UsuariosAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const PER_PAGE = 10;

  // Estados para la lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  // Estados para modales de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', correo: '', password: '', rol: 'aprendiz', estado: 'activo' });
  const [editData, setEditData] = useState({ nombre: '', correo: '', rol: 'aprendiz', estado: 'activo' });
  const [seleccionado, setSeleccionado] = useState(null);

  // Estados para filtros
  const [filtro, setFiltro] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Estados para modal de ver detalle
  const [showVerModal, setShowVerModal] = useState(false);
  const [verUsuario, setVerUsuario] = useState(null);
  const [verDetalle, setVerDetalle] = useState({ ficha: null, dispositivo: null, fichas: [] });
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Estado para confirmación de eliminación
  const [confirmId, setConfirmId] = useState(null);

  const exportarExcel = async () => {
  try {
    const res = await fetch('/api/usuarios/excel', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) { const text = await res.text(); let m = 'Error al exportar'; try { m = JSON.parse(text).mensaje || m; } catch {} alert(m); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'usuarios.xlsx'; a.click();
    URL.revokeObjectURL(url);
  } catch (err) { alert('Error al exportar: ' + err.message); }
};

const importarExcel = async (e) => {
  const archivo = e.target.files[0]; if (!archivo) return;
  const formData = new FormData(); formData.append('archivo', archivo);
  try {
    const res = await fetch('/importacion/usuarios', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al importar');
    alert(data.mensaje || `${data.insertados} usuarios importados`);
    cargar();
  } catch (err) { alert(err.message); }
  e.target.value = '';
};

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/usuarios', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const local = getLocalU();
        const backendIds = data.map(u => u.id_usuario);
        const soloLocales = local.filter(u => !backendIds.includes(u.id_usuario));
        const merged = [...data, ...soloLocales];
        saveLocalU(merged); setUsuarios(merged);
      } else { setUsuarios(getLocalU()); }
    } catch { setUsuarios(getLocalU()); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) { setShowModal(false); setFormData({ nombre: '', correo: '', password: '', rol: 'aprendiz', estado: 'activo' }); cargar(); return; }
      const data = await res.json(); setError(data.mensaje || 'Error al crear');
    } catch {}
    // fallback localStorage
    const local = getLocalU();
    local.push({ ...formData, id_usuario: nextIdU(local) });
    saveLocalU(local); setUsuarios(local);
    setShowModal(false); setFormData({ nombre: '', correo: '', password: '', rol: 'aprendiz', estado: 'activo' });
  };

  const handleEditar = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await fetch(`/api/usuarios/${seleccionado.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData)
      });
      if (res.ok) { setShowEditModal(false); cargar(); return; }
    } catch {}
    // fallback localStorage
    const local = getLocalU().map(u => u.id_usuario === seleccionado.id_usuario ? { ...u, ...editData } : u);
    saveLocalU(local); setUsuarios([...local]); setShowEditModal(false);
  };

  const handleEliminar = async (id) => {
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setConfirmId(null); cargar(); return; }
    } catch {}
    const local = getLocalU().filter(u => u.id_usuario !== id);
    saveLocalU(local); setUsuarios(local); setConfirmId(null);
  };

  // Filtrado de usuarios
  const filtrados = usuarios.filter(u => {
    const b = filtro.toLowerCase();
    return (!b || u.nombre?.toLowerCase().includes(b) || u.correo?.toLowerCase().includes(b))
      && (!filtroRol || normalizeRole(u.rol) === filtroRol)
      && (!filtroEstado || normalizeEstado(u.estado) === filtroEstado);
  });

  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const rolColor = (r) => ({ administrador: '#c9a8ff', instructor: '#60a5fa', aprendiz: '#4ade80' }[normalizeRole(r)] || '#facc15');

  const abrirVer = async (u) => {
    setVerUsuario(u);
    setVerDetalle({ ficha: null, dispositivo: null, fichas: [] });
    setShowVerModal(true);
    setLoadingDetalle(true);
    const h = { Authorization: `Bearer ${token}` };
    try {
      if (normalizeRole(u.rol) === 'aprendiz') {
        const pRes = await fetch('/api/portatiles', { headers: h }).then(r => r.json()).catch(() => ({ data: [] }));
        const portatiles = Array.isArray(pRes) ? pRes : (pRes?.data || []);
        const dispositivo = portatiles.find(p => p.id_aprendiz === u.id_usuario) || null;
        setVerDetalle({ ficha: null, dispositivo, fichas: [] });
      } else if (normalizeRole(u.rol) === 'instructor') {
        const fRes = await fetch('/api/fichas', { headers: h }).then(r => r.json()).catch(() => []);
        const fichasArr = Array.isArray(fRes) ? fRes : [];
        const misFichas = fichasArr.filter(f => f.id_instructor === u.id_usuario);
        setVerDetalle({ ficha: null, dispositivo: null, fichas: misFichas });
      }
    } catch {}
    setLoadingDetalle(false);
  };

  return (
    <div className="equipment-layout">
      <SidebarAdmin />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Gestion de Usuarios</h1>
            <p className="equipment-subtitle">Total: <span>{usuarios.length}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={exportarExcel} style={{ background: '#039b5b', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Exportar
            </button>
            <input type="file" accept=".xlsx" style={{ display: 'none' }} id="import-usuarios" onChange={importarExcel} />
            <button onClick={() => document.getElementById('import-usuarios').click()} style={{ background: '#039b5b', border: 'none', borderRadius: '10px', padding: '9px 16px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Importar
            </button>
            <NotificacionesBtn />
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><IconUser size={20} /></div>
            <div className="stat-card-text"><div className="stat-value">{usuarios.length}</div><div className="stat-label">Total</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconUser size={20} /></div>
            <div className="stat-card-text"><div className="stat-value">{usuarios.filter(u => normalizeRole(u.rol) === 'administrador').length}</div><div className="stat-label">Admins</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconUser size={20} /></div>
            <div className="stat-card-text"><div className="stat-value">{usuarios.filter(u => normalizeRole(u.rol) === 'instructor').length}</div><div className="stat-label">Instructores</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconUser size={20} /></div>
            <div className="stat-card-text"><div className="stat-value">{usuarios.filter(u => normalizeRole(u.rol) === 'aprendiz').length}</div><div className="stat-label">Aprendices</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><IconUser size={20} /></div>
            <div className="stat-card-text"><div className="stat-value">{usuarios.filter(u => normalizeEstado(u.estado) === 'inhabilitado').length}</div><div className="stat-label">Inhabilitados</div></div>
          </div>
        </div>
        {error && <p className="table-error">{error}</p>}
        <div className="filters-row">
          <input className="filter-input" placeholder="Buscar por nombre o correo..." value={filtro} onChange={e => { setFiltro(e.target.value); setPage(1); }} />
          <select className="filter-input" value={filtroRol} onChange={e => { setFiltroRol(e.target.value); setPage(1); }}>
            <option value="">Todos los roles</option>
            <option value="administrador">Administrador</option>
            <option value="instructor">Instructor</option>
            <option value="aprendiz">Aprendiz</option>
          </select>
          <select className="filter-input" value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}>
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inhabilitado">Inhabilitado</option>
          </select>
          <button className="filter-clear" onClick={() => { setFiltro(''); setFiltroRol(''); setFiltroEstado(''); setPage(1); }}>Limpiar</button>
        </div>
        <div className="table-container">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Cargando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted-dark)' }}>Sin resultados</td></tr>
              ) : (
                paginados.map(u => (
                  <tr key={u.id_usuario}>
                    <td>{u.nombre}</td>
                    <td style={{ color: 'var(--text-muted-dark)', fontSize: '13px' }}>{u.correo}</td>
                    <td><span style={{ color: '#b8a8d8', fontWeight: 600, fontSize: '13px' }}>{displayRole(u.rol)}</span></td>
                    <td><span style={{ color: normalizeEstado(u.estado) === 'activo' ? '#4ade80' : '#f87171', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:normalizeEstado(u.estado) === 'activo' ? '#4ade80' : '#f87171'}} />{displayEstado(u.estado)}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" onClick={() => abrirVer(u)}><IconEye size={16} /></button>
                        <button className="action-btn edit" onClick={() => { setSeleccionado(u); setEditData({ nombre: u.nombre, correo: u.correo, rol: normalizeRole(u.rol), estado: normalizeEstado(u.estado) }); setShowEditModal(true); }}><IconPencil size={16} /></button>
                        <button className="action-btn delete" onClick={() => setConfirmId(u.id_usuario)}><IconTrash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button className="btn-add-equipment" onClick={() => { setError(''); setShowModal(true); }}>Añadir Usuario</button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Nuevo Usuario</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input type="email" value={formData.correo} onChange={e => setFormData({ ...formData, correo: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })}>
                    <option value="aprendiz">Aprendiz</option>
                    <option value="instructor">Instructor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })}>
                    <option value="activo">Activo</option>
                    <option value="inhabilitado">Inhabilitado</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Editar Usuario</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleEditar}>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={editData.nombre} onChange={e => setEditData({ ...editData, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Correo</label>
                  <input type="email" value={editData.correo} onChange={e => setEditData({ ...editData, correo: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select value={editData.rol} onChange={e => setEditData({ ...editData, rol: e.target.value })}>
                    <option value="aprendiz">Aprendiz</option>
                    <option value="instructor">Instructor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select value={editData.estado} onChange={e => setEditData({ ...editData, estado: e.target.value })}>
                    <option value="activo">Activo</option>
                    <option value="inhabilitado">Inhabilitado</option>
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
        {confirmId && <ConfirmModal mensaje="Esta acción no se puede deshacer." onConfirm={() => handleEliminar(confirmId)} onCancel={() => setConfirmId(null)} />}

        {showVerModal && verUsuario && (
          <div className="modal-overlay" onClick={() => setShowVerModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxHeight:'90vh',overflowY:'auto'}}>
              <h2 className="modal-title">Perfil de usuario</h2>
              <div className="detalle-grid">
                <div className="detalle-item"><span className="detalle-label">Nombre</span><span className="detalle-valor">{verUsuario.nombre}</span></div>
                <div className="detalle-item"><span className="detalle-label">Correo</span><span className="detalle-valor" style={{fontSize:'13px'}}>{verUsuario.correo}</span></div>
                <div className="detalle-item"><span className="detalle-label">Rol</span><span className="detalle-valor" style={{color:'#b8a8d8',fontWeight:700}}>{verUsuario.rol}</span></div>
                <div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{color:normalizeEstado(verUsuario.estado)==='activo'?'#4ade80':'#f87171',fontWeight:700}}>{displayEstado(verUsuario.estado)}</span></div>
              </div>

              {loadingDetalle && <div style={{textAlign:'center',padding:'20px',color:'#b8a8d8',fontSize:'13px'}}>Cargando información...</div>}

              {!loadingDetalle && verUsuario.rol === 'Aprendiz' && (
                <div style={{marginTop:'20px'}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:'#b8a8d8',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'10px'}}>Dispositivo asignado</div>
                  {verDetalle.dispositivo ? (
                    <div style={{background:'rgba(127,90,240,0.08)',border:'1px solid rgba(127,90,240,0.25)',borderRadius:'12px',padding:'14px 16px'}}>
                      <div style={{fontWeight:700,color:'#f0eaff'}}>{verDetalle.dispositivo.marca} {verDetalle.dispositivo.modelo}</div>
                      <div style={{fontSize:'12px',color:'#b8a8d8',fontFamily:'monospace',marginTop:'4px'}}>{verDetalle.dispositivo.num_serie}</div>
                      <div style={{fontSize:'11px',color:'#facc15',marginTop:'4px',fontWeight:600}}>{verDetalle.dispositivo.estado}</div>
                    </div>
                  ) : (
                    <div style={{color:'#b8a8d8',fontSize:'13px'}}>Sin dispositivo asignado</div>
                  )}
                </div>
              )}

              {!loadingDetalle && verUsuario.rol === 'Instructor' && (
                <div style={{marginTop:'20px'}}>
                  <div style={{fontSize:'12px',fontWeight:700,color:'#b8a8d8',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'10px'}}>Fichas creadas ({verDetalle.fichas.length})</div>
                  {verDetalle.fichas.length === 0 ? (
                    <div style={{color:'#b8a8d8',fontSize:'13px'}}>Sin fichas creadas</div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                      {verDetalle.fichas.map(f => (
                        <div key={f.id} style={{background:'rgba(127,90,240,0.08)',border:'1px solid rgba(127,90,240,0.25)',borderRadius:'12px',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <div>
                            <div style={{fontWeight:700,color:'#f0eaff',fontSize:'14px'}}>{f.nombre}</div>
                            <div style={{fontSize:'12px',color:'#b8a8d8'}}>{f.programa_formacion} · {f.jornada}</div>
                          </div>
                          <span style={{fontSize:'11px',fontWeight:700,color:f.estado==='activa'?'#4ade80':'#f87171'}}>{f.estado}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions" style={{marginTop:'20px'}}>
                <button className="btn-save" onClick={() => setShowVerModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsuariosAdmin;
