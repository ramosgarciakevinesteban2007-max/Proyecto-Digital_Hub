import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/img/logo.png" alt="DigitalHub" />
            <span>DigitalHub</span>
          </div>
          <p className="footer-desc">
            Plataforma web para la gestión, control y seguimiento de equipos
            tecnológicos en ambientes formativos.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#quienes-somos">Quiénes somos</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#soporte">Soporte</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Plataforma</h4>
          <ul>
            <li><Link to="/login">Iniciar sesión</Link></li>
            <li><Link to="/registrarse">Registrarse</Link></li>
            <li><Link to="/panel">Panel</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Términos y condiciones</a></li>
            <li><a href="#">Política de privacidad</a></li>
            <li><a href="#">Contáctenos</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 DigitalHub. Todos los derechos reservados.</p>
        <div className="footer-badge">
          <span className="footer-dot" />
          Sistema activo
        </div>
      </div>
    </footer>
  );
};

export default Footer;
