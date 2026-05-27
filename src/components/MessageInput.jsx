import React, { useRef, useState, useCallback } from 'react';
import EmojiPicker from './EmojiPicker';

export default function MessageInput({ inputRef, value, onChange, onSubmit, onFileSelect, imagePreview, onCancelImage, uploading, uploadErr, peerName }) {
  const fileRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiSelect = useCallback((emoji) => {
    const el = inputRef.current;
    if (!el) {
      onChange({ target: { value: value + emoji } });
      return;
    }
    const start = el.selectionStart ?? value.length;
    const end   = el.selectionEnd   ?? value.length;
    const next  = value.slice(0, start) + emoji + value.slice(end);
    onChange({ target: { value: next } });
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  }, [value, onChange, inputRef]);

  return (
    <div style={{ background:'var(--bg-panel)', borderTop: imagePreview ? 'none' : '1px solid var(--border)', flexShrink:0, position:'relative' }}>
      {imagePreview && (
        <div style={{ padding:'10px 18px 0', borderTop:'1px solid var(--border)' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <img src={imagePreview} alt="preview"
              style={{ maxHeight:90, maxWidth:140, borderRadius:10, objectFit:'cover' }} />
            <button onClick={onCancelImage}
              style={{ position:'absolute', top:-7, right:-7, width:20, height:20, borderRadius:'50%', background:'var(--danger)', border:'none', color:'white', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>×</button>
          </div>
          {uploadErr && <p style={{ margin:'5px 0 0', fontSize:12, color:'var(--danger)' }}>{uploadErr}</p>}
        </div>
      )}
      {!imagePreview && uploadErr && (
        <p style={{ margin:'0', padding:'8px 18px 0', fontSize:12, color:'var(--danger)' }}>{uploadErr}</p>
      )}
      <div style={{ padding:'12px 18px', position:'relative' }}>
        {showEmoji && (
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmoji(false)}
          />
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onFileSelect} />
        <form onSubmit={onSubmit} style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ width:42, height:42, borderRadius:'var(--radius-sm)', flexShrink:0, background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', color:'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', cursor:'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>

          <button type="button" onClick={() => setShowEmoji(v => !v)}
            style={{ width:42, height:42, borderRadius:'var(--radius-sm)', flexShrink:0, background: showEmoji ? 'rgba(91,94,244,0.18)' : 'rgba(255,255,255,0.04)', border: showEmoji ? '1px solid var(--accent)' : '1px solid var(--border)', color: showEmoji ? 'var(--accent)' : 'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', cursor:'pointer', fontSize:20, lineHeight:1 }}
            onMouseEnter={e => { if (!showEmoji) { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; } }}
            onMouseLeave={e => { if (!showEmoji) { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; } }}
            title="Emoji">
            😊
          </button>

          <input ref={inputRef} value={value} onChange={onChange}
            placeholder={imagePreview ? 'Add a caption…' : `Message ${peerName}…`}
            maxLength={2000}
            style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1.5px solid var(--border)', borderRadius:'var(--radius-md)', padding:'11px 16px', color:'var(--text-primary)', fontSize:14, outline:'none', transition:'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; }}
            onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }} />

          <button type="submit" disabled={(!value.trim() && !imagePreview) || uploading}
            style={{ width:42, height:42, borderRadius:'50%', background: (!value.trim() && !imagePreview) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,var(--accent),var(--accent-2))', border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: (!value.trim()&&!imagePreview)||uploading ? 0.4 : 1, cursor: (!value.trim()&&!imagePreview)||uploading ? 'not-allowed':'pointer', transition:'opacity 0.2s, transform 0.15s', boxShadow: (!value.trim()&&!imagePreview) ? 'none' : '0 2px 14px var(--accent-glow)' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform='scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; }}>
            {uploading
              ? <div className="spinner" style={{width:16,height:16}} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            }
          </button>
        </form>
      </div>
    </div>
  );
}
