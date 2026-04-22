import { useState } from "react";

import { useNavigate, Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import "./Register.css";



const Register = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({

    nombre: "",

    correo: "",

    password: "",

    confirmPassword: "",

  });

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  const handleChange = (e) => {

    setFormData({ ...formData, [e.target.name]: e.target.value });

    setError("");

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {

      setError("Las contrasenas no coinciden");

      return;

    }

    setLoading(true);

    setError("");

    try {

      const res = await fetch("/api/usuarios/register", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          nombre: formData.nombre,

          correo: formData.correo,

          

          password: formData.password,

        }),

      });

      const data = await res.json();

      if (!res.ok) { setError(data.mensaje || "Error al registrarse"); return; }

      navigate("/login");

    } catch {

      setError("No se pudo conectar con el servidor");

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="register-page">

      <Navbar showAuth={false} />



      <div className="login-bg-grid" />

      <div className="login-orb login-orb-1" />

      <div className="login-orb login-orb-2" />



      <div className="register-wrapper">

        <div className="register-card">



          <div className="login-badge">

            <span className="login-badge-dot" />

            Crea tu cuenta

          </div>



          <h1 className="login-title">Únete a <span className="login-title-accent">DigitalHub</span></h1>

          <p className="login-sub">Completa el formulario para acceder al sistema</p>



          <form onSubmit={handleSubmit}>



            <div className="input-group">

              <label>Nombre completo</label>

              <div className="input-icon-wrap">

                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>

                  <circle cx="12" cy="7" r="4"/>

                </svg>

                <input type="text" name="nombre" placeholder="Tu nombre" value={formData.nombre} onChange={handleChange} required />

              </div>

            </div>



            <div className="input-group">

              <label>Correo electrónico</label>

              <div className="input-icon-wrap">

                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>

                  <polyline points="22,6 12,13 2,6"/>

                </svg>

                <input type="email" name="correo" placeholder="correo@ejemplo.com" value={formData.correo} onChange={handleChange} required />

              </div>

            </div>



            <div className="input-group">

              <label>Contraseña</label>

              <div className="input-icon-wrap">

                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>

                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>

                </svg>

                <input type="password" name="password" placeholder="Crea una contrasena" value={formData.password} onChange={handleChange} required />

              </div>

            </div>



            <div className="input-group">

              <label>Confirmar contraseña</label>

              <div className="input-icon-wrap">

                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>

                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>

                </svg>

                <input type="password" name="confirmPassword" placeholder="Repite tu contrasena" value={formData.confirmPassword} onChange={handleChange} required />

              </div>

            </div>







            {error && <p className="login-error">{error}</p>}



            <button className="btn-submit" type="submit" disabled={loading}>

              {loading ? "Registrando..." : "Crear cuenta"}

            </button>



          </form>



          <div className="login-footer">

            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>

          </div>



        </div>

      </div>

    </div>

  );

};



export default Register;