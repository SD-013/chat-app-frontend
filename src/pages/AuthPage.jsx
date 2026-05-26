import React, { useState } from 'react';

const S = {
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-sm)', padding: '13px 16px',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
};
const focus = e => {
  e.target.style.borderColor = 'var(--accent)';
  e.target.style.boxShadow   = '0 0 0 3px var(--accent-glow)';
};
const blur  = e => {
  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
  e.target.style.boxShadow   = 'none';
};

function PwField({ placeholder, value, onChange, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder} value={value} onChange={onChange}
        autoFocus={autoFocus} required
        style={{ ...S.input, paddingRight: 46 }}
        onFocus={focus} onBlur={blur}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', display:'flex', alignItems:'center', padding:2, transition:'color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.color='var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
        tabIndex={-1}>
        {show
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  );
}

export default function AuthPage({ apiUrl, onAuth }) {
  const [mode,   setMode]   = useState('login');
  const [name,   setName]   = useState('');
  const [email,  setEmail]  = useState('');
  const [pw,     setPw]     = useState('');
  const [pw2,    setPw2]    = useState('');
  const [error,  setError]  = useState('');
  const [loading,setLoading]= useState(false);

  const switchMode = (m) => {
    setMode(m); setError('');
    setName(''); setEmail(''); setPw(''); setPw2('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (mode === 'register') {
      if (pw.length < 6) return setError('Password must be at least 6 characters');
      if (pw !== pw2)    return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      const url  = `${apiUrl}/api/auth/${mode === 'login' ? 'login' : 'register'}`;
      const body = mode === 'login' ? { email, password: pw } : { name, email, password: pw };
      const res  = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setError(data.message || 'Something went wrong');
      onAuth(data);
    } catch {
      setError('Cannot reach the server.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(91,94,244,0.12) 0%, transparent 65%)' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div className="fade-up" style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:52, height:52, borderRadius:16, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 8px 32px var(--accent-glow-strong)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <h1 style={{ margin:'0 0 4px', fontSize:26, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.03em' }}>Chat App</h1>
          <p style={{ margin:0, fontSize:13, color:'var(--text-muted)' }}>Real-time messaging, calls & more</p>
        </div>

        <div style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'28px 28px 24px', boxShadow:'var(--shadow-lg)' }}>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-sm)', padding:3, marginBottom:22 }}>
            {[['login','Sign in'],['register','Register']].map(([k,l]) => (
              <button key={k} onClick={() => switchMode(k)}
                style={{ flex:1, padding:'9px 0', borderRadius:8, border:'none', background: mode===k ? 'var(--bg-elevated)' : 'transparent', color: mode===k ? 'var(--text-primary)' : 'var(--text-muted)', fontSize:14, fontWeight: mode===k ? 600 : 400, transition:'all 0.2s' }}>
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {mode === 'register' && (
              <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required autoFocus
                style={S.input} onFocus={focus} onBlur={blur} />
            )}
            <input type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required
              autoFocus={mode==='login'} style={S.input} onFocus={focus} onBlur={blur} />
            <PwField placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} />
            {mode==='register' && <PwField placeholder="Confirm password" value={pw2} onChange={e=>setPw2(e.target.value)} />}

            {error && (
              <div style={{ padding:'10px 14px', borderRadius:'var(--radius-sm)', background:'rgba(251,113,133,0.08)', border:'1px solid rgba(251,113,133,0.18)', color:'var(--danger)', fontSize:13, lineHeight:1.5 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ marginTop:4, height:48, background: loading ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,var(--accent),var(--accent-2))', color: loading ? 'var(--text-muted)' : 'white', border:'none', borderRadius:'var(--radius-sm)', fontSize:15, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 28px var(--accent-glow-strong)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=loading?'none':'0 4px 20px var(--accent-glow)'; }}>
              {loading ? <><div className="spinner" style={{width:16,height:16}} /> Please wait</> : (mode==='login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <p style={{ margin:'18px 0 0', textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
            {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchMode(mode==='login'?'register':'login')}
              style={{ background:'none', border:'none', color:'var(--accent)', fontWeight:600, fontSize:13, padding:0 }}>
              {mode==='login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
