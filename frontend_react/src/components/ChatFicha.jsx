import { useState, useEffect, useRef } from 'react';

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
    <div style={{display:'flex',flexDirection:'column',height:'420px',background:'#0f0820',border:'1px solid rgba(127,90,240,0.3)',borderRadius:'16px',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
        {loading
          ? <div style={{color:'#b8a8d8',fontSize:'13px'}}>Cargando...</div>
          : mensajes.length === 0
            ? <div style={{color:'#b8a8d8',fontSize:'13px',textAlign:'center',marginTop:'40px'}}>No hay mensajes aún. ¡Sé el primero!</div>
            : mensajes.map(m => {
              const esMio = m.nombre === nombre;
              return (
                <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems: esMio ? 'flex-end' : 'flex-start'}}>
                  <div style={{fontSize:'11px',color:'#b8a8d8',marginBottom:'3px'}}>{m.nombre} · {m.rol}</div>
                  <div style={{
                    background: esMio ? 'linear-gradient(135deg,#7f5af0,#5a3bc0)' : '#241545',
                    border: esMio ? 'none' : '1px solid rgba(127,90,240,0.3)',
                    borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding:'10px 14px', maxWidth:'70%', fontSize:'14px', color:'#f0eaff', wordBreak:'break-word'
                  }}>{m.mensaje}</div>
                  <div style={{fontSize:'10px',color:'#6a5a8a',marginTop:'3px'}}>
                    {new Date(m.fecha_envio).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
              );
            })
        }
        <div ref={bottomRef}/>
      </div>
      <form onSubmit={enviar} style={{display:'flex',gap:'8px',padding:'12px',borderTop:'1px solid rgba(127,90,240,0.2)'}}>
        <input
          value={texto} onChange={e => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{flex:1,background:'#160b2e',border:'1px solid rgba(127,90,240,0.35)',borderRadius:'50px',padding:'10px 16px',color:'#f0eaff',fontSize:'13px',outline:'none'}}
        />
        <button type="submit" style={{background:'linear-gradient(135deg,#7f5af0,#5a3bc0)',border:'none',borderRadius:'50px',padding:'10px 20px',color:'#fff',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatFicha;
