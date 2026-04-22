import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notificaciones.css';

const Notificaciones = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Debes iniciar sesión para ver las notificaciones.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/api/notificaciones', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('No se pudieron cargar las notificaciones');
        }
        const data = await res.json();
        setNotifications(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error al cargar notificaciones');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const markAsRead = async (id_notificacion) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notificaciones/${id_notificacion}/leida`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo marcar como leída');
      setNotifications((prev) => prev.map((item) => item.id_notificacion === id_notificacion ? { ...item, leida: 1 } : item));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notificaciones</h1>
          <p>Revisa aquí tus alertas internas recientes.</p>
        </div>
        <button type="button" className="notifications-back" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>

      {loading && <div className="notifications-message">Cargando notificaciones...</div>}
      {error && <div className="notifications-message error">{error}</div>}

      {!loading && !error && (
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="notifications-message">No tienes notificaciones nuevas.</div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id_notificacion}
                type="button"
                className={`notification-item ${notification.leida ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notification.id_notificacion)}
              >
                <div className="notification-main">
                  <div className="notification-title">{notification.titulo}</div>
                  <div className="notification-text">{notification.mensaje}</div>
                </div>
                <div className="notification-meta">
                  {new Date(notification.fecha_creacion).toLocaleString('es-CO', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
