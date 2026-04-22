import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.mensaje || "Error al iniciar sesion"); return; }
      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("rol", payload.rol);
      localStorage.setItem("nombre", payload.nombre || payload.correo || "");
      if (payload.rol === "administrador") navigate("/admin/inicio");
      else if (payload.rol === "instructor") navigate("/instructor/inicio");
      else if (payload.rol === "aprendiz") navigate("/aprendiz/inicio");
      else navigate("/login");
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Navbar showAuth={false} />

      {/* Grid de puntos de fondo */}
      <div className="login-bg-grid" />

      {/* Orbes animados de fondo */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />

      <div className="login-wrapper">
        <div className="login-card">

          {/* Badge sistema activo */}
          <div className="login-badge">
            <span className="login-badge-dot" />
            Sistema activo
          </div>

          <h1 className="login-title">Bienvenido <span className="login-title-accent">de nuevo</span></h1>
          <p className="login-sub">Ingresa tus credenciales para acceder al panel</p>

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <label>Correo electrónico</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email" name="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password" name="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <div className="login-forgot">
              <Link to="/recuperar-password" className="login-forgot-link">¿Olvidaste tu contraseña?</Link>
            </div>

            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>

          </form>

          <div className="login-footer">
            <p>¿No tienes cuenta? <Link to="/registrarse">Regístrate</Link></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
