import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ showAuth = true }) => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const navbarHeight = document.querySelector('.navbar').offsetHeight;
          const targetPosition = element.offsetTop - navbarHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = element.offsetTop - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <img src="/img/logo.png" alt="DigitalHub Logo" className="logo-img" />
          <span>DigitalHub</span>
        </div>
        <div className="nav-links">
          <a href="#inicio" onClick={(e) => handleNavClick(e, 'inicio')}>Inicio</a>
          <a href="#quienes-somos" onClick={(e) => handleNavClick(e, 'quienes-somos')}>Quiénes somos</a>
          <a href="#servicios" onClick={(e) => handleNavClick(e, 'servicios')}>Servicios</a>
          <a href="#soporte" onClick={(e) => handleNavClick(e, 'soporte')}>Soporte</a>
        </div>
        {showAuth && (
          <div className="nav-auth">
            <Link to="/login" className="btn-login">Iniciar sesión</Link>
            <Link to="/registrarse" className="btn-register">Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
