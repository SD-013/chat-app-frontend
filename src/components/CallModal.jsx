import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Avatar } from './Avatar';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function CallModal({ socket, user, peer, callType, mode, offer, onClose }) {
  const localRef  = useRef(null);
  const remoteRef = useRef(null);
  const pcRef     = useRef(null);
  const streamRef = useRef(null);
  const startRef  = useRef(null);

  const [status,   setStatus]   = useState(mode === 'incoming' ? 'ringing' : 'calling');
  const [duration, setDuration] = useState(0);
  const [muted,    setMuted]    = useState(false);
  const [camOff,   setCamOff]   = useState(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const closePc = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
  }, []);

  const endCall = useCallback((callStatus = 'ended') => {
    const dur = startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : 0;
    socket.emit('call:end', {
      to:       peer._id,
      from:     user.id,
      callType,
      duration: dur,
      status:   callStatus,
    });
    stopStream();
    closePc();
    onClose();
  }, [socket, peer, user, callType, stopStream, closePc, onClose]);

  const createPc = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit('call:ice-candidate', { to: peer._id, candidate });
    };

    pc.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
    };

    pc.onconnectionstatechange = () => {
      if (['failed','disconnected','closed'].includes(pc.connectionState)) endCall('ended');
    };

    return pc;
  }, [socket, peer, endCall]);

  const getMedia = useCallback(async () => {
    const constraints = callType === 'voice'
      ? { audio: true, video: false }
      : { audio: true, video: { width:1280, height:720, facingMode:'user' } };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    streamRef.current = stream;
    if (localRef.current) localRef.current.srcObject = stream;
    return stream;
  }, [callType]);

  useEffect(() => {
    let active = true;

    const initCaller = async () => {
      try {
        const stream = await getMedia();
        if (!active) return;
        const pc     = createPc();
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        const offer  = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('call:initiate', { to: peer._id, from: user.id, callType, offer });
      } catch {
        setStatus('failed');
      }
    };

    const initCallee = async () => {
      try {
        const stream = await getMedia();
        if (!active) return;
        const pc = createPc();
        stream.getTracks().forEach(t => pc.addTrack(t, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call:answer', { to: peer._id, answer });
        setStatus('connected');
        startRef.current = Date.now();
      } catch {
        setStatus('failed');
      }
    };

    if (mode === 'outgoing') initCaller();
    else initCallee();

    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onAnswered = async ({ answer }) => {
      if (!pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setStatus('connected');
        startRef.current = Date.now();
      } catch {}
    };

    const onCandidate = async ({ candidate }) => {
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); }
      catch {}
    };

    const onDeclined = () => { stopStream(); closePc(); onClose(); };
    const onEnded    = () => { stopStream(); closePc(); onClose(); };

    socket.on('call:answered',      onAnswered);
    socket.on('call:ice-candidate', onCandidate);
    socket.on('call:declined',      onDeclined);
    socket.on('call:ended',         onEnded);

    return () => {
      socket.off('call:answered',      onAnswered);
      socket.off('call:ice-candidate', onCandidate);
      socket.off('call:declined',      onDeclined);
      socket.off('call:ended',         onEnded);
    };
  }, [socket, stopStream, closePc, onClose]);

  useEffect(() => {
    if (status !== 'connected') return;
    const id = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const handleDecline = () => {
    socket.emit('call:decline', { to: peer._id, from: user.id });
    stopStream(); closePc(); onClose();
  };

  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(m => !m); }
  };

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOff(c => !c); }
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const isVideo = callType === 'video';

  return (
    <div className="fade-in" style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(4,4,12,0.97)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      {isVideo && (
        <>
          <video ref={remoteRef} autoPlay playsInline
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: status==='connected'?1:0, transition:'opacity 0.4s' }} />
          <video ref={localRef} autoPlay playsInline muted
            style={{ position:'absolute', bottom:100, right:20, width:140, height:100, objectFit:'cover', borderRadius:12, border:'2px solid rgba(255,255,255,0.15)', zIndex:2, display: status==='connected'?'block':'none' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)', zIndex:1 }} />
        </>
      )}

      <div style={{ position:'relative', zIndex:3, display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'0 20px', textAlign:'center' }}>
        <div style={{ position:'relative', marginBottom:8 }}>
          {status === 'ringing' && (
            <>
              <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'2px solid rgba(91,94,244,0.4)', animation:'ringPulse 2s ease-out infinite' }} />
              <div style={{ position:'absolute', inset:-24, borderRadius:'50%', border:'2px solid rgba(91,94,244,0.2)', animation:'ringPulse 2s ease-out 0.4s infinite' }} />
            </>
          )}
          <Avatar name={peer.name} src={peer.avatar} size={84} />
        </div>

        <div>
          <div style={{ fontSize:22, fontWeight:700, color:'white', marginBottom:4 }}>{peer.name}</div>
          <div style={{ fontSize:14, color:'rgba(255,255,255,0.6)' }}>
            {status === 'calling'   && (callType==='voice' ? 'Calling...' : 'Video calling...')}
            {status === 'ringing'   && `Incoming ${callType} call`}
            {status === 'connected' && fmt(duration)}
            {status === 'failed'    && 'Call failed'}
          </div>
        </div>
      </div>

      <div style={{ position:'absolute', bottom:48, zIndex:3, display:'flex', alignItems:'center', gap:16 }}>
        {status === 'ringing' ? (
          <>
            <CallBtn onClick={handleDecline} color="#fb7185" icon={<PhoneOff />} label="Decline" />
            <CallBtn onClick={() => { socket.emit('call:answer', { to: peer._id }); setStatus('connecting'); }} color="#34d399" icon={<PhoneOn />} label="Answer" />
          </>
        ) : (
          <>
            <CallBtn onClick={toggleMute} color={muted ? '#fbbf24' : 'rgba(255,255,255,0.12)'} icon={muted ? <MicOff /> : <Mic />} label={muted?'Unmute':'Mute'} />
            {isVideo && <CallBtn onClick={toggleCam} color={camOff ? '#fbbf24' : 'rgba(255,255,255,0.12)'} icon={camOff ? <CamOff /> : <Cam />} label={camOff?'Show cam':'Hide cam'} />}
            <CallBtn onClick={() => endCall('ended')} color="#fb7185" icon={<PhoneOff />} label="End" size={64} />
          </>
        )}
      </div>
    </div>
  );
}

function CallBtn({ onClick, color, icon, label, size=52 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <button onClick={onClick}
        style={{ width:size, height:size, borderRadius:'50%', background:color, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', transition:'transform 0.15s, filter 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.filter='brightness(1.15)'}
        onMouseLeave={e => e.currentTarget.style.filter='none'}>
        {icon}
      </button>
      <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>{label}</span>
    </div>
  );
}

const PhoneOff = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.42 19.42 0 013.43 9.19 19.79 19.79 0 01.36 .54 2 2 0 012.34-.14H5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.18 7.71a16 16 0 004.5 5.6"/><line x1="23" y1="1" x2="1" y2="23"/></svg>;
const PhoneOn  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.52 9.21 19.79 19.79 0 01.46 .54 2 2 0 012.44-.14H5.5a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.68 7.71a16 16 0 006.61 6.61l1.07-1.07a2 2 0 012.11-.45 12.84 12.84 0 002.81.7 2 2 0 011.72 2z"/></svg>;
const Mic      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>;
const MicOff   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2M19 10v2a7 7 0 01-.11 1.23M12 19v4M8 23h8"/></svg>;
const Cam      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
const CamOff   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
