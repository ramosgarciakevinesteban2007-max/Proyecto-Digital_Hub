import { useState, useEffect, useRef } from 'react';
import './ChatFicha.css';

const ChatFicha = ({ idFicha, token }) => {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const nombre = localStorage.getItem('nombre') || '';

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 5000);
    return () => clearInterval(interval);
  }, [idFicha]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargar = async () => {
    try {
      const res = await fetch(`/api/chat/${idFicha}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setMensajes(data);
    } catch {}
    finally { setLoading(false); }
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    try {
      await fetch(`/api/chat/${idFicha}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mensaje: texto })
      });
      setTexto('');
      cargar();
    } catch {}
  };

  return (
    <div className="chat-ficha-wrap">
      <div className="chat-ficha-messages">
        {loading
          ? <div className="chat-ficha-empty">Cargando...</div>
          : mensajes.length === 0
            ? <div className="chat-ficha-empty">No hay mensajes aún. ¡Sé el primero!</div>
            : mensajes.map(m => {
              const esMio = m.nombre === nombre;
              return (
                <div key={m.id} className={`chat-msg-row ${esMio ? 'chat-msg-mine' : 'chat-msg-other'}`}>
                  <div className="chat-msg-author">{m.nombre} · {m.rol}</div>
                  <div className={`chat-msg-bubble ${esMio ? 'chat-bubble-mine' : 'chat-bubble-other'}`}>
                    {m.mensaje}
                  </div>
                  <div className="chat-msg-time">
                    {new Date(m.fecha_envio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
        }
        <div ref={bottomRef} />
      </div>
      <form onSubmit={enviar} className="chat-ficha-form">
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="chat-ficha-input"
        />
        <button type="submit" className="chat-ficha-btn">Enviar</button>
      </form>
    </div>
  );
};

export default ChatFicha;
