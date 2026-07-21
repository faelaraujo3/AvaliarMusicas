import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { X, ArrowLeft, Send, Search, MessageCircle } from 'lucide-react';

const API = 'http://localhost:5000';



// ÍCONES SVG

// recomendar álbum
function MusicNoteIcon({ size = 16, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6"  cy="18" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}

// UTILITÁRIOS
function timeAgo(dataStr) {
  if (!dataStr) return '';
  try {
    const m = dataStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    if (!m) return dataStr;
    const date = new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]);
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60)    return 'agora';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  } catch { return dataStr; }
}

// SUB-COMPONENTES
function Avatar({ user, size = 40, onClick }) {
  const [err, setErr] = useState(false);
  const hasImg = user?.imagem_url && user.imagem_url !== 'default_avatar.png' && !err;
  if (hasImg) {
    return (
      <img
        src={user.imagem_url} alt={user?.nome || user?.username}
        onError={() => setErr(true)}
        onClick={onClick}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, cursor: onClick ? 'pointer' : 'default' }}
      />
    );
  }
  const initial = ((user?.nome || user?.username || '?')[0]).toUpperCase();
  return (
    <div 
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: '700', color: 'rgba(255,255,255,0.8)', fontSize: Math.round(size * 0.38),
        flexShrink: 0, userSelect: 'none', cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {initial}
    </div>
  );
}

function ConversaRow({ conv, currentUserId, onClick }) {
  const [hover, setHover] = useState(false);
  const { usuario, ultima_mensagem: msg, nao_lidas } = conv;
  const isOwn    = msg?.id_remetente === currentUserId;
  const rawText  = msg?.tipo === 'album' ? '🎵 Álbum recomendado' : (msg?.texto || '');
  const preview  = rawText.length > 30 ? rawText.slice(0, 30) + '…' : rawText;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: '12px', alignItems: 'center',
        padding: '9px 12px', borderRadius: '14px', cursor: 'pointer',
        background: hover ? 'rgba(255,255,255,0.05)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar user={usuario} size={44}/>
        {nao_lidas > 0 && (
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 11, height: 11, borderRadius: '50%',
            background: '#1d9bf0', border: '2px solid rgba(12,12,16,0.9)',
          }}/>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
          <span style={{ fontWeight: nao_lidas > 0 ? '700' : '600', fontSize: '13.5px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {usuario.nome}
          </span>
          <span style={{ fontSize: '10.5px', color: '#a1a1aa', fontWeight: '500', flexShrink: 0, marginLeft: 8 }}>
            {timeAgo(msg?.data)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '12.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: nao_lidas > 0 ? '#d1d5db' : '#9ca3af', fontWeight: nao_lidas > 0 ? '500' : 'normal' }}>
            {isOwn && <span style={{ color: '#a1a1aa', fontWeight: '600' }}>Você: </span>}
            {preview || <em style={{ color: '#9ca3af' }}>Sem mensagens</em>}
          </span>
          {nao_lidas > 0 && (
            <span style={{ background: '#1d9bf0', color: 'white', fontSize: '10px', fontWeight: '700', borderRadius: '99px', padding: '2px 6px', flexShrink: 0 }}>
              {nao_lidas}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function UserSearchRow({ user, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: '10px', alignItems: 'center',
        padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
        background: hover ? 'rgba(255,255,255,0.05)' : 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <Avatar user={user} size={36}/>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nome}</div>
        <div style={{ fontSize: '11.5px', color: '#9ca3af', fontWeight: '500' }}>@{user.username}</div>
      </div>
    </div>
  );
}

function AlbumMsgCard({ album, navigate }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => album?.id_album && navigate(`/album/${album.id_album}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: '11px', alignItems: 'center',
        padding: '10px 12px', borderRadius: '14px',
        cursor: album?.id_album ? 'pointer' : 'default',
        background: hover ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hover ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s', maxWidth: 240,
        transform: hover ? 'scale(1.015)' : 'scale(1)',
      }}
    >
      {album?.image && (
        <img src={album.image} alt={album.title}
          style={{ width: 48, height: 48, borderRadius: '10px', objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <MusicNoteIcon size={11} style={{ color: '#a1a1aa', flexShrink: 0 }}/>
          <span style={{ fontSize: '10px', color: '#a1a1aa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recomendação</span>
        </div>
        <div style={{ fontWeight: '700', fontSize: '13px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album?.title}</div>
        <div style={{ fontSize: '11px', color: '#71717a', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album?.artist}</div>
      </div>
    </div>
  );
}

function MsgBubble({ msg, isOwn, showAvatar, chatUser, navigate }) {
  const isAlbum = msg.tipo === 'album';
  return (
    <div style={{
      display: 'flex', gap: 8,
      flexDirection: isOwn ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      animation: 'chatMsgIn 0.2s ease-out',
    }}>
      {!isOwn && (
        <div style={{ width: 26, flexShrink: 0 }}>
          {showAvatar ? <Avatar user={chatUser} size={26}/> : null}
        </div>
      )}
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
        {isAlbum ? (
          <AlbumMsgCard album={msg.album} navigate={navigate}/>
        ) : (
          <div style={{
            padding: '9px 13px',
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isOwn
              ? 'linear-gradient(135deg, #1d9bf0 0%, #0284c7 100%)'
              : 'rgba(255,255,255,0.06)',
            backdropFilter: isOwn ? 'none' : 'blur(8px)',
            border: isOwn ? 'none' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: isOwn ? '0 2px 12px rgba(29,155,240,0.25)' : 'none',
            color: 'white', fontSize: '13.5px', lineHeight: '1.5',
            wordBreak: 'break-word', whiteSpace: 'pre-wrap',
          }}>
            {msg.texto}
          </div>
        )}
        <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '500', marginTop: 1, paddingInline: 4 }}>
          {msg.data?.split(' ')[1] || ''}
        </span>
      </div>
    </div>
  );
}

function InputIconBtn({ onClick, active, children, title }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0, padding: 0,
        background: active ? 'rgba(255,255,255,0.12)' : hover ? 'rgba(255,255,255,0.07)' : 'transparent',
        border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', color: active ? 'white' : '#6b7280',
      }}
    >
      {children}
    </button>
  );
}

// COMPONENTE PRINCIPAL
export default function ChatWidgetRoot() {
  const { user } = useAuth();
  if (!user) return null;
  return <ChatWidget />;
}

function ChatWidget() {
  const { user } = useAuth();
  const { isOpen, openChat, closeChat, pendingChatUser, setPendingChatUser, refreshUnread, unreadCount: chatUnread } = useChat();
  const navigate = useNavigate();

  const [activeChat, setActiveChat]       = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]           = useState([]);
  const [inputText, setInputText]         = useState('');
  const [showAlbum, setShowAlbum]         = useState(false);
  const [albumSearch, setAlbumSearch]     = useState('');
  const [albumResults, setAlbumResults]   = useState([]);
  const [userSearch, setUserSearch]       = useState('');
  const [userResults, setUserResults]     = useState([]);
  const [sending, setSending]             = useState(false);
  const [loadingConvs, setLoadingConvs]   = useState(false);
  const [btnHover, setBtnHover]           = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const convPollRef    = useRef(null);
  const msgPollRef     = useRef(null);
  const albumTimer     = useRef(null);
  const userTimer      = useRef(null);

  // Abre chat num usuário específico vindo do context
  useEffect(() => {
    if (pendingChatUser && isOpen) {
      handleOpenChat(pendingChatUser);
      setPendingChatUser(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingChatUser, isOpen]);

  // requests pra api 
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingConvs(p => conversations.length === 0 ? true : p);
      const res  = await fetch(`${API}/api/chat/conversas/${user.id_user}`);
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch { /* silencioso */ }
    finally { setLoadingConvs(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMessages = useCallback(async (chat) => {
    if (!user || !chat) return;
    try {
      const res  = await fetch(`${API}/api/chat/mensagens/${user.id_user}/${chat.id_user}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch { /* silencioso */ }
  }, [user]);

  // hooks de polling
  useEffect(() => {
    if (isOpen) { fetchConversations(); convPollRef.current = setInterval(fetchConversations, 10000); }
    else clearInterval(convPollRef.current);
    return () => clearInterval(convPollRef.current);
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    clearInterval(msgPollRef.current);
    if (activeChat) { fetchMessages(activeChat); msgPollRef.current = setInterval(() => fetchMessages(activeChat), 5000); }
    return () => clearInterval(msgPollRef.current);
  }, [activeChat, fetchMessages]);

  // Scroll automático
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Ações 
  const handleOpenChat = async (chatUser) => {
    setActiveChat(chatUser);
    setShowAlbum(false);
    setUserSearch('');
    setUserResults([]);
    try {
      await fetch(`${API}/api/chat/mensagens/ler/${user.id_user}/${chatUser.id_user}`, { method: 'PATCH' });
      setConversations(prev => prev.map(c => c.usuario.id_user === chatUser.id_user ? { ...c, nao_lidas: 0 } : c));
      refreshUnread();
    } catch { /* silencioso */ }
  };

  const goBack = () => {
    setActiveChat(null); setMessages([]); setInputText('');
    setShowAlbum(false);
    fetchConversations();
  };

  const sendMessage = async (extra = {}) => {
    if (!activeChat) return;
    const tipo  = extra.tipo || 'texto';
    const texto = extra.texto !== undefined ? extra.texto : inputText.trim();
    if (!texto && tipo === 'texto') return;
    setSending(true);
    try {
      const body = {
        id_remetente: user.id_user, id_destinatario: activeChat.id_user,
        texto: tipo === 'album' ? '' : texto, tipo,
        ...(extra.album && { album: extra.album }),
      };
      const res  = await fetch(`${API}/api/chat/mensagens`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const nova = await res.json();
      setMessages(prev => [...prev, nova]);
      if (tipo === 'texto') setInputText('');
    } catch { /* silencioso */ }
    finally { setSending(false); setTimeout(() => inputRef.current?.focus(), 50); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  // Busca de álbuns
  useEffect(() => {
    clearTimeout(albumTimer.current);
    if (!albumSearch.trim()) { setAlbumResults([]); return; }
    albumTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${API}/api/busca?q=${encodeURIComponent(albumSearch)}`);
        const data = await res.json();
        setAlbumResults((data.albuns || []).slice(0, 6));
      } catch { /* silencioso */ }
    }, 300);
    return () => clearTimeout(albumTimer.current);
  }, [albumSearch]);

  const sendAlbum = async (album) => {
    await sendMessage({ tipo: 'album', album });
    setShowAlbum(false); setAlbumSearch(''); setAlbumResults([]);
  };

  // Busca de usuários
  useEffect(() => {
    clearTimeout(userTimer.current);
    if (!userSearch.trim()) { setUserResults([]); return; }
    userTimer.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${API}/api/busca?q=${encodeURIComponent(userSearch)}`);
        const data = await res.json();
        setUserResults((data.usuarios || []).filter(u => u.id_user !== user.id_user).slice(0, 5));
      } catch { /* silencioso */ }
    }, 300);
    return () => clearTimeout(userTimer.current);
  }, [userSearch, user]);

  // RENDER — um único container que MORPHA de botão para painel
  return (
    <>
      <style>{`
        @keyframes chatMsgIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes chatPopIn  { from { opacity:0; transform:scale(0.9) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        .chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>

      {/* CONTAINER QUE MORPHA  */}
      <div
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        onClick={() => { if (!isOpen) openChat(); }}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width:        isOpen ? 420 : 56,
          height:       isOpen ? 560 : 56,
          borderRadius: isOpen ? 24  : 28,
          // Glassmorphism 
          background: isOpen
            ? '#111113'
            : btnHover
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(255,255,255,0.07)',
          backdropFilter:         isOpen ? 'none' : 'blur(24px)',
          WebkitBackdropFilter:   isOpen ? 'none' : 'blur(24px)',
          border: `1px solid ${isOpen ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.13)'}`,
          boxShadow: isOpen
            ? '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)'
            : btnHover
              ? '0 8px 32px rgba(0,0,0,0.35), 0 0 0 4px rgba(255,255,255,0.04)'
              : '0 4px 20px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          cursor: isOpen ? 'default' : 'pointer',
          // Transições
          transition: [
            'width 0.45s cubic-bezier(0.4,0,0.2,1)',
            'height 0.45s cubic-bezier(0.4,0,0.2,1)',
            'border-radius 0.45s cubic-bezier(0.4,0,0.2,1)',
            'background 0.3s ease',
            'border 0.3s ease',
            'box-shadow 0.25s ease',
          ].join(', '),
        }}
      >

        {/* ÍCONE DO BOTÃO */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity:   isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0.5) rotate(8deg)' : 'scale(1) rotate(0deg)',
          transition: 'opacity 0.2s ease, transform 0.25s ease',
          pointerEvents: 'none', 
          color: 'rgba(255,255,255,0.8)',
        }}>
          <MessageCircle size={22}/>
          {/* Badge de não lidas no botão fechado */}
          {chatUnread > 0 && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              width: 9, height: 9, borderRadius: '50%',
              background: '#1d9bf0', border: '2px solid rgba(12,12,16,0.7)',
            }}/>
          )}
        </div>

        {/*  PAINEL DO CHAT (visível quando aberto)  */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          opacity:       isOpen ? 1 : 0,
          transition:    `opacity 0.25s ${isOpen ? '0.18s' : '0s'} ease`,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}>

          {/*  CABEÇALHO DO PAINEL */}
          <div style={{
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
            flexShrink: 0,
          }}>
            {activeChat ? (
              <>
                <button onClick={goBack} style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', padding:6, borderRadius:'50%', display:'flex', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='#71717a'; e.currentTarget.style.background='none'; }}>
                  <ArrowLeft size={17}/>
                </button>
                <Avatar user={activeChat} size={34} onClick={() => navigate(`/profile/${activeChat.username}`)}/>
                <div style={{ flex:1, minWidth:0, cursor: 'pointer' }} onClick={() => navigate(`/profile/${activeChat.username}`)}>
                  <div style={{ fontWeight:'700', fontSize:'14.5px', color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeChat.nome}</div>
                  <div style={{ fontSize:'11.5px', color:'#9ca3af', fontWeight: '500' }}>@{activeChat.username}</div>
                </div>
                <button onClick={closeChat} style={{ background:'none', border:'none', cursor:'pointer', color:'#52525b', padding:6, borderRadius:'50%', display:'flex', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='#52525b'; e.currentTarget.style.background='none'; }}>
                  <X size={16}/>
                </button>
              </>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.6)' }}>
                  <MessageCircle size={18}/>
                </div>
                <span style={{ fontWeight:'800', fontSize:'17px', color:'white', letterSpacing:'-0.02em', flex:1 }}>
                  Mensagens
                </span>
                <button onClick={closeChat} style={{ background:'none', border:'none', cursor:'pointer', color:'#52525b', padding:6, borderRadius:'50%', display:'flex', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color='white'; e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color='#52525b'; e.currentTarget.style.background='none'; }}>
                  <X size={16}/>
                </button>
              </>
            )}
          </div>

          {/*  ÁREA DE CONTEÚDO  */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

            {/*  LISTA DE CONVERSAS  */}
            {!activeChat && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

                {/* Barra de busca */}
                <div style={{ padding:'12px 14px 8px', flexShrink:0 }}>
                  <div style={{ position:'relative' }}>
                    <Search size={13} color="#4b5563" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                    <input
                      type="text" placeholder="Buscar pessoas..."
                      value={userSearch} onChange={e => setUserSearch(e.target.value)}
                      style={{
                        width:'100%', boxSizing:'border-box',
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)',
                        borderRadius:12, padding:'9px 13px 9px 32px',
                        color:'white', fontSize:'13px', outline:'none', fontFamily:'inherit', transition:'all 0.2s',
                      }}
                      onFocus={e => { e.target.style.borderColor='rgba(255,255,255,0.2)'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                      onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.07)'; e.target.style.background='rgba(255,255,255,0.05)'; }}
                    />
                  </div>
                </div>

                {/* Resultados de busca */}
                {userSearch && (
                  <div style={{ padding:'0 8px', flexShrink:0, borderBottom: userResults.length ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    {userResults.length > 0 ? (
                      <>
                        <div style={{ fontSize:'10px', color:'#3f3f46', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.07em', padding:'4px 12px 6px' }}>
                          Iniciar conversa
                        </div>
                        {userResults.map(u => (
                          <UserSearchRow key={u.id_user} user={u} onClick={() => { openChat(); handleOpenChat(u); }}/>
                        ))}
                      </>
                    ) : (
                      <div style={{ padding:'12px', textAlign:'center', color:'#3f3f46', fontSize:'12.5px' }}>
                        Nenhum usuário encontrado
                      </div>
                    )}
                  </div>
                )}

                {/* Lista de conversas */}
                <div className="chat-scroll" style={{ flex:1, overflowY:'auto', padding:'4px 8px 8px' }}>
                  {loadingConvs && conversations.length === 0 ? (
                    <div style={{ padding:40, textAlign:'center', color:'#3f3f46', fontSize:'13px' }}>Carregando...</div>
                  ) : conversations.length === 0 && !userSearch ? (
                    <div style={{ padding:'48px 24px', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                      <div style={{ opacity:0.2, color:'white' }}><MessageCircle size={56}/></div>
                      <p style={{ fontWeight:'700', fontSize:'15px', margin:0, color:'white' }}>Nenhuma conversa ainda</p>
                      <p style={{ color:'#9ca3af', fontSize:'12.5px', margin:0, maxWidth:200, lineHeight:1.5 }}>
                        Use a busca acima para encontrar pessoas
                      </p>
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <ConversaRow key={conv.usuario.id_user} conv={conv} currentUserId={user.id_user} onClick={() => handleOpenChat(conv.usuario)}/>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ─ SALA DE CHAT  */}
            {activeChat && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

                {/* Mensagens */}
                <div className="chat-scroll" style={{ flex:1, overflowY:'auto', padding:'14px 14px', display:'flex', flexDirection:'column', gap:5 }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign:'center', padding:'36px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                      <Avatar user={activeChat} size={48} onClick={() => navigate(`/profile/${activeChat.username}`)}/>
                      <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${activeChat.username}`)}>
                        <p style={{ fontWeight:'700', fontSize:'14.5px', color:'white', margin:'0 0 3px' }}>{activeChat.nome}</p>
                        <p style={{ color:'#9ca3af', fontSize:'12px', margin:0, fontWeight: '500' }}>@{activeChat.username}</p>
                      </div>
                      <p style={{ color:'#9ca3af', fontSize:'12px', marginTop:6 }}>Diga olá! 👋</p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isOwn  = msg.id_remetente === user.id_user;
                    const prev   = messages[i - 1];
                    const showAv = !isOwn && (!prev || prev.id_remetente !== msg.id_remetente);
                    return <MsgBubble key={msg._id || i} msg={msg} isOwn={isOwn} showAvatar={showAv} chatUser={activeChat} navigate={navigate}/>;
                  })}
                  <div ref={messagesEndRef}/>
                </div>



                {/* ── PICKER DE ÁLBUM  */}
                {showAlbum && (
                  <div style={{
                    position:'absolute', bottom:68, left:10, right:10,
                    background:'rgba(14,14,18,0.95)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
                    border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, overflow:'hidden',
                    boxShadow:'0 -8px 40px rgba(0,0,0,0.6)', zIndex:20, animation:'chatPopIn 0.2s ease-out',
                  }}>
                    <div style={{ padding:'12px 12px 10px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10, color:'rgba(255,255,255,0.7)' }}>
                        <MusicNoteIcon size={15}/>
                        <span style={{ fontWeight:'700', fontSize:'13px', color:'white' }}>Recomendar Álbum</span>
                      </div>
                      <div style={{ position:'relative' }}>
                        <Search size={13} color="#4b5563" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                        <input
                          type="text" placeholder="Buscar álbum ou artista..."
                          value={albumSearch} onChange={e => setAlbumSearch(e.target.value)} autoFocus
                          style={{
                            width:'100%', boxSizing:'border-box',
                            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:10, padding:'8px 10px 8px 29px',
                            color:'white', fontSize:'13px', outline:'none', fontFamily:'inherit',
                          }}
                          onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.2)'}
                          onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.08)'}
                        />
                      </div>
                    </div>
                    <div className="chat-scroll" style={{ maxHeight:185, overflowY:'auto', padding:8 }}>
                      {!albumSearch && <div style={{ textAlign:'center', color:'#3f3f46', fontSize:'12.5px', padding:20 }}>Digite para buscar</div>}
                      {albumSearch && albumResults.length === 0 && <div style={{ textAlign:'center', color:'#3f3f46', fontSize:'12.5px', padding:20 }}>Nenhum álbum encontrado</div>}
                      {albumResults.map(album => (
                        <div key={album.id_album} onClick={() => sendAlbum(album)}
                          style={{ display:'flex', gap:10, alignItems:'center', padding:'7px 10px', borderRadius:12, cursor:'pointer', marginBottom:2, transition:'background 0.12s' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                          {album.image && <img src={album.image} alt={album.title} style={{ width:38, height:38, borderRadius:8, objectFit:'cover', flexShrink:0 }}/>}
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:'600', fontSize:'13px', color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{album.title}</div>
                            <div style={{ fontSize:'11px', color:'#52525b' }}>{album.artist}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── BARRA DE INPUT */}
                <div style={{
                  padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.06)',
                  background:'rgba(255,255,255,0.01)', flexShrink:0,
                }}>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:7 }}>
                    {/* Álbum */}
                    <InputIconBtn title="Recomendar álbum" active={showAlbum} onClick={() => setShowAlbum(v => !v)}>
                      <MusicNoteIcon size={15}/>
                    </InputIconBtn>
                    {/* Campo de texto */}
                    <textarea
                      ref={inputRef}
                      value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder="Mensagem..." rows={1}
                      style={{
                        flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:13, padding:'9px 13px', color:'white', fontSize:'13.5px',
                        resize:'none', outline:'none', fontFamily:'inherit', lineHeight:'1.4',
                        maxHeight:76, overflowY:'auto', transition:'border 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.2)'}
                      onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.08)'}
                    />
                    {/* Enviar */}
                    <button
                      onClick={() => sendMessage()}
                      disabled={sending || !inputText.trim()}
                      style={{
                        width:40, height:40, borderRadius:'50%', flexShrink:0, padding:0,
                        background: inputText.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${inputText.trim() ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        backdropFilter:'blur(8px)',
                        cursor: inputText.trim() ? 'pointer' : 'default',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color: inputText.trim() ? 'white' : '#3f3f46',
                        transition:'all 0.2s',
                        transform: inputText.trim() ? 'scale(1)' : 'scale(0.92)',
                      }}
                    >
                      <Send size={17} style={{ display:'block', flexShrink:0 }}/>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
