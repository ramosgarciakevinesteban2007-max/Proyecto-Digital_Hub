import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IconDashboard, IconMonitor, IconReport, IconHistory, IconUser, IconSettings } from './Icons';
import './Sidebar.css';

const SidebarAprendiz = ({ onCollapse }) => {
  const location = useLocation();
  const nombre = localStorage.getItem('nombre') || 'Aprendiz';
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.style.setProperty('--sidebar-w', next ? '70px' : '240px');
    if (onCollapse) onCollapse(next);
  };

  const menuItems = [
    { path: '/aprendiz/inicio',       icon: <IconDashboard size={18} />, label: 'Inicio' },
    { path: '/aprendiz/ficha',        icon: <IconUser size={18} />,      label: 'Mi Ficha' },
    { path: '/aprendiz/dispositivo',  icon: <IconMonitor size={18} />,   label: 'Mi Dispositivo' },
    { path: '/aprendiz/historial',    icon: <IconHistory size={18} />,   label: 'Mis Reportes' },
    { path: '/aprendiz/ajustes',      icon: <IconSettings size={18} />,  label: 'Ajustes' },
  ];

  return (
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/img/logo.png" alt="DigitalHub" className="sidebar-logo" />
        {!collapsed && <span className="sidebar-title">DigitalHub</span>}
        <button className="sidebar-toggle" onClick={toggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            title={collapsed ? item.label : ''}>
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user-icon"><IconUser size={16} /></div>
        {!collapsed && <span className="sidebar-user-name">{nombre}</span>}
        {!collapsed && <Link to="/aprendiz/ajustes" className="sidebar-settings-btn"><IconSettings size={15} /></Link>}
      </div>
    </aside>
  );
};

export default SidebarAprendiz;

