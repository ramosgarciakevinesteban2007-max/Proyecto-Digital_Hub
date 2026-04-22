import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconDashboard, IconMonitor, IconHistory, IconTrash, IconUser, IconSettings, IconReport } from './Icons';
import './Sidebar.css';

const SidebarAdmin = ({ onCollapse }) => {
  const location = useLocation();
  const nombre = localStorage.getItem('nombre') || 'Administrador';
  const [collapsed, setCollapsed] = useState(false);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.style.setProperty('--sidebar-w', next ? '70px' : '240px');
    if (onCollapse) onCollapse(next);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/img/logo.png" alt="DigitalHub" className="sidebar-logo" />
        {!collapsed && <span className="sidebar-title">DigitalHub</span>}
        <button className="sidebar-toggle" onClick={toggle}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-group-label">Principal</div>}
        <Link to="/admin/inicio" className={`sidebar-item ${isActive('/admin/inicio') ? 'active' : ''}`} title={collapsed ? 'Inicio' : ''}>
          <span className="sidebar-icon"><IconDashboard size={17} /></span>
          {!collapsed && <span className="sidebar-label">Inicio</span>}
        </Link>
        <Link to="/admin/equipos" className={`sidebar-item ${isActive('/admin/equipos') ? 'active' : ''}`} title={collapsed ? 'Equipos' : ''}>
          <span className="sidebar-icon"><IconMonitor size={17} /></span>
          {!collapsed && <span className="sidebar-label">Equipos</span>}
        </Link>
        <Link to="/admin/usuarios" className={`sidebar-item ${isActive('/admin/usuarios') ? 'active' : ''}`} title={collapsed ? 'Usuarios' : ''}>
          <span className="sidebar-icon"><IconUser size={17} /></span>
          {!collapsed && <span className="sidebar-label">Usuarios</span>}
        </Link>
        <Link to="/admin/reportes" className={`sidebar-item ${isActive('/admin/reportes') ? 'active' : ''}`} title={collapsed ? 'Reportes' : ''}>
          <span className="sidebar-icon"><IconReport size={17} /></span>
          {!collapsed && <span className="sidebar-label">Reportes</span>}
        </Link>
        <Link to="/admin/fichas" className={`sidebar-item ${isActive('/admin/fichas') ? 'active' : ''}`} title={collapsed ? 'Fichas' : ''}>
          <span className="sidebar-icon"><IconUser size={17} /></span>
          {!collapsed && <span className="sidebar-label">Fichas</span>}
        </Link>

        {!collapsed && <div className="sidebar-divider" />}
        {!collapsed && <div className="sidebar-group-label">Gestion</div>}
        <Link to="/admin/historial" className={`sidebar-item ${isActive('/admin/historial') ? 'active' : ''}`} title={collapsed ? 'Historial' : ''}>
          <span className="sidebar-icon"><IconHistory size={17} /></span>
          {!collapsed && <span className="sidebar-label">Historial</span>}
        </Link>
        <Link to="/admin/papelera" className={`sidebar-item ${isActive('/admin/papelera') ? 'active' : ''}`} title={collapsed ? 'Papelera' : ''}>
          <span className="sidebar-icon"><IconTrash size={17} /></span>
          {!collapsed && <span className="sidebar-label">Papelera</span>}
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-icon"><IconUser size={15} /></div>
        {!collapsed && <span className="sidebar-user-name">{nombre}</span>}
        {!collapsed && <Link to="/admin/ajustes" className="sidebar-settings-btn"><IconSettings size={14} /></Link>}
      </div>
    </aside>
  );
};

export default SidebarAdmin;

