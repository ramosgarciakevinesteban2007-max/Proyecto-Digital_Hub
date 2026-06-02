import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import SidebarInstructor from '../../components/SidebarInstructor';

import { IconUser, IconMonitor, IconBell, IconReport, IconClock, IconCheck, IconGraduationCap, IconLaptop, IconAlertTriangle } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';

import '../Inicio.css';

import './InicioInstructor.css';



const InicioInstructor = () => {

  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const nombre = localStorage.getItem('nombre') || 'Instructor';

  const [stats, setStats] = useState({ portatiles: 0, fichas: 0, reportes: 0, pendientes: 0, aprendices: 0 });

  const [ultimosReportes, setUltimosReportes] = useState([]);

  const [misFichas, setMisFichas] = useState([]);



  useEffect(() => {

    if (!token) { navigate('/login'); return; }

    const cargar = () => {

      const h = { Authorization: `Bearer ${token}` };

      Promise.all([

        fetch('/api/portatiles?limit=500', { headers: h }).then(r => r.json()).catch(() => ({ data: [] })),

        fetch('/api/fichas',     { headers: h }).then(r => r.json()).catch(() => []),

        fetch('/api/reportes',   { headers: h }).then(r => r.json()).catch(() => []),

      ]).then(([portatilesRes, fichas, reportes]) => {

        const pArr = Array.isArray(portatilesRes) ? portatilesRes : (Array.isArray(portatilesRes?.data) ? portatilesRes.data : []);

        const rArr = Array.isArray(reportes) ? reportes : [];

        const fArr = Array.isArray(fichas) ? fichas : [];

        setStats({

          portatiles: pArr.length,

          fichas:     fArr.length,

          reportes:   rArr.length,

          pendientes: rArr.filter(r => r.estado_reporte === 'pendiente').length,

          aprendices: 0,

        });

        setUltimosReportes(rArr.filter(r => r.estado_reporte === 'pendiente').slice(0, 4));

        setMisFichas(fArr.slice(0, 3));

      });

    };

    cargar();

    const intervalo = setInterval(cargar, 30000);

    return () => clearInterval(intervalo);

  }, []);



  const estadoColor = (e) => ({ pendiente:'#facc15', en_revision:'#fb923c', resuelto:'#4ade80', activa:'#4ade80', inactiva:'#f87171' }[e] || '#c9a8ff');



  return (

    <div className="inicio-layout">

      <SidebarInstructor />

      <main className="inicio-main inst-main">



        <div className="inicio-header">

          <div>

            <div className="inst-badge"><span className="inst-badge-dot" />Sesion activa</div>

            <h1 className="inicio-title inst-title">Bienvenido, {nombre}</h1>

            <p className="inst-subtitle">Panel de control del instructor.</p>

          </div>

          <NotificacionesBtn />

        </div>



        <div className="inst-hero">

          <div className="inst-hero-content">

            <span className="inst-hero-tag">Panel Instructor</span>

            <h2 className="inst-hero-title">Administra tus recursos<br />en tiempo real</h2>

            <p className="inst-hero-desc">Controla equipos, fichas de formación y reportes desde un solo lugar.</p>

            <div className="inst-hero-btns">

              <button className="inst-btn-primary" onClick={() => navigate('/instructor/fichas')}>Mis Fichas</button>

              <button className="inst-btn-outline" onClick={() => navigate('/instructor/historial')}>Historial</button>

            </div>

          </div>

          <div className="inst-hero-orbs">

            <div className="inst-orb inst-orb-1" />

            <div className="inst-orb inst-orb-2" />

            <div className="inst-orb inst-orb-3" />

          </div>

        </div>



        {/* STATS */}

        <div className="inicio-stats-grid">

          <div className="inicio-card" style={{cursor:'pointer'}} onClick={() => navigate('/instructor/fichas')}>

            <div className="inst-stat-icon" style={{background:'rgba(44,185,176,0.12)',color:'#2cb9b0'}}>

              <IconGraduationCap size={20} />

            </div>

            <div className="inicio-card-body">

              <div className="inicio-card-title">Mis Fichas</div>

              <ul className="inicio-card-list">

                <li>Grupos de formación</li>

                <li>Activas en el sistema</li>

              </ul>

            </div>

            <div className="inicio-card-value" style={{color:'#2cb9b0'}}>{stats.fichas}</div>

          </div>



          <div className="inicio-card" style={{cursor:'pointer'}} onClick={() => navigate('/instructor/historial')}>

            <div className="inst-stat-icon" style={{background:'rgba(127,90,240,0.15)',color:'#c9a8ff'}}>

              <IconLaptop size={20} />

            </div>

            <div className="inicio-card-body">

              <div className="inicio-card-title">Equipos</div>

              <ul className="inicio-card-list">

                <li>Portátiles registrados</li>

                <li>Estado actualizado</li>

              </ul>

            </div>

            <div className="inicio-card-value" style={{color:'#c9a8ff'}}>{stats.portatiles}</div>

          </div>



          <div className="inicio-card" style={{cursor:'pointer'}} onClick={() => navigate('/instructor/fichas')}>

            <div className="inst-stat-icon" style={{background:'rgba(250,204,21,0.12)',color:'#facc15'}}>

              <IconAlertTriangle size={20} />

            </div>

            <div className="inicio-card-body">

              <div className="inicio-card-title">Reportes Pendientes</div>

              <ul className="inicio-card-list">

                <li>Total reportes: {stats.reportes}</li>

                <li>Requieren atención</li>

              </ul>

            </div>

            <div className="inicio-card-value" style={{color:'#facc15'}}>{stats.pendientes}</div>

          </div>

        </div>



        <div className="inicio-bottom-grid">

          {/* ULTIMOS REPORTES PENDIENTES */}

          <div className="inicio-card-wide">

            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>

              <div className="inicio-card-title">Reportes pendientes</div>

              <button onClick={() => navigate('/instructor/fichas')} style={{fontSize:'11px',color:'#c9a8ff',background:'rgba(127,90,240,0.1)',border:'1px solid rgba(127,90,240,0.25)',borderRadius:'6px',padding:'3px 10px',cursor:'pointer'}}>Ver todos</button>

            </div>

            {ultimosReportes.length === 0 ? (

              <div style={{color:'#b8a8d8',fontSize:'13px',display:'flex',alignItems:'center',gap:'8px'}}>

                <IconCheck size={14} style={{color:'#4ade80'}}/> Sin reportes pendientes

              </div>

            ) : (

              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>

                {ultimosReportes.map(r => (

                  <div key={r.id_reporte} className="inst-reporte-item">

                    <span className="inst-reporte-desc">{r.descripcion}</span>

                    <span style={{fontSize:'11px',fontWeight:700,color:estadoColor(r.estado_reporte),flexShrink:0}}>{r.estado_reporte}</span>

                  </div>

                ))}

              </div>

            )}

          </div>



          {/* MIS FICHAS RECIENTES */}

          <div className="inicio-card-narrow">

            <div className="inicio-card-title" style={{marginBottom:'12px'}}>Fichas recientes</div>

            {misFichas.length === 0 ? (

              <div style={{color:'#b8a8d8',fontSize:'13px'}}>Sin fichas creadas</div>

            ) : (

              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>

                {misFichas.map(f => (

                  <div key={f.id_ficha} onClick={() => navigate('/instructor/fichas')} className="inst-ficha-item">

                    <div className="inst-ficha-nombre">{f.nombre}</div>

                    <div style={{display:'flex',justifyContent:'space-between',marginTop:'4px'}}>

                      <span style={{fontSize:'11px',color:'#b8a8d8'}}>{f.jornada}</span>

                      <span style={{fontSize:'11px',fontWeight:700,color:estadoColor(f.estado)}}>{f.estado}</span>

                    </div>

                  </div>

                ))}

              </div>

            )}

            <button className="inst-btn-outline" style={{marginTop:'12px',width:'100%',fontSize:'12px',padding:'8px'}} onClick={() => navigate('/instructor/fichas')}>

              Ver todas las fichas

            </button>

          </div>

        </div>



      </main>

    </div>

  );

};



export default InicioInstructor;

