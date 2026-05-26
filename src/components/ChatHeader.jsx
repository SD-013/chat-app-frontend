import React from 'react';
import { Avatar } from './Avatar';

export default function ChatHeader({ peer, isOnline, onVoiceCall, onVideoCall }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 18px', height:'var(--header-h)', background:'var(--bg-panel)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
      <Avatar name={peer.name} src={peer.avatar} size={40} online={isOnline} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)' }}>{peer.name}</div>
        <div style={{ fontSize:12, color: isOnline ? 'var(--online)' : 'var(--text-muted)', marginTop:1 }}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <HeaderBtn onClick={onVoiceCall} title="Voice call">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.52 9.21 19.79 19.79 0 01.46 .54 2 2 0 012.44-.14H5.5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.68 7.71a16 16 0 006.61 6.61l1.07-1.07a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2z"/></svg>
        </HeaderBtn>
        <HeaderBtn onClick={onVideoCall} title="Video call">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
        </HeaderBtn>
      </div>
    </div>
  );
}

function HeaderBtn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width:38, height:38, borderRadius:'var(--radius-sm)', background:'transparent', border:'1px solid var(--border)', color:'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-strong)'; }}
      onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}>
      {children}
    </button>
  );
}
