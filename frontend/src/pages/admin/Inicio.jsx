import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import { IconUser, IconMonitor, IconReport, IconBell, IconCheck, IconClock, IconUsers, IconLaptop, IconAlertTriangle } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import './InicioAdmin.css';
import apiFetch from '../../utils/apiFetch';

const Inicio = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const nombre = localStorage.getItem('nombre') || 'Administrador';
  const [stats, setStats] = useState({ portatiles: 0, fichas: 0, reportes: 0, disponibles: 0, usuarios: 0, pendientes: 0 });
  const [ultimosReportes, setUltimosReportes] = useState([]);
  const [todosReportes, setTodosReportes] = useState([]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const cargar = () => {
      const headers = { Authorization: `Bearer ${token}` };
      Promise.all([
        fetch('/api/portatiles?limit=500', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/fichas',               { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/reportes',             { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/usuarios',             { headers }).then(r => r.json()).catch(() => []),
      ]).then(([portatilesRes, fichas, reportes, usuarios]) => {
        const pArr = Array.isArray(portatilesRes) ? portatilesRes : (Array.isArray(portatilesRes?.data) ? portatilesRes.data : []);
        const rArr = Array.isArray(reportes) ? reportes : [];
        setStats({
          portatiles:  pArr.length,
          fichas:      Array.isArray(fichas)   ? fichas.length   : 0,
          reportes:    rArr.length,
          disponibles: pArr.filter(p => p.estado === 'disponible').length,
          usuarios:    Array.isArray(usuarios) ? usuarios.length : 0,
          pendientes:  rArr.filter(r => r.estado_reporte === 'pendiente').length,
        });
        setUltimosReportes(rArr.filter(r => r.estado_reporte === 'pendiente').slice(0, 5));
        setTodosReportes(rArr);
      });
    };
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const estadoColor = (e) => ({ pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80' }[e] || '#c9a8ff');

  return (
    <div className="inicio-layout">
      <SidebarAdmin />
      <main className="inicio-main admin-main">

        <div className="inicio-header">
          <div>
            <div className="admin-badge"><span className="admin-badge-dot" />Panel Activo</div>
            <h1 className="inicio-title admin-title">Bienvenido, {nombre}</h1>
          </div>
          <NotificacionesBtn />
        </div>

        <div className="admin-hero">
          <div className="admin-hero-content">
            <span className="admin-hero-tag">Administrador</span>
            <h2 className="admin-hero-title">Control total<br />del sistema</h2>
            <p className="admin-hero-desc">Gestiona equipos, usuarios, fichas y reportes desde un solo panel.</p>
            <div className="admin-hero-btns">
              <button className="admin-btn-primary" onClick={() => navigate('/admin/equipos')}>Ver Equipos</button>
              <button className="admin-btn-outline" onClick={() => navigate('/admin/usuarios')}>Ver Usuarios</button>
            </div>
          </div>
          <div className="admin-hero-orbs">
            <div className="admin-orb admin-orb-1" />
            <div className="admin-orb admin-orb-2" />
            <div className="admin-orb admin-orb-3" />
          </div>
        </div>

        <div className="inicio-stats-grid">
          <div className="inicio-card" style={{cursor:'pointer'}} onClick={() => navigate('/admin/usuarios')}>
            <div className="admin-stat-icon" style={{background:'rgba(96,165,250,0.12)',color:'#60a5fa'}}>
              <IconUsers size={20} />
            </div>
            <div className="inicio-card-title">Usuarios</div>
            <ul className="inicio-card-list"><li>Registrados en el sistema</li></ul>
            <div className="inicio-card-value" style={{color:'#60a5fa'}}>{stats.usuarios}</div>
          </div>
          <div className="inicio-card" style={{cursor:'pointer'}} onClick={() => navigate('/admin/equipos')}>
            <div className="admin-stat-icon" style={{background:'rgba(127,90,240,0.15)',color:'#c9a8ff'}}>
              <IconLaptop size={20} />
            </div>
            <div className="inicio-card-title">Equipos</div>
            <ul className="inicio-card-list"><li>Total en sistema</li><li>Disponibles: {stats.disponibles}</li></ul>
            <div className="inicio-card-value" style={{color:'#c9a8ff'}}>{stats.portatiles}</div>
          </div>
          <div className="inicio-card" style={{cursor:'pointer'}} onClick={() => navigate('/admin/reportes')}>
            <div className="admin-stat-icon" style={{background:'rgba(250,204,21,0.12)',color:'#facc15'}}>
              <IconAlertTriangle size={20} />
            </div>
            <div className="inicio-card-title">Reportes</div>
            <ul className="inicio-card-list"><li>Total: {stats.reportes}</li><li>Pendientes: {stats.pendientes}</li></ul>
            <div className="inicio-card-value" style={{color:'#facc15'}}>{stats.pendientes}</div>
          </div>
        </div>

        <div className="inicio-bottom-grid">
          <div className="inicio-card-wide">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div className="inicio-card-title">Reportes ultimos 7 dias</div>
              <span style={{fontSize:'11px',color:'#b8a8d8',background:'rgba(127,90,240,0.12)',border:'1px solid rgba(127,90,240,0.25)',borderRadius:'6px',padding:'3px 10px'}}>Esta semana</span>
            </div>
            <div className="inicio-chart-real">
              {(() => {
                const dias = [];
                for (let i = 6; i >= 0; i--) {
                  const d = new Date(); d.setDate(d.getDate() - i);
                  dias.push({ key: d.toISOString().split('T')[0], label: d.toLocaleDateString('es', {weekday:'short'}) });
                }
                const data = dias.map(({ key, label }) => ({
                  label,
                  count: todosReportes.filter(r => (r.fecha_reporte||'').startsWith(key)).length,
                }));
                const max = Math.max(...data.map(d => d.count), 1);
                return data.map((d, i) => (
                  <div key={i} className="inicio-chart-col">
                    <div className="inicio-chart-bar-wrap">
                      <div className="inicio-chart-bar-real"
                        style={{height: `${Math.max((d.count/max)*100, 6)}%`,
                          background: d.count > 0 ? 'linear-gradient(180deg,#c9a8ff,#7f5af0)' : 'rgba(127,90,240,0.12)'
                        }}
                      />
                    </div>
                    <div className="inicio-chart-label">{d.label}</div>
                    {d.count > 0 && <div className="inicio-chart-count">{d.count}</div>}
                  </div>
                ));
              })()}
            </div>
          </div>
          <div className="inicio-card-narrow">
            <div className="admin-stat-icon" style={{background:'rgba(250,204,21,0.12)',color:'#facc15',marginBottom:'12px'}}>
              <IconClock size={20} />
            </div>
            <div className="inicio-card-title">Reportes pendientes</div>
            {ultimosReportes.length === 0 ? (
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'16px',color:'#4ade80',fontSize:'13px'}}>
                <IconCheck size={16}/> Sin reportes pendientes
              </div>
            ) : (
              <ul className="inicio-card-list" style={{marginTop:'12px'}}>
                {ultimosReportes.map(r => (
                  <li key={r.id_reporte} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(127,90,240,0.1)'}}>
                    <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'70%',fontSize:'12px'}}>{r.descripcion}</span>
                    <span style={{color:estadoColor(r.estado_reporte),fontSize:'11px',fontWeight:700,flexShrink:0}}>{r.estado_reporte}</span>
                  </li>
                ))}
              </ul>
            )}
            <button className="admin-btn-outline" style={{marginTop:'16px',width:'100%',fontSize:'12px',padding:'8px'}} onClick={() => navigate('/admin/reportes')}>
              Ver todos los reportes
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Inicio;
