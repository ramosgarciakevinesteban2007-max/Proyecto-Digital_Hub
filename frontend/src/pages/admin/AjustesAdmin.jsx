import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/SidebarAdmin';
import { IconBell } from '../../components/Icons';
import NotificacionesBtn from '../../components/NotificacionesBtn';
import '../Ajustes.css';

const AjustesAdmin = () => {
  const navigate = useNavigate();
  const [tema, setTema] = useState(localStorage.getItem('tema') || 'oscuro');
  const [idioma, setIdioma] = useState(localStorage.getItem('idioma') || 'es');
  const [notifSistema, setNotifSistema] = useState(localStorage.getItem('notif_sistema') !== 'false');

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
  }, []);

  useEffect(() => {
    localStorage.setItem('idioma', idioma);
  }, [idioma]);

  useEffect(() => {
    localStorage.setItem('tema', tema);
    document.documentElement.setAttribute('data-theme', tema);
  }, [tema]);

  useEffect(() => { localStorage.setItem('notif_sistema', notifSistema); }, [notifSistema]);

  const cerrarSesion = () => {
    const tema = localStorage.getItem('tema');
    const notif = localStorage.getItem('notif_sistema');
    const idioma = localStorage.getItem('idioma');
    localStorage.clear();
    if (tema) localStorage.setItem('tema', tema);
    if (notif) localStorage.setItem('notif_sistema', notif);
    if (idioma) localStorage.setItem('idioma', idioma);
    navigate('/login');
  };

  return (
    <div className="equipment-layout">
      <SidebarAdmin />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Ajustes</h1>
            <p className="equipment-subtitle">Personaliza tu experiencia</p>
          </div>
          <NotificacionesBtn />
        </div>

        <div className="ajustes-section">
          <div className="ajustes-section-title">Apariencia</div>

          <div className="ajustes-row">
            <div>
              <div className="ajustes-row-label">Tema</div>
              <div className="ajustes-row-desc">Modo claro u oscuro</div>
            </div>
            <select className="ajustes-select" value={tema} onChange={e => setTema(e.target.value)}>
              <option value="oscuro">Oscuro</option>
              <option value="claro">Claro</option>
            </select>
          </div>
        </div>

        <div className="ajustes-section">
          <div className="ajustes-section-title">Notificaciones</div>

          <div className="ajustes-row">
            <div>
              <div className="ajustes-row-label">Alertas del sistema</div>
              <div className="ajustes-row-desc">Recibir notificaciones del sistema</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={notifSistema} onChange={e => setNotifSistema(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

        </div>

        <div className="ajustes-section">
          <div className="ajustes-section-title">Sesión</div>
          <button className="btn-logout" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </main>
    </div>
  );
};

export default AjustesAdmin;
