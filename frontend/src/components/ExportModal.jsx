import { useState } from 'react';

// Todos los tipos usan el backend — diseño oscuro Digital Hub con ExcelJS
const BACKEND_ENDPOINTS = {
  equipos:  { excel: '/exportar/portatiles/excel', csv: '/exportar/portatiles/csv' },
  fichas:   { excel: '/exportar/fichas/excel',     csv: '/exportar/fichas/excel'   },
  usuarios: { excel: '/exportar/usuarios/excel',   csv: '/exportar/usuarios/csv'   },
  reportes: { excel: '/exportar/reportes/excel',   csv: '/exportar/reportes/excel' },
};

const ExportModal = ({ tipo, datos = [], onClose }) => {
  const [formato, setFormato] = useState('excel');
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState(false);
  const esClaro = document.documentElement.getAttribute('data-theme') === 'claro';

  const c = esClaro ? {
    overlay:'rgba(0,0,0,0.4)',bg:'#ffffff',border:'rgba(127,90,240,0.3)',
    title:'#1a0a3a',text:'#4a3a6a',label:'#7f5af0',
    inputBg:'#f5f0ff',inputBorder:'rgba(127,90,240,0.3)',inputColor:'#1a0a3a',
    btnSecBg:'#f0ebff',btnSecBorder:'rgba(127,90,240,0.3)',btnSecColor:'#1a0a3a',
    formatoInactivoBg:'#f0ebff',formatoInactivoBorder:'rgba(127,90,240,0.3)',
    shadow:'0 24px 80px rgba(127,90,240,0.2)',
  } : {
    overlay:'rgba(0,0,0,0.8)',bg:'#160b2e',border:'rgba(127,90,240,0.5)',
    title:'#f0eaff',text:'#b8a8d8',label:'#b8a8d8',
    inputBg:'#0f0820',inputBorder:'rgba(127,90,240,0.4)',inputColor:'#f0eaff',
    btnSecBg:'#241545',btnSecBorder:'rgba(127,90,240,0.3)',btnSecColor:'#f0eaff',
    formatoInactivoBg:'#241545',formatoInactivoBorder:'rgba(127,90,240,0.3)',
    shadow:'0 24px 80px rgba(0,0,0,0.7)',
  };

  const aplicarFiltros = () => {
    const lista = Array.isArray(datos) ? datos : [];
    let r = [...lista];
    Object.entries(filtros).forEach(([key, val]) => {
      if (val) r = r.filter(item => {
        const campo = item[key];
        return campo && campo.toString().toLowerCase() === val.toLowerCase();
      });
    });
    return r;
  };

  const exportarDesdeBackend = async () => {
    const endpoints = BACKEND_ENDPOINTS[tipo];
    if (!endpoints) {
      alert('Tipo de exportación no soportado: ' + tipo);
      return false;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = formato === 'csv' ? endpoints.csv : endpoints.excel;
      const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      if (!res.ok) {
        let msg = 'Error al exportar';
        try { const j = await res.json(); msg = j.error || j.mensaje || msg; } catch {}
        alert(msg);
        setLoading(false);
        return false;
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = tipo + '_' + new Date().toISOString().split('T')[0] + (formato === 'csv' ? '.csv' : '.xlsx');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert('Error de conexión: ' + e.message);
      setLoading(false);
      return false;
    }
    setLoading(false);
    return true;
  };

  const exportarLocal = () => {}; // ya no se usa, todo va por backend

  const exportar = async () => {
    const ok = await exportarDesdeBackend();
    if (ok) onClose();
  };

  const setFiltro = (key, val) => setFiltros(prev => ({ ...prev, [key]: val }));

  const selectStyle = {
    background:c.inputBg,border:'1px solid '+c.inputBorder,borderRadius:'10px',
    padding:'10px 14px',color:c.inputColor,fontSize:'14px',width:'100%',
    outline:'none',cursor:'pointer',marginTop:'8px',
  };
  const labelStyle = {
    fontSize:'12px',fontWeight:600,color:c.label,
    textTransform:'uppercase',letterSpacing:'0.6px',display:'block',
  };

  const renderFiltros = () => {
    // Todos van al backend — solo info
    const msgs = {
      equipos:  'Se exportan todos los equipos. El instructor solo verá los suyos.',
      fichas:   'Se exportan todas las fichas. El instructor solo verá las suyas.',
      usuarios: 'Se exportan todos los usuarios del sistema.',
      reportes: 'Se exportan todos los reportes. El instructor solo verá los suyos.',
    };
    return <p style={{fontSize:'12px',color:c.text,margin:0,lineHeight:'1.6'}}>{msgs[tipo] || 'Exportación desde el servidor.'}</p>;
  };

  const titulos = { equipos:'Equipos', usuarios:'Usuarios', reportes:'Reportes', fichas:'Fichas' };

  return (
    <div style={{position:'fixed',inset:0,background:c.overlay,backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3000}} onClick={onClose}>
      <div style={{background:c.bg,border:'1px solid '+c.border,borderRadius:'20px',padding:'32px',width:'90%',maxWidth:'460px',boxShadow:c.shadow}} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontSize:'20px',fontWeight:700,color:c.title,marginBottom:'6px'}}>
          Exportar {titulos[tipo] || tipo}
        </h2>
        <p style={{fontSize:'13px',color:c.text,marginBottom:'24px'}}>
          Exportación con diseño Digital Hub — archivo .xlsx o .csv
        </p>

        <div style={{marginBottom:'20px'}}>
          <label style={{...labelStyle,marginBottom:'10px'}}>Formato</label>
          <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
            {['excel','csv'].map(f => (
              <button key={f} onClick={() => setFormato(f)} style={{
                flex:1,padding:'10px',borderRadius:'10px',cursor:'pointer',fontWeight:600,fontSize:'13px',
                background: formato===f ? 'linear-gradient(135deg,#7f5af0,#5a3bc0)' : c.formatoInactivoBg,
                border: formato===f ? 'none' : '1px solid '+c.formatoInactivoBorder,
                color: formato===f ? '#fff' : c.btnSecColor,
                transition:'all 0.2s'
              }}>
                {f === 'excel' ? '📊 Excel' : '📄 CSV'}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:'24px'}}>
          <label style={{...labelStyle,marginBottom:'10px'}}>Información</label>
          {renderFiltros()}
        </div>

        <div style={{display:'flex',gap:'12px'}}>
          <button onClick={onClose} disabled={loading} style={{
            flex:1,padding:'12px',background:c.btnSecBg,
            border:'1px solid '+c.btnSecBorder,borderRadius:'50px',
            color:c.btnSecColor,fontSize:'14px',fontWeight:600,
            cursor:loading?'not-allowed':'pointer'
          }}>Cancelar</button>
          <button onClick={exportar} disabled={loading} style={{
            flex:1,padding:'12px',
            background:loading?'#4a3a6a':'linear-gradient(135deg,#7f5af0,#5a3bc0)',
            border:'none',borderRadius:'50px',color:'#fff',
            fontSize:'14px',fontWeight:600,
            cursor:loading?'not-allowed':'pointer',
            boxShadow:'0 4px 16px rgba(127,90,240,0.4)'
          }}>
            {loading ? 'Exportando...' : 'Exportar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
