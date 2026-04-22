import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Login.css";

const RecuperarPassword = () => {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!correo) {
    setError("Ingresa tu correo electronico");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch("http://localhost:3001/api/recuperacion/enviar-codigo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || "Error al enviar código");
    }

    console.log("✅ Backend respondió:", data);

  
    navigate("/verificar-codigo", { state: { correo } });

  } catch (error) {
    console.error("❌ ERROR:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <Navbar showAuth={false} />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-wrapper">
        <div className="login-card">
          <Link to="/login" className="login-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </Link>
          <h1 className="login-title" style={{ marginTop: "16px" }}>
            ¿Olvidaste tu <span className="login-title-accent">contraseña?</span>
          </h1>
          <p className="login-sub">
            Ingresa tu correo y te enviaremos un código para recuperar tu cuenta.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Correo electronico</label>
              <div className="input-icon-wrap">
                <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={e => { setCorreo(e.target.value); setError(""); }}
                  required
                />
              </div>
            </div>
            {error && <p className="login-error">{error}</p>}
            <button className="btn-submit" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar codigo"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuperarPassword;
