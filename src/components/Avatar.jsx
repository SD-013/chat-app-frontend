import React, { useState } from 'react';

export function Avatar({ name = '?', src = null, size = 38, online = false }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ position:'relative', flexShrink:0, width:size, height:size }}>
      {src && !err
        ? <img src={src} alt={name} onError={() => setErr(true)}
            style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(91,94,244,0.25)' }} />
        : <div style={{ width:size, height:size, borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:Math.round(size*0.38), fontWeight:700, color:'white', userSelect:'none', flexShrink:0 }}>
            {(name||'?').charAt(0).toUpperCase()}
          </div>
      }
      {online && (
        <div style={{ position:'absolute', bottom:0, right:0, width:Math.round(size*0.27), height:Math.round(size*0.27), borderRadius:'50%', background:'var(--online)', border:`2px solid var(--bg-panel)` }} />
      )}
    </div>
  );
}

export function ClickableAvatar({ name, src, size = 42, uploading, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div style={{ position:'relative', cursor:'pointer', flexShrink:0 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <Avatar name={name} src={src} size={size} />
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center', opacity: hover||uploading?1:0, transition:'opacity 0.18s' }}>
        {uploading
          ? <div className="spinner" style={{width:14,height:14}} />
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        }
      </div>
    </div>
  );
}
