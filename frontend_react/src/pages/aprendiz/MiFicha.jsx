import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconUser, IconCheck, IconMonitor, IconReport } from '../../components/Icons';
import SidebarAprendiz from '../../components/SidebarAprendiz';
import ChatFicha from '../../components/ChatFicha';
import '../../pages/aprendiz/MiFicha.css';

const estadoColor = (e) => ({ activa:'#4ade80', inactiva:'#f87171', cerrada:'#facc15' }[e] || '#c9a8ff');
const jornadaIcon = (j) => ({ manana:'🌅', tarde:'🌇', noche:'🌙' }[j] || '📅');
const getFichaDisplay = (f) => f?.nombre ?? f?.id_ficha ?? f?.id ?? '---';
const getFichaRouteId = (f) => f?.id ?? f?.id_ficha ?? '---';

const MiFicha = () => {
  const navigate = useNavigate();
  const [ficha, setFicha] = useState(null);
  const [fichasDisponibles, setFichasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uniendose, setUniendose] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const h = { Authorization: `Bearer ${token}` };
      const [miaRes, todasRes] = await Promise.all([
        fetch('/api/fichas/mia', { headers: h }),
        fetch('/api/fichas', { headers: h }),
      ]);
      const mia = miaRes.ok ? await miaRes.json() : null;
      const todas = await todasRes.json();
      setFicha(mia);
      if (!mia) {
        setFichasDisponibles(Array.isArray(todas) ? todas.filter(f => f.estado === 'activa') : []);
      }
    } catch { setError('Error al cargar'); }
    finally { setLoading(false); }
  };

  const handleUnirse = async (id) => {
    setUniendose(id); setError(''); setSuccessMsg('');
    try {
      const res = await fetch(`/api/fichas/${id}/unirse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.mensaje || data.message || 'Error al unirse'); return; }
      setSuccessMsg('Te uniste a la ficha correctamente');
      setTimeout(() => { setSuccessMsg(''); cargar(); }, 2000);
    } catch { setError('Error al conectar'); }
    finally { setUniendose(null); }
  };

  return (
    <div className="equipment-layout">
      <SidebarAprendiz />
      <main className="equipment-main">
        <div className="equipment-header">
          <div>
            <h1 className="equipment-title">Mi Ficha</h1>
            <p className="equipment-subtitle">{ficha ? 'Tu grupo de formacion' : 'Unete a una ficha disponible'}</p>
          </div>
          <button className="notification-btn"><IconBell size={20}/></button>
        </div>

        {successMsg && (
          <div style={{background:'rgba(74,222,128,0.1)',border:'1px solid rgba(74,222,128,0.3)',borderRadius:'10px',padding:'12px 18px',marginBottom:'20px',color:'#4ade80',fontSize:'14px',display:'flex',alignItems:'center',gap:'8px'}}>
            <IconCheck size={16}/> {successMsg}
          </div>
        )}
        {error && <p className="table-error">{error}</p>}

        {loading ? (
          <div style={{textAlign:'center',padding:'48px',color:'#b8a8d8'}}>Cargando...</div>
        ) : ficha ? (
          /* YA TIENE FICHA */
          <div>
            <div style={{background:'linear-gradient(135deg,#2d1a55,#1a0f35)',border:'1px solid rgba(127,90,240,0.4)',borderRadius:'20px',padding:'28px',marginBottom:'24px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'20px'}}>
                <div>
                  <div style={{fontSize:'11px',color:'#b8a8d8',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'6px'}}>Ficha asignada</div>
                  <h2 style={{fontSize:'22px',fontWeight:800,color:'#f0eaff',margin:0}}>Ficha #{getFichaDisplay(ficha)}</h2>
                  <p style={{fontSize:'13px',color:'#b8a8d8',marginTop:'4px'}}>{ficha.programa_formacion}</p>
                </div>
                <span style={{background:`${estadoColor(ficha.estado)}18`,border:`1px solid ${estadoColor(ficha.estado)}44`,color:estadoColor(ficha.estado),borderRadius:'50px',padding:'5px 14px',fontSize:'12px',fontWeight:700}}>{ficha.estado}</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'12px'}}>
                <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'14px 16px'}}>
                  <div style={{fontSize:'11px',color:'#b8a8d8',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Jornada</div>
                  <div style={{fontSize:'15px',fontWeight:700,color:'#f0eaff'}}>{jornadaIcon(ficha.jornada)} {ficha.jornada}</div>
                </div>
                <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'14px 16px'}}>
                  <div style={{fontSize:'11px',color:'#b8a8d8',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Cupo</div>
                  <div style={{fontSize:'15px',fontWeight:700,color:'#f0eaff'}}>{ficha.cupo_maximo} estudiantes</div>
                </div>
                <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'12px',padding:'14px 16px'}}>
                  <div style={{fontSize:'11px',color:'#b8a8d8',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.5px'}}>ID</div>
                  <div style={{fontSize:'15px',fontWeight:700,color:'#c9a8ff'}}>#{getFichaDisplay(ficha)}</div>
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:'22px',marginTop:'24px'}}>
              <div style={{background:'#13081f',border:'1px solid rgba(127,90,240,0.2)',borderRadius:'20px',padding:'18px',minHeight:'420px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                  <div>
                    <div style={{fontSize:'13px',color:'#b8a8d8',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'4px'}}>Chat de la ficha</div>
                    <div style={{fontSize:'16px',fontWeight:700,color:'#f0eaff'}}>Ficha #{getFichaDisplay(ficha)}</div>
                  </div>
                </div>
                <ChatFicha idFicha={getFichaRouteId(ficha)} token={token} />
              </div>
              <div style={{display:'flex',gap:'12px',flexDirection:'column',justifyContent:'flex-start'}}>
                <button className="btn-add-equipment" onClick={() => navigate('/aprendiz/dispositivo')} style={{borderRadius:'10px',padding:'10px 20px',fontSize:'13px'}}>
                  <IconMonitor size={14}/> Mi Dispositivo
                </button>
                <button className="btn-add-equipment" onClick={() => navigate('/aprendiz/historial')} style={{borderRadius:'10px',padding:'10px 20px',fontSize:'13px',background:'linear-gradient(135deg,#1e3a5f,#1a2a4a)'}}>
                  <IconReport size={14}/> Mis Reportes
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* NO TIENE FICHA - mostrar disponibles */
          <div>
            <div style={{background:'rgba(250,204,21,0.08)',border:'1px solid rgba(250,204,21,0.25)',borderRadius:'14px',padding:'16px 20px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'12px'}}>
              <span style={{fontSize:'20px'}}>📋</span>
              <div>
                <div style={{fontSize:'14px',fontWeight:700,color:'#facc15'}}>Aún no perteneces a ninguna ficha</div>
                <div style={{fontSize:'12px',color:'#b8a8d8',marginTop:'2px'}}>Únete a una de las fichas activas disponibles abajo</div>
              </div>
            </div>

            <div style={{fontSize:'13px',fontWeight:700,color:'#b8a8d8',textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:'14px'}}>
              Fichas disponibles
            </div>

            {fichasDisponibles.length === 0 ? (
              <div style={{textAlign:'center',padding:'48px',color:'#b8a8d8',fontSize:'13px'}}>No hay fichas activas disponibles</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {fichasDisponibles.map(f => (
                  <div key={f.id_ficha} style={{background:'#241545',border:'1px solid rgba(127,90,240,0.3)',borderRadius:'16px',padding:'0',display:'flex',overflow:'hidden'}}>
                    <div style={{width:'5px',background:'linear-gradient(180deg,#4ade80,#34d399)',flexShrink:0}}/>
                    <div style={{flex:1,padding:'18px 22px',display:'flex',flexDirection:'column',gap:'6px'}}>
                      <div style={{fontSize:'16px',fontWeight:800,color:'#f0eaff'}}>Ficha #{f.nombre ?? f.id_ficha ?? f.id}</div>
                      <div style={{fontSize:'12px',color:'#b8a8d8'}}>{f.programa_formacion}</div>
                      <div style={{display:'flex',gap:'12px',marginTop:'4px'}}>
                        <span style={{fontSize:'11px',color:'#b8a8d8'}}>{jornadaIcon(f.jornada)} {f.jornada}</span>
                        <span style={{fontSize:'11px',color:'#b8a8d8'}}>Cupo: {f.cupo_maximo}</span>
                      </div>
                    </div>
                    <div style={{padding:'18px 20px',display:'flex',alignItems:'center',flexShrink:0}}>
                      <button
                        onClick={() => handleUnirse(f.id)}
                        disabled={uniendose === f.id}
                        style={{background:'linear-gradient(135deg,#4ade80,#22c55e)',border:'none',borderRadius:'10px',padding:'10px 20px',color:'#0a0a0f',fontSize:'13px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',opacity: uniendose === f.id ? 0.6 : 1}}
                      >
                        <IconCheck size={14}/>
                        {uniendose === f.id_ficha ? 'Uniendose...' : 'Unirse'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MiFicha;
