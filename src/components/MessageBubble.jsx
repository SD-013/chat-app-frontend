import React from 'react';
import { Avatar } from './Avatar';

const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
const fmtDate = (d) => {
  const date = new Date(d), today = new Date(), yest = new Date();
  yest.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yest.toDateString())  return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
};

export function DateDivider({ label }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', margin:'16px 0 10px' }}>
      <span style={{ fontSize:11, color:'var(--text-muted)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:20, padding:'3px 14px' }}>{label}</span>
    </div>
  );
}

export function TypingIndicator({ name }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:10 }}>
      <div style={{ width:30, flexShrink:0 }}>
        <Avatar name={name} size={30} />
      </div>
      <div style={{ padding:'10px 14px', borderRadius:'18px 18px 18px 4px', background:'rgba(255,255,255,0.06)', border:'1px solid var(--border)', display:'flex', gap:4, alignItems:'center' }}>
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

export function MessageBubble({ msg, own, grouped, onImgClick }) {
  const isImg = msg.messageType === 'image';
  return (
    <div className="msg-in" style={{ display:'flex', flexDirection: own?'row-reverse':'row', alignItems:'flex-end', gap:8, marginBottom: grouped?2:10 }}>
      {!own && (
        <div style={{ width:30, flexShrink:0 }}>
          {!grouped && <Avatar name={msg.senderName} src={msg.senderAvatar} size={30} />}
        </div>
      )}
      <div style={{ maxWidth:'62%', display:'flex', flexDirection:'column', alignItems: own?'flex-end':'flex-start' }}>
        {!own && !grouped && (
          <span style={{ fontSize:11, color:'var(--accent)', marginBottom:4, marginLeft:4, fontWeight:500 }}>{msg.senderName}</span>
        )}
        <div style={{
          padding: isImg ? 4 : '9px 14px',
          borderRadius: own
            ? (grouped ? '14px 4px 4px 14px' : '18px 18px 4px 18px')
            : (grouped ? '4px 14px 14px 4px' : '18px 18px 18px 4px'),
          background: own ? 'linear-gradient(135deg,var(--accent),var(--accent-2))' : 'rgba(255,255,255,0.06)',
          color: 'var(--text-primary)',
          fontSize: 14, lineHeight: 1.55,
          wordBreak: 'break-word',
          boxShadow: own ? '0 2px 12px var(--accent-glow)' : 'none',
          border: own ? 'none' : '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          {isImg ? (
            <>
              <img src={msg.imageUrl} alt="" onClick={() => onImgClick(msg.imageUrl)}
                style={{ width:'100%', maxHeight:280, objectFit:'cover', cursor:'zoom-in', borderRadius: own ? '14px 14px 0 14px' : '14px 14px 14px 0' }} />
              {msg.content && <div style={{ padding:'6px 10px 2px', fontSize:13 }}>{msg.content}</div>}
            </>
          ) : msg.content}
        </div>
        <div style={{ display:'flex', alignItems:'center', marginTop:3, paddingLeft:4, paddingRight:4 }}>
          <span style={{ fontSize:10, color:'var(--text-muted)' }}>{fmtTime(msg.createdAt)}</span>
          {own && <Tick status={msg.status} />}
        </div>
      </div>
    </div>
  );
}

function Tick({ status }) {
  return <span style={{ fontSize:11, marginLeft:4, fontWeight:700, color: status==='read' ? 'var(--accent)' : 'var(--text-muted)' }}>{status==='sent'?'✓':'✓✓'}</span>;
}

export { fmtDate };
