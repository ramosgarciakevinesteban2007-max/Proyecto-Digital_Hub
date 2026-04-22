const ConfirmModal = ({ mensaje, onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth:'380px',textAlign:'center'}}>
      <div style={{width:'52px',height:'52px',borderRadius:'50%',background:'rgba(248,113,113,0.12)',border:'1px solid rgba(248,113,113,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h2 className="modal-title" style={{marginBottom:'8px'}}>¿Estás seguro?</h2>
      <p style={{fontSize:'14px',color:'#b8a8d8',marginBottom:'24px'}}>{mensaje}</p>
      <div className="modal-actions" style={{justifyContent:'center'}}>
        <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
        <button className="btn-save" style={{background:'linear-gradient(135deg,#f87171,#dc2626)'}} onClick={onConfirm}>Eliminar</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
