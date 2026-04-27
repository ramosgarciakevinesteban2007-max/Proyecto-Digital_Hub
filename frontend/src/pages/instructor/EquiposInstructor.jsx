import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { IconEye, IconPencil, IconTrash, IconBell, IconMonitor, IconBarChart } from "../../components/Icons";

import SidebarInstructor from "../../components/SidebarInstructor";

import NotificacionesBtn from "../../components/NotificacionesBtn";

import "../../pages/instructor/EquiposInstructor.css";

import Pagination from "../../components/Pagination";

import "../../components/Pagination.css";

import ConfirmModal from "../../components/ConfirmModal";

const EquiposInstructor = () => {

  const navigate = useNavigate();

  const [portatiles, setPortatiles] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [showVerModal, setShowVerModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showAsignarModal, setShowAsignarModal] = useState(false);

  const [seleccionado, setSeleccionado] = useState(null);

  const [formData, setFormData] = useState({ num_serie: "", marca: "", tipo: "", modelo: "", estado: "disponible", ubicacion: "", descripcion: "" });

  const [editData, setEditData] = useState({ marca: "", tipo: "", modelo: "", estado: "disponible", ubicacion: "", descripcion: "" });

  const [asignarData, setAsignarData] = useState({ correo: "", id_portatil: null });

  const [asignarError, setAsignarError] = useState("");

  const [asignarMsg, setAsignarMsg] = useState("");

  const [filtros, setFiltros] = useState({ buscar: "", estado: "", marca: "" });

  const [page, setPage] = useState(1);

  const PER_PAGE = 10;

  const token = localStorage.getItem("token");

useEffect(() => {

    if (!token) { navigate("/login"); return; }

    cargar();

  }, []);

const cargar = async () => {

    try {

      setLoading(true);

      const res = await fetch("/api/portatiles?limit=500", { headers: { Authorization: `Bearer ${token}` } });

      if (res.status === 401) { navigate("/login"); return; }

      const data = await res.json();

      const lista = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

      setPortatiles(lista);

    } catch { setPortatiles([]); }

    finally { setLoading(false); }

  };

const handleSubmit = async (e) => {

    e.preventDefault(); setError("");

    try {

      const res = await fetch("/api/portatiles", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });

      if (res.ok) { setShowModal(false); setFormData({ num_serie: "", marca: "", tipo: "", modelo: "", estado: "disponible", ubicacion: "", descripcion: "" }); setFiltros({ buscar: "", estado: "", marca: "" }); setPage(1); cargar(); return; }

      const d = await res.json(); setError(d.mensaje || "Error al guardar");

    } catch { setError("Error de conexion"); }

  };

const handleEditar = async (e) => {

    e.preventDefault(); setError("");

    try {

      const res = await fetch(`/api/portatiles/${seleccionado.id_portatil}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(editData) });

      if (res.ok) { setShowEditModal(false); cargar(); return; }

      const d = await res.json(); setError(d.mensaje || "Error al editar");

    } catch { setError("Error de conexion"); }

  };

const [confirmId, setConfirmId] = useState(null);

const handleEliminar = async (id) => {

    try {

      const res = await fetch(`/api/portatiles/${id}/estado`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },

        body: JSON.stringify({ estado: "dañado" })

      });

      if (res.ok) { setConfirmId(null); cargar(); }

    } catch {}

    setConfirmId(null);

  };

const handleAsignar = async (e) => {

    e.preventDefault(); setAsignarError("");

    try {

      const res = await fetch(`/api/portatiles/${asignarData.id_portatil}/asignar`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ correo_aprendiz: asignarData.correo }) });

      const data = await res.json();

      if (res.ok) {

        setShowAsignarModal(false);

        setAsignarMsg(`Equipo asignado a ${data.aprendiz.nombre}`);

        setPortatiles(prev => prev.map(p => p.id_portatil === asignarData.id_portatil ? { ...p, estado: 'asignado' } : p));

        setTimeout(() => setAsignarMsg(""), 4000);

        cargar();

      }

      else { setAsignarError(data.mensaje || "Error al asignar"); }

    } catch { setAsignarError("Error de conexion"); }

  };

const abrirVer = (p) => { setSeleccionado(p); setShowVerModal(true); };

  const abrirEditar = (p) => { setSeleccionado(p); setEditData({ marca: p.marca, tipo: p.tipo || "", modelo: p.modelo, estado: p.estado, ubicacion: p.ubicacion || "", descripcion: p.descripcion || "" }); setShowEditModal(true); };

  const abrirAsignar = (p) => { setAsignarData({ correo: "", id_portatil: p.id_portatil }); setAsignarError(""); setShowAsignarModal(true); };

  const estadoColor = (e) => {
    const estado = (e || '').toLowerCase();
    return { disponible: "#4ade80", asignado: "#facc15", 'dañado': "#f87171", mantenimiento: "#fb923c" }[estado] || "#c9a8ff";
  };

const filtrados = portatiles.filter(p => {

    const b = filtros.buscar.toLowerCase();
    return (!b || p.num_serie?.toLowerCase().includes(b) || p.marca?.toLowerCase().includes(b) || p.modelo?.toLowerCase().includes(b))
      && (!filtros.estado || p.estado?.toLowerCase() === filtros.estado.toLowerCase())
      && (!filtros.marca || p.marca?.toLowerCase().includes(filtros.marca.toLowerCase()));

  });

  const paginados = filtrados.slice((page - 1) * PER_PAGE, page * PER_PAGE);

return (

    <div className="equipment-layout">

      <SidebarInstructor />

      <main className="equipment-main">

        <div className="equipment-header">

          <div><h1 className="equipment-title">Gestión de equipos</h1><p className="equipment-subtitle">Total: <span>{portatiles.length}</span></p></div>

          <NotificacionesBtn />

        </div>

        <div className="stats-grid">

          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{portatiles.length}</div></div>

          <div className="stat-card"><div className="stat-icon"><IconMonitor size={24} /></div><div className="stat-label">Disponibles</div><div className="stat-value">{portatiles.filter(p => p.estado?.toLowerCase() === "disponible").length}</div></div>
          <div className="stat-card"><div className="stat-icon"><IconBarChart size={24} /></div><div className="stat-label">Asignados</div><div className="stat-value">{portatiles.filter(p => p.estado?.toLowerCase() === "asignado").length}</div></div>

        </div>

        {asignarMsg && <div style={{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.3)",borderRadius:"10px",padding:"12px 18px",marginBottom:"16px",color:"#4ade80",fontSize:"14px"}}>{asignarMsg}</div>}

        {error && <p className="table-error">{error}</p>}

        <div className="filters-row">

          <input className="filter-input" placeholder="Buscar..." value={filtros.buscar} onChange={e => setFiltros({...filtros, buscar: e.target.value})} />

          <select className="filter-input" value={filtros.estado} onChange={e => { setFiltros({...filtros, estado: e.target.value}); setPage(1); }}>

            <option value="">Todos los estados</option><option value="disponible">Disponible</option><option value="asignado">Asignado</option><option value="dañado">Dañado</option><option value="mantenimiento">Mantenimiento</option>

          </select>

          <input className="filter-input" placeholder="Filtrar por marca..." value={filtros.marca} onChange={e => { setFiltros({...filtros, marca: e.target.value}); setPage(1); }} />

          <button className="filter-clear" onClick={() => { setFiltros({ buscar: "", estado: "", marca: "" }); setPage(1); }}>Limpiar</button>

        </div>

        <div className="table-container">

          <table className="equipment-table">

            <thead><tr><th>N Serie</th><th>Marca</th><th>Modelo</th><th>Ubicación</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>

            <tbody>

              {loading ? <tr><td colSpan="7" style={{textAlign:"center",padding:"32px"}}>Cargando...</td></tr>

              : filtrados.length === 0 ? <tr><td colSpan="7" style={{textAlign:"center",padding:"32px",color:"var(--text-muted-dark)"}}>Sin resultados</td></tr>

              : paginados.map(p => (

                <tr key={p.id_portatil}>

                  <td>{p.num_serie}</td><td>{p.marca}</td><td>{p.modelo}</td>
                  <td style={{color:'var(--text-muted-dark)',fontSize:'13px'}}>{p.ubicacion || '—'}</td>
                  <td style={{color:'var(--text-muted-dark)',fontSize:'13px',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={p.descripcion}>{p.descripcion || '—'}</td>
                  <td><span style={{color:estadoColor(p.estado),fontWeight:600,fontSize:"13px",display:'inline-flex',alignItems:'center',gap:'5px'}}><span style={{width:'6px',height:'6px',borderRadius:'50%',background:estadoColor(p.estado)}} />{p.estado}</span></td>

                  <td><div className="action-buttons">

                    <button className="action-btn view" onClick={() => abrirVer(p)}><IconEye size={16} /></button>

                    <button className="action-btn edit" onClick={() => abrirEditar(p)}><IconPencil size={16} /></button>

                    <button className="action-btn delete" onClick={() => setConfirmId(p.id_portatil)}><IconTrash size={16} /></button>

                    {p.estado !== "dañado" && p.estado !== "mantenimiento" && (

                      <button className="action-btn" title={p.estado === "asignado" ? "Asignar a otro aprendiz" : "Asignar"} style={{background:"rgba(74,222,128,0.15)",color:"#4ade80",border:"1px solid rgba(74,222,128,0.3)"}} onClick={() => abrirAsignar(p)}>

                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>

                      </button>

                    )}

                  </div></td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <Pagination page={page} total={filtrados.length} perPage={PER_PAGE} onChange={p => setPage(p)} />

        {confirmId && <ConfirmModal mensaje="Esta acción no se puede deshacer." onConfirm={() => handleEliminar(confirmId)} onCancel={() => setConfirmId(null)} />}

        <button className="btn-add-equipment" onClick={() => { setError(""); setShowModal(true); }}>Añadir Portatil</button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'560px'}}>
              <h2 className="modal-title">Añadir portátil</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div className="form-group"><label>Número de serie</label><input type="text" value={formData.num_serie} onChange={e => setFormData({...formData, num_serie: e.target.value})} required /></div>
                  <div className="form-group"><label>Marca</label><input type="text" value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})} required /></div>
                  <div className="form-group"><label>Tipo</label><input type="text" placeholder="ej: laptop, tablet..." value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} required /></div>
                  <div className="form-group"><label>Modelo</label><input type="text" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} required /></div>
                  <div className="form-group"><label>Estado</label>
                    <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})}>
                      <option value="disponible">Disponible</option>
                      <option value="asignado">Asignado</option>
                      <option value="dañado">Dañado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Ubicación</label><input type="text" placeholder="ej: Sala 3, Bloque B..." value={formData.ubicacion} onChange={e => setFormData({...formData, ubicacion: e.target.value})} /></div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}><label>Descripción</label><textarea rows="2" placeholder="Observaciones del equipo..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} style={{resize:'vertical'}} /></div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showVerModal && seleccionado && (<div className="modal-overlay" onClick={() => setShowVerModal(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><h2 className="modal-title">Detalle del portatil</h2><div className="detalle-grid"><div className="detalle-item"><span className="detalle-label">N Serie</span><span className="detalle-valor">{seleccionado.num_serie}</span></div><div className="detalle-item"><span className="detalle-label">Marca</span><span className="detalle-valor">{seleccionado.marca}</span></div><div className="detalle-item"><span className="detalle-label">Tipo</span><span className="detalle-valor">{seleccionado.tipo}</span></div><div className="detalle-item"><span className="detalle-label">Modelo</span><span className="detalle-valor">{seleccionado.modelo}</span></div><div className="detalle-item"><span className="detalle-label">Estado</span><span className="detalle-valor" style={{color:estadoColor(seleccionado.estado),fontWeight:600}}>{seleccionado.estado}</span></div><div className="detalle-item"><span className="detalle-label">Ubicación</span><span className="detalle-valor">{seleccionado.ubicacion || '—'}</span></div><div className="detalle-item" style={{gridColumn:'1/-1'}}><span className="detalle-label">Descripción</span><span className="detalle-valor" style={{whiteSpace:'pre-wrap'}}>{seleccionado.descripcion || '—'}</span></div></div><div className="modal-actions"><button className="btn-save" onClick={() => setShowVerModal(false)}>Cerrar</button></div></div></div>)}

        {showEditModal && seleccionado && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'560px'}}>
              <h2 className="modal-title">Editar portátil — {seleccionado.num_serie}</h2>
              {error && <p className="table-error">{error}</p>}
              <form onSubmit={handleEditar}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div className="form-group"><label>Marca</label><input type="text" value={editData.marca} onChange={e => setEditData({...editData, marca: e.target.value})} required /></div>
                  <div className="form-group"><label>Tipo</label><input type="text" value={editData.tipo} onChange={e => setEditData({...editData, tipo: e.target.value})} required /></div>
                  <div className="form-group"><label>Modelo</label><input type="text" value={editData.modelo} onChange={e => setEditData({...editData, modelo: e.target.value})} required /></div>
                  <div className="form-group"><label>Estado</label>
                    <select value={editData.estado} onChange={e => setEditData({...editData, estado: e.target.value})}>
                      <option value="disponible">Disponible</option>
                      <option value="asignado">Asignado</option>
                      <option value="dañado">Dañado</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}><label>Ubicación</label><input type="text" placeholder="ej: Sala 3, Bloque B..." value={editData.ubicacion} onChange={e => setEditData({...editData, ubicacion: e.target.value})} /></div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}><label>Descripción</label><textarea rows="2" value={editData.descripcion} onChange={e => setEditData({...editData, descripcion: e.target.value})} style={{resize:'vertical'}} /></div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-save">Guardar cambios</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAsignarModal && (<div className="modal-overlay" onClick={() => setShowAsignarModal(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><h2 className="modal-title">Asignar equipo a aprendiz</h2><p style={{fontSize:"13px",color:"var(--text-muted-dark)",marginBottom:"16px"}}>Ingresa el correo del aprendiz. Se le notificar¡ por email.</p>{asignarError && <p className="table-error">{asignarError}</p>}<form onSubmit={handleAsignar}><div className="form-group"><label>Correo del aprendiz</label><input type="email" placeholder="correo@ejemplo.com" value={asignarData.correo} onChange={e => setAsignarData({...asignarData, correo: e.target.value})} required /></div><div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setShowAsignarModal(false)}>Cancelar</button><button type="submit" className="btn-save">Asignar y notificar</button></div></form></div></div>)}

      </main>

    </div>

  );

};

export default EquiposInstructor;

