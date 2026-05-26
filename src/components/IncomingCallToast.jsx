import React, { useEffect, useState } from 'react';
import { Avatar } from './Avatar';

export default function IncomingCallToast({ caller, callType, onAccept, onDecline }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  return (
    <div style={{
      position:'fixed', top:20, right:20, zIndex:2000,
      background:'var(--bg-elevated)', border:'1px solid var(--border-strong)',
      borderRadius:'var(--radius-md)', padding:'16px 18px',
      boxShadow:'0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,94,244,0.2)',
      display:'flex', alignItems:'center', gap:14,
      width:300,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-12px)',
      transition:'opacity 0.25s, transform 0.25s',
    }}>
      <div style={{ position:'relative' }}>
        <div style={{ position:'absolute', inset:-6, borderRadius:'50%', border:'2px solid rgba(52,211,153,0.4)', animation:'ringPulse 1.8s ease-out infinite' }} />
        <Avatar name={caller.name} src={caller.avatar} size={46} />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:2 }}>
          Incoming {callType} call
        </div>
        <div style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>{caller.name}</div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={onAccept}
          style={{ width:36, height:36, borderRadius:'50%', background:'var(--online)', border:'none', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.52 9.21 19.79 19.79 0 01.46 .54 2 2 0 012.44-.14H5.5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.68 7.71a16 16 0 006.61 6.61l1.07-1.07a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2z"/></svg>
        </button>
        <button onClick={onDecline}
          style={{ width:36, height:36, borderRadius:'50%', background:'var(--danger)', border:'none', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  );
}
