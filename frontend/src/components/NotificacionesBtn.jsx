import { useState, useEffect, useRef } from 'react';
import { IconBell } from './Icons';
import './NotificacionesBtn.css';

const NotificacionesBtn = () => {
  const [open, setOpen]         = useState(false);
  const [notifs, setNotifs]     = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const ref                     = useRef(null);
  const token                   = localStorage.getItem('token');

  const cargar = async () => {
    if (!token) return;
    try {
      const [nRes, cRes] = await Promise.all([
        fetch('/api/notificaciones',           { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/notificaciones/no-leidas', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (nRes.ok) setNotifs(await nRes.json());
      if (cRes.ok) { const d = await cRes.json(); setNoLeidas(d.total ?? 0); }
    } catch {}
  };

  const marcarLeidas = async () => {
    if (!token || noLeidas === 0) return;
    try {
      await fetch('/api/notificaciones/leer', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNoLeidas(0);
      setNotifs(prev => prev.map(n => ({ ...n, leida: 1 })));
    } catch {}
  };

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) marcarLeidas();
  };

  const tipoColor = (tipo) => ({ success:'#4ade80', error:'#f87171', warning:'#facc15', info:'#c9a8ff' }[tipo] || '#c9a8ff');
  const tipoIcon  = (tipo) => ({ success:'✓', error:'✕', warning:'!', info:'i' }[tipo] || 'i');

  const formatFecha = (f) => {
    if (!f) return '';
    const d = new Date(f);
    return d.toLocaleDateString('es', { day:'2-digit', month:'short' }) + ' · ' +
           d.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notification-btn notif-trigger" onClick={handleOpen}>
        <IconBell size={20} />
        {noLeidas > 0 && <span className="notif-badge">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-header-title">Notificaciones</span>
            {noLeidas > 0 && <span className="notif-header-count">{noLeidas} nuevas</span>}
          </div>
          <div className="notif-list">
            {notifs.length === 0 ? (
              <div className="notif-empty">Sin notificaciones</div>
            ) : (
              notifs.map(n => (
                <div key={n.id_notificacion} className={`notif-item${!n.leida ? ' notif-item-new' : ''}`}>
                  <div className="notif-item-icon" style={{ background:`${tipoColor(n.tipo)}22`, color:tipoColor(n.tipo) }}>
                    {tipoIcon(n.tipo)}
                  </div>
                  <div className="notif-item-body">
                    <div className="notif-item-titulo">{n.titulo}</div>
                    <div className="notif-item-msg">{n.mensaje}</div>
                    <div className="notif-item-fecha">{formatFecha(n.fecha_creacion)}</div>
                  </div>
                  {!n.leida && <div className="notif-item-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesBtn;
