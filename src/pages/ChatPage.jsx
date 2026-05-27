import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import { MessageBubble, DateDivider, TypingIndicator, fmtDate } from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import CallModal from '../components/CallModal';
import IncomingCallToast from '../components/IncomingCallToast';
import Lightbox from '../components/Lightbox';
import { Avatar } from '../components/Avatar';

export default function ChatPage({ user, token, apiUrl, onLogout, onUpdateUser }) {
  const [users,         setUsers]         = useState([]);
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [conversations, setConversations] = useState({});
  const [onlineIds,     setOnlineIds]     = useState([]);
  const [unread,        setUnread]        = useState({});
  const [lastMsgs,      setLastMsgs]      = useState({});
  const [input,         setInput]         = useState('');
  const [search,        setSearch]        = useState('');
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [uploadErr,     setUploadErr]     = useState('');
  const [lightbox,      setLightbox]      = useState(null);
  const [avatarUp,      setAvatarUp]      = useState(false);
  const [fetchingIds,   setFetchingIds]   = useState(new Set());
  const [typingFrom,    setTypingFrom]    = useState(null);
  const [call,          setCall]          = useState(null);
  const [incomingCall,  setIncomingCall]  = useState(null);

  const socketRef       = useRef(null);
  const bottomRef       = useRef(null);
  const inputRef        = useRef(null);
  const avatarInputRef  = useRef(null);
  const selectedUserRef = useRef(null);
  const typingTimer     = useRef(null);
  const isTyping        = useRef(false);

  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${apiUrl}/api/users`, { headers: authHeaders })
      .then(r => { if (r.status === 401) { onLogout(); return null; } return r.json(); })
      .then(d => { if (d && Array.isArray(d)) setUsers(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = io(apiUrl, { reconnectionAttempts: 8 });
    socketRef.current = socket;

    socket.on('connect', () => socket.emit('user-online', { userId: user.id }));
    socket.on('online-users', ids => setOnlineIds(ids));

    socket.on('new-message', msg => {
      const sid = msg.sender;
      setConversations(p => ({ ...p, [sid]: Array.isArray(p[sid]) ? [...p[sid], msg] : p[sid] }));
      setLastMsgs(p => ({ ...p, [sid]: msg }));
      if (selectedUserRef.current?._id !== sid) {
        setUnread(p => ({ ...p, [sid]: (p[sid] || 0) + 1 }));
      } else {
        socket.emit('messages-read', { senderId: sid, token });
      }
    });

    socket.on('message-sent', msg => {
      const rid = msg.receiver;
      setConversations(p => ({ ...p, [rid]: Array.isArray(p[rid]) ? [...p[rid], msg] : p[rid] }));
      setLastMsgs(p => ({ ...p, [rid]: msg }));
    });

    socket.on('messages-read', ({ byUserId }) => {
      setConversations(p => {
        const msgs = p[byUserId];
        if (!Array.isArray(msgs)) return p;
        return { ...p, [byUserId]: msgs.map(m => m.sender === user.id && m.status !== 'read' ? { ...m, status: 'read' } : m) };
      });
    });

    socket.on('typing:start', ({ from }) => {
      if (selectedUserRef.current?._id === from) setTypingFrom(from);
    });
    socket.on('typing:stop',  ({ from }) => {
      if (selectedUserRef.current?._id === from) setTypingFrom(null);
    });

    socket.on('call:incoming', ({ from, callType, offer }) => {
      const caller = users.find(u => u._id === from) || { _id: from, name: 'Someone', avatar: null };
      setIncomingCall({ caller, callType, offer });
    });

    socket.on('call:unavailable', () => {
      alert('User is not available right now');
    });

    socket.on('call:busy', () => {
      alert('User is on another call');
    });

    return () => socket.disconnect();
  }, [users]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedUser, typingFrom]);

  const loadHistory = useCallback((userId) => {
    setFetchingIds(s => new Set([...s, userId]));
    fetch(`${apiUrl}/api/messages/${userId}`, { headers: authHeaders })
      .then(r => {
        if (r.status === 401) { onLogout(); return null; }
        return r.ok ? r.json() : null;
      })
      .then(data => {
        setFetchingIds(s => { const n = new Set(s); n.delete(userId); return n; });
        if (!data) return;
        const msgs = data.messages || data;
        if (Array.isArray(msgs)) {
          setConversations(p => ({ ...p, [userId]: msgs }));
          if (msgs.length > 0) setLastMsgs(p => ({ ...p, [userId]: msgs[msgs.length - 1] }));
        }
      })
      .catch(() => {
        setFetchingIds(s => { const n = new Set(s); n.delete(userId); return n; });
      });
  }, [apiUrl, token]);

  const selectUser = (u) => {
    setSelectedUser(u);
    setUnread(p => ({ ...p, [u._id]: 0 }));
    socketRef.current?.emit('messages-read', { senderId: u._id, token });
    setTimeout(() => inputRef.current?.focus(), 80);
    if (conversations[u._id] === undefined) {
      setConversations(p => ({ ...p, [u._id]: [] }));
      loadHistory(u._id);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!selectedUser || !socketRef.current) return;
    if (!isTyping.current) {
      isTyping.current = true;
      socketRef.current.emit('typing:start', { to: selectedUser._id, from: user.id });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      socketRef.current?.emit('typing:stop', { to: selectedUser._id, from: user.id });
    }, 1500);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadErr('');
    if (!file.type.startsWith('image/')) return setUploadErr('Only image files allowed');
    if (file.size > 5 * 1024 * 1024)    return setUploadErr('Image must be under 5MB');
    setImageFile(file);
    const r = new FileReader();
    r.onload = ev => setImagePreview(ev.target.result);
    r.readAsDataURL(file);
    e.target.value = '';
  };

  const cancelImage = () => { setImageFile(null); setImagePreview(null); setUploadErr(''); };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser || !socketRef.current) return;
    setUploadErr('');
    isTyping.current = false;
    clearTimeout(typingTimer.current);
    socketRef.current.emit('typing:stop', { to: selectedUser._id, from: user.id });

    if (imageFile) {
      setUploading(true);
      try {
        const form = new FormData();
        form.append('image', imageFile);
        const res  = await fetch(`${apiUrl}/api/upload`, { method:'POST', headers: authHeaders, body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        socketRef.current.emit('send-message', { content: input.trim(), token, receiverId: selectedUser._id, messageType:'image', imageUrl: data.imageUrl });
        cancelImage(); setInput('');
      } catch (err) { setUploadErr(err.message); }
      finally { setUploading(false); }
      return;
    }

    const text = input.trim(); if (!text) return;
    socketRef.current.emit('send-message', { content: text, token, receiverId: selectedUser._id, messageType:'text' });
    setInput('');
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Only image files allowed');
    if (file.size > 3 * 1024 * 1024)    return alert('Avatar must be under 3MB');
    setAvatarUp(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res  = await fetch(`${apiUrl}/api/profile/avatar`, { method:'POST', headers: authHeaders, body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onUpdateUser({ avatar: data.user.avatar });
    } catch (err) { alert('Avatar upload failed: ' + err.message); }
    finally { setAvatarUp(false); e.target.value = ''; }
  };

  const startCall = (callType) => {
    if (!selectedUser) return;
    setCall({ peer: selectedUser, callType, mode: 'outgoing' });
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    setCall({ peer: incomingCall.caller, callType: incomingCall.callType, mode: 'incoming', offer: incomingCall.offer });
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (!incomingCall) return;
    socketRef.current?.emit('call:decline', { to: incomingCall.caller._id, from: user.id });
    setIncomingCall(null);
  };

  const sortedUsers = [...users]
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(lastMsgs[b._id]?.createdAt || 0) - new Date(lastMsgs[a._id]?.createdAt || 0));

  const currentMsgs = Array.isArray(conversations[selectedUser?._id]) ? conversations[selectedUser._id] : [];

  const buildItems = (msgs) => {
    const items = []; let lastDate = null;
    msgs.forEach((msg, i) => {
      const label = fmtDate(msg.createdAt);
      if (label !== lastDate) {
        items.push({ type:'date', label, key:`d${i}` });
        lastDate = label;
      }
      const nextMsg = msgs[i + 1];
      const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || fmtDate(nextMsg.createdAt) !== label;
      items.push({ type:'msg', msg, key: msg._id || i, grouped: !isLastInGroup });
    });
    return items;
  };

  const isOwnMsg = (msg) => msg.sender?.toString() === user.id?.toString();
  const isOnline  = (id) => onlineIds.includes(id);
  const items = buildItems(currentMsgs);

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg-base)', overflow:'hidden' }}>
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      {incomingCall && <IncomingCallToast caller={incomingCall.caller} callType={incomingCall.callType} onAccept={acceptCall} onDecline={declineCall} />}
      {call && (
        <CallModal
          socket={socketRef.current}
          user={user}
          peer={call.peer}
          callType={call.callType}
          mode={call.mode}
          offer={call.offer}
          onClose={() => setCall(null)}
        />
      )}

      <input ref={avatarInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarSelect} />

      <Sidebar
        user={user} users={sortedUsers} selectedUser={selectedUser}
        onSelect={selectUser} onLogout={onLogout}
        onAvatarClick={() => avatarInputRef.current?.click()} avatarUploading={avatarUp}
        search={search} setSearch={setSearch}
        onlineIds={onlineIds} unreadCounts={unread} lastMessages={lastMsgs}
      />

      {!selectedUser ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'var(--bg-base)' }}>
          <div style={{ width:80, height:80, borderRadius:28, background:'linear-gradient(135deg,var(--accent),var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', opacity:0.3 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:16, fontWeight:600, color:'var(--text-secondary)', margin:'0 0 6px' }}>Select a conversation</p>
            <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>Choose a person from the sidebar to start chatting</p>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg-base)' }}>
          <ChatHeader
            peer={selectedUser}
            isOnline={isOnline(selectedUser._id)}
            onVoiceCall={() => startCall('voice')}
            onVideoCall={() => startCall('video')}
          />

          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 8px', display:'flex', flexDirection:'column' }}>
            {fetchingIds.has(selectedUser._id) && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'8px 0 4px' }}>
                <div className="spinner" style={{ width:12, height:12 }} />
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Loading messages…</span>
              </div>
            )}

            {currentMsgs.length === 0 && !fetchingIds.has(selectedUser._id) ? (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                <Avatar name={selectedUser.name} src={selectedUser.avatar} size={60} />
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:'0 0 4px' }}>{selectedUser.name}</p>
                  <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>Start the conversation</p>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column' }}>
                {items.map(item => {
                  if (item.type === 'date') return <DateDivider key={item.key} label={item.label} />;
                  return (
                    <MessageBubble
                      key={item.key}
                      msg={item.msg}
                      own={isOwnMsg(item.msg)}
                      grouped={item.grouped}
                      onImgClick={setLightbox}
                    />
                  );
                })}
                {typingFrom === selectedUser._id && <TypingIndicator name={selectedUser.name} />}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <MessageInput
            inputRef={inputRef}
            value={input}
            onChange={handleInputChange}
            onSubmit={sendMessage}
            onFileSelect={handleImageSelect}
            imagePreview={imagePreview}
            onCancelImage={cancelImage}
            uploading={uploading}
            uploadErr={uploadErr}
            peerName={selectedUser.name}
          />
        </div>
      )}
    </div>
  );
}