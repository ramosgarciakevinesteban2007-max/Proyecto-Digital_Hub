import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell } from './Icons';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch('/api/notificaciones/count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setCount(data.unread || 0);
        }
      } catch (error) {
        console.error('Error al cargar notificaciones', error);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [token]);

  return (
    <button
      type="button"
      className="notification-btn"
      title="Notificaciones"
      onClick={() => navigate('/notificaciones')}
    >
      <IconBell size={20} />
      {count > 0 && <span className="notification-badge">{count > 9 ? '9+' : count}</span>}
    </button>
  );
};

export default NotificationBell;
