import React from 'react';
import { Avatar, ClickableAvatar } from './Avatar';

const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
const preview = (msg, myId) => {
  if (!msg) return null;
  const pre = msg.sender === myId ? 'You: ' : '';
  return pre + (msg.messageType === 'image' ? 'Photo' : msg.content);
};

export default function Sidebar({ user, users, selectedUser, onSelect, onLogout, onAvatarClick, avatarUploading, search, setSearch, onlineIds, unreadCounts, lastMessages }) {
  return (
    <aside style={{ width:'var(--sidebar-w)', flexShrink:0, display:'flex', flexDirection:'column', background:'var(--bg-panel)', borderRight:'1px solid var(--border)' }}>
      <div style={{ padding:'14px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:11, flexShrink:0 }}>
        <ClickableAvatar name={user.name} src={user.avatar} size={44} uploading={avatarUploading} onClick={onAvatarClick} />
        <div style={{ flex:1, overflow:'hidden' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
          <div style={{ fontSize:11, color:'var(--online)', marginTop:1 }}>Active now</div>
        </div>
        <button onClick={onLogout} title="Logout"
          style={{ background:'none', border:'none', color:'var(--text-muted)', padding:7, borderRadius:8, display:'flex', alignItems:'center', transition:'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
          onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>

      <div style={{ padding:'10px 12px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 12px' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
            style={{ background:'none', border:'none', outline:'none', color:'var(--text-primary)', fontSize:13, width:'100%' }} />
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {users.length === 0 && (
          <p style={{ padding:'24px 16px', fontSize:13, color:'var(--text-muted)', textAlign:'center' }}>No users found</p>
        )}
        {users.map(u => {
          const last    = lastMessages[u._id];
          const unread  = unreadCounts[u._id] || 0;
          const sel     = selectedUser?._id === u._id;
          const online  = onlineIds.includes(u._id);
          return (
            <div key={u._id} onClick={() => onSelect(u)}
              style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 14px', cursor:'pointer', background: sel ? 'rgba(91,94,244,0.1)' : 'transparent', borderLeft:`3px solid ${sel ? 'var(--accent)' : 'transparent'}`, transition:'background 0.15s' }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.background='rgba(255,255,255,0.025)'; }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.background='transparent'; }}>
              <Avatar name={u.name} src={u.avatar} size={46} online={online} />
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                  <span style={{ fontSize:14, fontWeight: unread>0?700:500, color:'var(--text-primary)' }}>{u.name}</span>
                  {last && <span style={{ fontSize:11, color: unread>0?'var(--accent)':'var(--text-muted)', flexShrink:0 }}>{fmtTime(last.createdAt)}</span>}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, color: unread>0?'var(--text-secondary)':'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth: unread>0?170:220 }}>
                    {last ? preview(last, user.id) : (online ? 'Online' : 'Start chatting')}
                  </span>
                  {unread > 0 && (
                    <div style={{ minWidth:20, height:20, borderRadius:10, padding:'0 5px', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', flexShrink:0, marginLeft:6 }}>
                      {unread > 99 ? '99+' : unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
