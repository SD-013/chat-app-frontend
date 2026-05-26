import React, { useEffect } from 'react';

export default function Lightbox({ src, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div onClick={onClose} className="fade-in"
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.94)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, cursor:'zoom-out' }}>
      <img src={src} alt="" onClick={e => e.stopPropagation()}
        style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:14, objectFit:'contain', boxShadow:'0 0 80px rgba(0,0,0,0.8)' }} />
      <button onClick={onClose}
        style={{ position:'absolute', top:20, right:20, width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.18)'}
        onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
        ×
      </button>
    </div>
  );
}
