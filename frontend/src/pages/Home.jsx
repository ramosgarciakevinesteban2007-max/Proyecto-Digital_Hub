import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Home.css";

const FEATURES = [
  {
    id: 0, label: "Dispositivos", color: "#4ade80",
    colorBg: "rgba(74,222,128,0.12)", colorBorder: "rgba(74,222,128,0.35)",
    title: "Registro de dispositivos",
    desc: "Administra y controla portatiles desde un solo sistema centralizado. Consulta el estado, serial, marca y responsable de cada equipo en tiempo real.",
  },
  {
    id: 1, label: "Responsables", color: "#2cb9b0",
    colorBg: "rgba(44,185,176,0.12)", colorBorder: "rgba(44,185,176,0.35)",
    title: "Control de responsables",
    desc: "Asigna instructores o aprendices como responsables de equipos por horario y ambiente. Cada movimiento queda registrado con fecha y usuario.",
  },
  {
    id: 2, label: "Fichas", color: "#e040fb",
    colorBg: "rgba(224,64,251,0.12)", colorBorder: "rgba(224,64,251,0.35)",
    title: "Fichas de formacion",
    desc: "Gestiona fichas por programa formativo y jornada. Vincula aprendices con los equipos asignados a su grupo de manera organizada.",
  },
  {
    id: 3, label: "Ambientes", color: "#facc15",
    colorBg: "rgba(250,204,21,0.12)", colorBorder: "rgba(250,204,21,0.35)",
    title: "Gestion de ambientes",
    desc: "Controla que equipos estan en cada aula o laboratorio. Asigna un encargado por ambiente y lleva el registro de ocupacion.",
  },
  {
    id: 4, label: "Reportes", color: "#c9a8ff",
    colorBg: "rgba(201,168,255,0.12)", colorBorder: "rgba(201,168,255,0.35)",
    title: "Reportes y seguimiento",
    desc: "Genera reportes detallados sobre prestamos, devoluciones y estados de los equipos registrados en la plataforma.",
  },
  {
    id: 5, label: "Alertas", color: "#f87171",
    colorBg: "rgba(248,113,113,0.12)", colorBorder: "rgba(248,113,113,0.35)",
    title: "Notificaciones",
    desc: "Recibe alertas sobre equipos dañados, asignaciones pendientes y reportes nuevos directamente en la plataforma.",
  },
];

const ICONS = [
  <svg key={0} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  <svg key={1} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg key={2} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  <svg key={3} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  <svg key={4} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  <svg key={5} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
];

const Home = () => {
  const [activeTab, setActiveTab] = useState(0);
  const feat = FEATURES[activeTab];

  return (
    <div className="home-wrapper">
      <Navbar />

      <section id="inicio" className="hero-section">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Sistema de gestión tecnológica
            </div>
            <h1 className="hero-title">
              Gestiona tus equipos con <span>DigitalHub</span>
            </h1>
            <p className="hero-desc">
              Plataforma web diseñada para el control, asignación y seguimiento de
              portátiles en ambientes formativos. Centraliza la información y mantiene
              trazabilidad total de tus recursos tecnológicos.
            </p>
            <div className="hero-buttons">
              <Link to="/registrarse" className="btn-primary">Únete ahora</Link>
              <a href="#quienes-somos" className="btn-outline">Conocer más</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrap">
              <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"480px"}}>
                <defs>
                  <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1a0a3a"/><stop offset="100%" stopColor="#0a0a1a"/></linearGradient>
                  <linearGradient id="bar1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#7f5af0"/><stop offset="100%" stopColor="#4a2fa0"/></linearGradient>
                  <linearGradient id="bar2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2cb9b0"/><stop offset="100%" stopColor="#1a7a76"/></linearGradient>
                  <linearGradient id="bar3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#e040fb"/><stop offset="100%" stopColor="#9c1ab1"/></linearGradient>
                  <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <rect width="500" height="400" fill="url(#bg1)" rx="20"/>
                <rect x="100" y="55" width="300" height="205" rx="12" fill="rgba(127,90,240,0.12)" stroke="#7f5af0" strokeWidth="1.5"/>
                <rect x="112" y="67" width="276" height="181" rx="8" fill="rgba(8,8,18,0.95)"/>
                <rect x="112" y="67" width="276" height="22" rx="8" fill="rgba(127,90,240,0.2)"/>
                <circle cx="126" cy="78" r="4" fill="#f87171"/><circle cx="140" cy="78" r="4" fill="#facc15"/><circle cx="154" cy="78" r="4" fill="#4ade80"/>
                <rect x="128" y="185" width="18" height="45" rx="3" fill="url(#bar1)"/>
                <rect x="152" y="165" width="18" height="65" rx="3" fill="url(#bar2)"/>
                <rect x="176" y="150" width="18" height="80" rx="3" fill="url(#bar3)"/>
                <rect x="200" y="170" width="18" height="60" rx="3" fill="url(#bar1)" opacity="0.7"/>
                <rect x="224" y="155" width="18" height="75" rx="3" fill="url(#bar2)" opacity="0.8"/>
                <polyline points="268,210 290,182 315,192 340,168 368,175" fill="none" stroke="#2cb9b0" strokeWidth="2.5" filter="url(#glow)"/>
                <circle cx="268" cy="210" r="4" fill="#2cb9b0" filter="url(#glow)"/>
                <circle cx="315" cy="192" r="4" fill="#2cb9b0" filter="url(#glow)"/>
                <circle cx="368" cy="175" r="4" fill="#2cb9b0" filter="url(#glow)"/>
                <polygon points="268,210 290,182 315,192 340,168 368,175 368,230 268,230" fill="rgba(44,185,176,0.08)"/>
                <rect x="232" y="260" width="36" height="14" rx="4" fill="rgba(127,90,240,0.35)"/>
                <rect x="212" y="272" width="76" height="7" rx="4" fill="rgba(127,90,240,0.25)"/>
                <rect x="22" y="95" width="92" height="58" rx="10" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.4)" strokeWidth="1"/>
                <circle cx="42" cy="114" r="8" fill="rgba(74,222,128,0.5)"/>
                <rect x="56" y="109" width="46" height="6" rx="3" fill="rgba(74,222,128,0.5)"/>
                <rect x="386" y="130" width="92" height="58" rx="10" fill="rgba(224,64,251,0.08)" stroke="rgba(224,64,251,0.4)" strokeWidth="1"/>
                <circle cx="406" cy="149" r="8" fill="rgba(224,64,251,0.5)"/>
                <rect x="420" y="144" width="46" height="6" rx="3" fill="rgba(224,64,251,0.5)"/>
                <rect x="150" y="305" width="200" height="50" rx="10" fill="rgba(44,185,176,0.08)" stroke="rgba(44,185,176,0.3)" strokeWidth="1"/>
                <text x="305" y="332" textAnchor="middle" fill="#2cb9b0" fontSize="10" fontWeight="700">+12%</text>
                <circle cx="250" cy="370" r="5" fill="#7f5af0" opacity="0.7" filter="url(#glow)"/>
                <circle cx="75" cy="195" r="3" fill="#4ade80" opacity="0.6" filter="url(#glow)"/>
                <circle cx="425" cy="295" r="4" fill="#e040fb" opacity="0.6" filter="url(#glow)"/>
              </svg>
            </div>
            <div className="hero-glow" />
          </div>
        </div>
      </section>

      <section id="quienes-somos" className="features-section">
        <div className="section-header">
          <span className="section-tag">Funcionalidades</span>
          <h2 className="section-title">Todo lo que necesitas en un solo lugar</h2>
          <p className="section-subtitle">
            DigitalHub ofrece herramientas completas para administrar, asignar y
            hacer seguimiento de equipos tecnológicos en entornos educativos.
          </p>
        </div>

        <div className="ftabs-wrapper">
          <div className="ftabs-nav">
            {FEATURES.map((f, i) => (
              <button
                key={f.id}
                className={"ftab-btn" + (activeTab === i ? " ftab-active" : "")}
                style={activeTab === i ? { "--tab-color": f.color, "--tab-bg": f.colorBg, "--tab-border": f.colorBorder } : {}}
                onClick={() => setActiveTab(i)}
              >
                <span className="ftab-icon" style={{ color: activeTab === i ? f.color : "rgba(255,255,255,0.4)" }}>
                  {ICONS[i]}
                </span>
                <span className="ftab-label">{f.label}</span>
              </button>
            ))}
          </div>


          <div className="ftabs-panel" style={{ "--panel-color": feat.color, "--panel-bg": feat.colorBg, "--panel-border": feat.colorBorder }}>
            <div className="ftabs-panel-left">
              <div className="ftabs-panel-icon" style={{ background: feat.colorBg, border: "1px solid " + feat.colorBorder, color: feat.color }}>
                {ICONS[activeTab]}
              </div>
              <h3 className="ftabs-panel-title">{feat.title}</h3>
              <p className="ftabs-panel-desc">{feat.desc}</p>
            </div>
            <div className="ftabs-panel-right">
              {activeTab === 0 && (
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="20" width="120" height="80" rx="10" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.4"/>
                  <rect x="30" y="35" width="60" height="8" rx="4" fill={feat.color} fillOpacity="0.3"/>
                  <rect x="30" y="50" width="40" height="6" rx="3" fill={feat.color} fillOpacity="0.2"/>
                  <rect x="30" y="63" width="50" height="6" rx="3" fill={feat.color} fillOpacity="0.2"/>
                  <rect x="30" y="76" width="35" height="6" rx="3" fill={feat.color} fillOpacity="0.2"/>
                  <circle cx="120" cy="50" r="16" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.5"/>
                  <line x1="113" y1="50" x2="127" y2="50" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.6"/>
                  <line x1="120" y1="43" x2="120" y2="57" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.6"/>
                </svg>
              )}
              {activeTab === 1 && (
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="80" cy="45" r="20" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.5"/>
                  <path d="M50 90 Q80 70 110 90" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
                  <circle cx="40" cy="55" r="13" stroke={feat.color} strokeWidth="1" strokeOpacity="0.3"/>
                  <circle cx="120" cy="55" r="13" stroke={feat.color} strokeWidth="1" strokeOpacity="0.3"/>
                  <line x1="60" y1="100" x2="100" y2="100" stroke={feat.color} strokeWidth="1" strokeOpacity="0.2"/>
                </svg>
              )}
              {activeTab === 2 && (
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="30" y="15" width="100" height="90" rx="8" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.4"/>
                  <line x1="45" y1="40" x2="115" y2="40" stroke={feat.color} strokeWidth="1" strokeOpacity="0.3"/>
                  <line x1="45" y1="55" x2="95" y2="55" stroke={feat.color} strokeWidth="1" strokeOpacity="0.3"/>
                  <line x1="45" y1="70" x2="105" y2="70" stroke={feat.color} strokeWidth="1" strokeOpacity="0.3"/>
                  <line x1="45" y1="85" x2="80" y2="85" stroke={feat.color} strokeWidth="1" strokeOpacity="0.3"/>
                  <rect x="45" y="22" width="50" height="10" rx="3" fill={feat.color} fillOpacity="0.25"/>
                </svg>
              )}
              {activeTab === 3 && (
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="15" y="30" width="55" height="60" rx="6" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.4"/>
                  <rect x="90" y="30" width="55" height="60" rx="6" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.4"/>
                  <line x1="70" y1="60" x2="90" y2="60" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4,3"/>
                  <circle cx="42" cy="60" r="10" fill={feat.color} fillOpacity="0.15" stroke={feat.color} strokeWidth="1" strokeOpacity="0.4"/>
                  <circle cx="117" cy="60" r="10" fill={feat.color} fillOpacity="0.15" stroke={feat.color} strokeWidth="1" strokeOpacity="0.4"/>
                </svg>
              )}
              {activeTab === 4 && (
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="20" y1="100" x2="140" y2="100" stroke={feat.color} strokeWidth="1" strokeOpacity="0.3"/>
                  <rect x="30" y="70" width="16" height="30" rx="3" fill={feat.color} fillOpacity="0.3"/>
                  <rect x="55" y="50" width="16" height="50" rx="3" fill={feat.color} fillOpacity="0.4"/>
                  <rect x="80" y="35" width="16" height="65" rx="3" fill={feat.color} fillOpacity="0.5"/>
                  <rect x="105" y="55" width="16" height="45" rx="3" fill={feat.color} fillOpacity="0.35"/>
                  <polyline points="38,65 63,45 88,30 113,50" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.7" fill="none"/>
                </svg>
              )}
              {activeTab === 5 && (
                <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M80 20 C55 20 40 38 40 58 C40 80 25 88 25 88 L135 88 C135 88 120 80 120 58 C120 38 105 20 80 20Z" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.45" fill={feat.color} fillOpacity="0.07"/>
                  <line x1="68" y1="96" x2="92" y2="96" stroke={feat.color} strokeWidth="1.5" strokeOpacity="0.4"/>
                  <circle cx="80" cy="55" r="6" fill={feat.color} fillOpacity="0.5"/>
                  <circle cx="80" cy="55" r="12" stroke={feat.color} strokeWidth="1" strokeOpacity="0.2"/>
                </svg>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="how-section">
        <div className="how-inner">
          <div className="how-img-wrap">
            <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"420px"}}>
              <defs>
                <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#120a2e"/><stop offset="100%" stopColor="#0a0a1a"/></linearGradient>
                <filter id="glow2"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect width="500" height="420" fill="url(#bg2)" rx="20"/>
              <circle cx="250" cy="210" r="160" fill="none" stroke="rgba(127,90,240,0.1)" strokeWidth="1"/>
              <circle cx="250" cy="210" r="115" fill="none" stroke="rgba(44,185,176,0.1)" strokeWidth="1"/>
              <circle cx="250" cy="210" r="70" fill="rgba(127,90,240,0.05)" stroke="rgba(127,90,240,0.2)" strokeWidth="1"/>
              <circle cx="250" cy="210" r="38" fill="rgba(127,90,240,0.3)" stroke="#7f5af0" strokeWidth="2" filter="url(#glow2)"/>
              <text x="250" y="206" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Digital</text>
              <text x="250" y="221" textAnchor="middle" fill="#c9a8ff" fontSize="11" fontWeight="600">Hub</text>
              {[
                {cx:250,cy:75,label:"Fichas",color:"#4ade80",bg:"rgba(74,222,128,0.15)",border:"rgba(74,222,128,0.5)"},
                {cx:378,cy:148,label:"Equipos",color:"#2cb9b0",bg:"rgba(44,185,176,0.15)",border:"rgba(44,185,176,0.5)"},
                {cx:378,cy:272,label:"Reportes",color:"#facc15",bg:"rgba(250,204,21,0.15)",border:"rgba(250,204,21,0.5)"},
                {cx:250,cy:345,label:"Usuarios",color:"#f87171",bg:"rgba(248,113,113,0.15)",border:"rgba(248,113,113,0.5)"},
                {cx:122,cy:272,label:"Ambientes",color:"#e040fb",bg:"rgba(224,64,251,0.15)",border:"rgba(224,64,251,0.5)"},
                {cx:122,cy:148,label:"Asignacion",color:"#c9a8ff",bg:"rgba(201,168,255,0.15)",border:"rgba(201,168,255,0.5)"},
              ].map((n,i)=>(
                <g key={i}>
                  <line x1="250" y1="210" x2={n.cx} y2={n.cy} stroke={n.border} strokeWidth="1" strokeDasharray="4,4" opacity="0.6"/>
                  <circle cx={n.cx} cy={n.cy} r="30" fill={n.bg} stroke={n.border} strokeWidth="1.5"/>
                  <text x={n.cx} y={n.cy+4} textAnchor="middle" fill={n.color} fontSize="10" fontWeight="600">{n.label}</text>
                </g>
              ))}
              <circle cx="250" cy="45" r="4" fill="#4ade80" filter="url(#glow2)"/>
              <circle cx="415" cy="210" r="4" fill="#2cb9b0" filter="url(#glow2)"/>
              <circle cx="85" cy="210" r="4" fill="#e040fb" filter="url(#glow2)"/>
            </svg>
            <div className="how-img-overlay" />
          </div>
          <div className="how-content">
            <span className="section-tag">Cómo funciona</span>
            <h2>La intersección entre educación y tecnología</h2>
            <p>
              DigitalHub conecta a instructores, aprendices y administradores en una
              sola plataforma para gestionar los recursos tecnológicos de forma eficiente
              y transparente.
            </p>
            <ul className="how-list">
              <li>Registro y control de portátiles en tiempo real</li>
              <li>Asignación por fichas, jornadas y ambientes</li>
              <li>Reportes y trazabilidad completa</li>
            </ul>
            <Link to="/registrarse" className="btn-primary">Comenzar ahora</Link>
          </div>
        </div>
      </section>

      <section id="soporte" className="support-section">
        <div className="support-inner">
          <div className="support-content">
            <span className="section-tag">Soporte</span>
            <h2>Soporte técnico confiable cuando más lo necesitas</h2>
            <p>
              El area de Soporte DigitalHub garantiza el correcto funcionamiento del
              sistema y la atención oportuna a incidencias técnicas dentro de la plataforma.
            </p>
            <p>
              Nuestro equipo supervisa accesos, notificaciones y reportes para asegurar
              una experiencia estable y segura para todos los usuarios.
            </p>
            <a href="#" className="btn-primary" style={{display:"inline-block",marginTop:"8px"}}>Contactar soporte</a>
          </div>
          <div className="support-img-wrap">
            <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"420px"}}>
              <defs>
                <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0e0a28"/><stop offset="100%" stopColor="#0a0a1a"/></linearGradient>
                <filter id="glow3"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect width="500" height="420" fill="url(#bg3)" rx="20"/>
              <path d="M250 55 L345 98 L345 205 Q345 278 250 318 Q155 278 155 205 L155 98 Z" fill="rgba(127,90,240,0.1)" stroke="#7f5af0" strokeWidth="2" filter="url(#glow3)"/>
              <path d="M250 82 L322 118 L322 205 Q322 260 250 292 Q178 260 178 205 L178 118 Z" fill="rgba(44,185,176,0.06)" stroke="rgba(44,185,176,0.3)" strokeWidth="1"/>
              <polyline points="218,188 240,210 288,158" fill="none" stroke="#2cb9b0" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow3)"/>
              <rect x="340" y="72" width="128" height="54" rx="10" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.4)" strokeWidth="1"/>
              <circle cx="360" cy="99" r="9" fill="rgba(74,222,128,0.5)"/>
              <rect x="376" y="92" width="74" height="6" rx="3" fill="rgba(74,222,128,0.5)"/>
              <rect x="32" y="112" width="118" height="54" rx="10" fill="rgba(224,64,251,0.08)" stroke="rgba(224,64,251,0.4)" strokeWidth="1"/>
              <circle cx="52" cy="139" r="9" fill="rgba(224,64,251,0.5)"/>
              <rect x="68" y="132" width="64" height="6" rx="3" fill="rgba(224,64,251,0.5)"/>
              <rect x="52" y="330" width="112" height="62" rx="12" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.35)" strokeWidth="1"/>
              <text x="108" y="360" textAnchor="middle" fill="#4ade80" fontSize="24" fontWeight="800">99%</text>
              <text x="108" y="378" textAnchor="middle" fill="rgba(74,222,128,0.6)" fontSize="10">Disponibilidad</text>
              <rect x="194" y="330" width="112" height="62" rx="12" fill="rgba(44,185,176,0.08)" stroke="rgba(44,185,176,0.35)" strokeWidth="1"/>
              <text x="250" y="360" textAnchor="middle" fill="#2cb9b0" fontSize="24" fontWeight="800">24/7</text>
              <text x="250" y="378" textAnchor="middle" fill="rgba(44,185,176,0.6)" fontSize="10">Soporte</text>
              <rect x="336" y="330" width="112" height="62" rx="12" fill="rgba(250,204,21,0.08)" stroke="rgba(250,204,21,0.35)" strokeWidth="1"/>
              <text x="392" y="360" textAnchor="middle" fill="#facc15" fontSize="24" fontWeight="800">+50</text>
              <text x="392" y="378" textAnchor="middle" fill="rgba(250,204,21,0.6)" fontSize="10">Equipos</text>
              <circle cx="425" cy="215" r="5" fill="#facc15" filter="url(#glow3)"/>
              <circle cx="75" cy="275" r="4" fill="#4ade80" filter="url(#glow3)"/>
            </svg>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

