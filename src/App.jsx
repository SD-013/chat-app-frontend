import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/health`).catch(() => {});
  }, []);

  useEffect(() => {
    const t = localStorage.getItem('ca_token');
    const u = localStorage.getItem('ca_user');
    if (t && u) {
      try { setToken(t); setUser(JSON.parse(u)); }
      catch { localStorage.removeItem('ca_token'); localStorage.removeItem('ca_user'); }
    }
    setLoading(false);
  }, []);

  const handleAuth = ({ token, user }) => {
    localStorage.setItem('ca_token', token);
    localStorage.setItem('ca_user',  JSON.stringify(user));
    setToken(token); setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('ca_token');
    localStorage.removeItem('ca_user');
    setToken(null); setUser(null);
  };

  const handleUpdateUser = (updates) => {
    const next = { ...user, ...updates };
    setUser(next);
    localStorage.setItem('ca_user', JSON.stringify(next));
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)' }}>
      <div className="spinner" />
    </div>
  );

  if (user && token)
    return <ChatPage user={user} token={token} apiUrl={API_URL} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
  return <AuthPage apiUrl={API_URL} onAuth={handleAuth} />;
}
