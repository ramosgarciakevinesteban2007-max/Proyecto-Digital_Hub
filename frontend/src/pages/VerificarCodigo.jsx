import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Login.css";

const VerificarCodigo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const correo = location.state?.correo || "";
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const nuevo = [...codigo];
    nuevo[i] = val;
    setCodigo(nuevo);
    setError("");
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !codigo[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setCodigo(text.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const completo = codigo.join("");
    if (completo.length < 6) { setError("Ingresa los 6 digitos del codigo"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/nueva-password", { state: { correo, codigo: completo } });
    }, 800);
  };

  return (
    <div className="login-page">
      <Navbar showAuth={false} />
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-wrapper">
        <div className="login-card">
          <Link to="/recuperar-password" className="login-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Volver
          </Link>
          <h1 className="login-title" style={{ marginTop: "16px" }}>
            Te enviamos un <span className="login-title-accent">codigo</span>
          </h1>
          <p className="login-sub">
            Ingrésalo para confirmar el cambio de contraseña.
            {correo && <><br /><span style={{ color: "#c9a8ff", fontSize: "13px" }}>{correo}</span></>}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label> Código de confirmación</label>
              <div className="codigo-grid" onPaste={handlePaste}>
                {codigo.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    className="codigo-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                  />
                ))}
              </div>
            </div>
            {error && <p className="login-error">{error}</p>}
            <button className="btn-submit" type="submit" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? "Verificando..." : "Confirmar cambio"}
            </button>
          </form>

          <div className="login-footer">
            <p>¿No recibiste el código? <a href="#">Reenviar</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificarCodigo;
