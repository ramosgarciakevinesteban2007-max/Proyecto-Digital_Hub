import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAprendiz from '../../components/SidebarAprendiz';
import { IconMonitor, IconReport, IconBell, IconUser, IconCheck, IconClock, IconLaptop, IconAlertTriangle, IconBookOpen, IconUserCheck } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import '../Inicio.css';
import './InicioAprendiz.css';

const getFichaId = (f) => f?.id ?? f?.id_ficha ?? '---';

const getFichaDisplay = (f) => f?.nombre ?? f?.id_ficha ?? f?.id ?? '---';

const InicioAprendiz = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nombre = localStorage.getItem('nombre') || 'Aprendiz';
  const [ficha, setFicha] = useState(null);
  const [dispositivo, setDispositivo] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const cargar = () => {
      const h = { Authorization: `Bearer ${token}` };
      Promise.all([
        fetch('/api/fichas/mia',  { headers: h }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/portatiles?limit=500',  { headers: h }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/reportes',    { headers: h }).then(r => r.json()).catch(() => []),
      ]).then(([f, portatilesRes, reps]) => {
        setFicha(f);
        const lista = Array.isArray(portatilesRes) ? portatilesRes : (Array.isArray(portatilesRes?.data) ? portatilesRes.data : []);
        const asignados = lista.filter(p => p.estado === 'asignado');
        setDispositivo(asignados[0] || null);
        setReportes(Array.isArray(reps) ? reps : []);
      }).finally(() => setLoading(false));
    };
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const pendientes = reportes.filter(r => r.estado_reporte === 'pendiente').length;
  const resueltos  = reportes.filter(r => r.estado_reporte === 'resuelto').length;

  return (
    <div className="inicio-layout">
      <SidebarAprendiz />
      <main className="inicio-main aprendiz-main">

        <div className="inicio-header">
          <div>
            <div className="aprendiz-badge"><span className="aprendiz-badge-dot" />Sesión activa</div>
            <h1 className="inicio-title aprendiz-title">Hola, {nombre}</h1>
            <p className="aprendiz-subtitle">Bienvenido a tu panel de aprendiz.</p>
          </div>
          <NotificacionesBtn />
        </div>

        <div className="aprendiz-hero">
          <div className="aprendiz-hero-content">
            <span className="aprendiz-hero-tag">Panel de Aprendiz</span>
            <h2 className="aprendiz-hero-title">Tu espacio<br />de gestión</h2>
            <p className="aprendiz-hero-desc">Consulta tu dispositivo asignado, reporta incidencias y revisa el estado de tus solicitudes.</p>
            <div className="aprendiz-hero-btns">
              <button className="aprendiz-btn-primary" onClick={() => navigate('/aprendiz/dispositivo')}>Mi Dispositivo</button>
              <button className="aprendiz-btn-outline" onClick={() => navigate('/aprendiz/historial')}>Mis Reportes</button>
            </div>
          </div>
          <div className="aprendiz-hero-orbs">
            <div className="aprendiz-orb aprendiz-orb-1" />
            <div className="aprendiz-orb aprendiz-orb-2" />
            <div className="aprendiz-orb aprendiz-orb-3" />
          </div>
        </div>

        {/* STATS */}
        <div className="inicio-stats-grid">
          <div className="inicio-card aprendiz-stat-card" style={{cursor:'pointer'}} onClick={() => navigate('/aprendiz/dispositivo')}>
            <div className="aprendiz-stat-icon" style={{background:'rgba(127,90,240,0.15)',color:'#c9a8ff'}}>
              <IconLaptop size={20} />
            </div>
            <div className="inicio-card-body">
              <div className="inicio-card-title">Mi Dispositivo</div>
              <ul className="inicio-card-list">
                {dispositivo ? (
                  <><li>{dispositivo.marca} {dispositivo.modelo}</li><li style={{fontFamily:'monospace',fontSize:'11px'}}>{dispositivo.num_serie}</li></>
                ) : (
                  <li>Sin dispositivo asignado</li>
                )}
              </ul>
            </div>
            <div className="inicio-card-value aprendiz-val-purple">{dispositivo ? 1 : 0}</div>
          </div>

          <div className="inicio-card aprendiz-stat-card" style={{cursor:'pointer'}} onClick={() => navigate('/aprendiz/historial')}>
            <div className="aprendiz-stat-icon" style={{background:'rgba(250,204,21,0.12)',color:'#facc15'}}>
              <IconAlertTriangle size={20} />
            </div>
            <div className="inicio-card-body">
              <div className="inicio-card-title">Reportes Pendientes</div>
              <ul className="inicio-card-list">
                <li>Total enviados: {reportes.length}</li>
                <li>Resueltos: {resueltos}</li>
              </ul>
            </div>
            <div className="inicio-card-value aprendiz-val-yellow">{pendientes}</div>
          </div>

          <div className="inicio-card aprendiz-stat-card">
            <div className="aprendiz-stat-icon" style={{background:'rgba(74,222,128,0.12)',color:'#4ade80'}}>
              <IconBookOpen size={20} />
            </div>
            <div className="inicio-card-body">
              <div className="inicio-card-title">Mi Ficha</div>
              <ul className="inicio-card-list">
                {ficha ? (
                  <><li>Ficha #{getFichaDisplay(ficha)}</li><li>{ficha.jornada}</li></>
                ) : (
                  <li>Sin ficha asignada</li>
                )}
              </ul>
            </div>
            <div className="inicio-card-value aprendiz-val-green">{ficha ? 1 : 0}</div>
          </div>
        </div>

        {/* ULTIMOS REPORTES */}
        <div className="inicio-bottom-grid">
          <div className="inicio-card-wide">
            <div className="inicio-card-title" style={{marginBottom:'14px'}}>Últimos reportes</div>
            {reportes.length === 0 ? (
              <div style={{color:'#b8a8d8',fontSize:'13px',display:'flex',alignItems:'center',gap:'8px'}}>
                <IconCheck size={14} style={{color:'#4ade80'}}/> No tienes reportes aún
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {reportes.slice(0,4).map(r => (
                  <div key={r.id_reporte} className="aprendiz-reporte-item">
                    <span className="aprendiz-reporte-desc">{r.descripcion}</span>
                    <span style={{fontSize:'11px',fontWeight:700,color: r.estado_reporte==='resuelto'?'#4ade80':r.estado_reporte==='en_revision'?'#fb923c':'#facc15',flexShrink:0}}>{r.estado_reporte}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="aprendiz-btn-outline" style={{marginTop:'16px',fontSize:'12px',padding:'8px 16px'}} onClick={() => navigate('/aprendiz/historial')}>
              Ver todos
            </button>
          </div>

          <div className="inicio-card-narrow aprendiz-profile-card">
            <div className="aprendiz-stat-icon" style={{background:'rgba(44,185,176,0.12)',color:'#2cb9b0'}}>
              <IconUserCheck size={20} />
            </div>
            <div className="inicio-card-title">Mi Perfil</div>
            <ul className="inicio-card-list">
              <li>{nombre}</li>
              <li>Rol: Aprendiz</li>
              <li>Sesión activa</li>
            </ul>
            <button className="aprendiz-btn-outline" style={{marginTop:'auto',width:'100%'}} onClick={() => navigate('/aprendiz/ajustes')}>
              Ir a Ajustes
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default InicioAprendiz;
