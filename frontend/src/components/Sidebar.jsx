import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IconDashboard, IconHistory, IconFolder, IconMessage, IconTrash, IconSettings, IconBell, IconMonitor } from './Icons';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/inicio', icon: <IconDashboard size={18} />, label: 'Inicio' },
    { path: '/equipos', icon: <IconMonitor size={18} />, label: 'Equipos' },
    { path: '/fichas', icon: <IconFolder size={18} />, label: 'Fichas' },
    { path: '/comentarios', icon: <IconMessage size={18} />, label: 'Comentarios' },
    { path: '/historial', icon: <IconHistory size={18} />, label: 'Historial' },
    { path: '/papelera', icon: <IconTrash size={18} />, label: 'Papelera' },
    { path: '/ajustes', icon: <IconSettings size={18} />, label: 'Ajustes' },
  
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/img/logo.png" alt="DigitalHub" className="sidebar-logo" />
        <span className="sidebar-title">DigitalHub</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;