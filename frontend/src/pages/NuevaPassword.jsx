import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Login.css";

const NuevaPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const correo = location.state?.correo || "";
  const [form, setForm] = useState({ password: "", confirmar: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (form.password.length < 6) {
    setError("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  if (form.password !== form.confirmar) {
    setError("Las contraseñas no coinciden");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/recuperacion/cambiar-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo: correo,
        codigo: location.state?.codigo,
        nuevaPassword: form.password
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.mensaje || "Error al cambiar contraseña");
      return;
    }

    setExito(true);

  } catch (error) {
    setError("Error de conexión con el servidor");
  } finally {
    setLoading(false);
  }
};

  if (exito) {
    return (
      <div className="login-page">
        <Navbar showAuth={false} />
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-wrapper">
          <div className="login-card" style={{ textAlign: "center" }}>
            <div className="exito-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h1 className="login-title" style={{ marginTop: "20px" }}>
              Realizado <span className="login-title-accent">correctamente!</span>
            </h1>
            <p className="login-sub">Tu contraseña ha sido actualizada con éxito.</p>
            <button className="btn-submit" onClick={() => navigate("/login")} style={{ marginTop: "8px" }}>
              Iniciar sesión de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <Navbar showAuth={false} />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-wrapper">
        <div className="login-card">
          <Link to="/verificar-codigo" className="login-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </Link>
          <h1 className="login-title" style={{ marginTop: "16px" }}>
            Nueva <span className="login-title-accent">contraseña</span>
          </h1>
          <p className="login-sub">Elige una contraseña segura para tu cuenta.</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Nueva contraseña   </label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setError(""); }}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Confirmar contraseña</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  placeholder="Repite tu contrasena"
                  value={form.confirmar}
                  onChange={e => { setForm({ ...form, confirmar: e.target.value }); setError(""); }}
                  required
                />
              </div>
            </div>
            {error && <p className="login-error">{error}</p>}
            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevaPassword;
