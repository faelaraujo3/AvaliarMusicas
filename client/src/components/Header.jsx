import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User, Flame, Globe, Sparkles, LogOut, LogIn, UserPlus, Settings, Heart, MessageCircle, SlidersHorizontal, ChevronDown, Users } from 'lucide-react';
import logoScorefy from '../assets/logoscorefy.png';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ onSearch, hideSearch, hideNav }) {
  const [inputFocus, setInputFocus] = useState(false);
  
  // --- ESTADOS DOS MENUS ---
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  
  // --- ESTADOS DE NOTIFICAÇÕES ---
  const [notifications, setNotifications] = useState([]);
  const [bellHover, setBellHover] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef(null);

  const [userAvatar, setUserAvatar] = useState(user?.imagem_url || 'default_avatar.png');

  const isActive = (path) => location.pathname === path;

  // Fecha os menus se clicar fora deles
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifMenu(false);
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilterMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/users/${user.id_user}`)
        .then(res => res.json())
        .then(data => {
          if (data.user && data.user.imagem_url) {
            setUserAvatar(data.user.imagem_url);
            
            const localData = JSON.parse(localStorage.getItem('user'));
            if (localData) {
              localData.imagem_url = data.user.imagem_url;
              localStorage.setItem('user', JSON.stringify(localData));
            }
          }
        })
        .catch(err => console.error("Erro ao buscar avatar:", err));
    }
  }, [user]);

  // --- LÓGICA DE NOTIFICAÇÕES ---
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/notificacoes/${user.id_user}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (notifId, isRead) => {
    if (isRead) return;
    try {
      await fetch(`http://localhost:5000/api/notificacoes/${notifId}/ler`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, lida: true } : n));
    } catch (error) {
      console.error("Erro ao marcar como lida", error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/login');
  };

  const toggleNotifMenu = () => {
    setShowNotifMenu(!showNotifMenu);
    if (showMenu) setShowMenu(false);
  };

  const toggleUserMenu = () => {
    setShowMenu(!showMenu);
    if (showNotifMenu) setShowNotifMenu(false);
  };

  // Aplica o filtro rápido na barra de pesquisa
  const handleQuickFilter = (term) => {
    const input = document.getElementById('search-input');
    if (input) input.value = term;
    if (onSearch) onSearch(term);
    setShowFilterMenu(false); 
  };

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50, width: '100%',
        backgroundColor: 'rgba(18, 18, 21, 0.8)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', boxSizing: 'border-box'
      }}
    >
      {/* === LOGO === */}
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 20, cursor: 'pointer' }}>
        <img src={logoScorefy} alt="Logo Scorefy" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <span style={{ fontWeight: 'bold', fontSize: '23px', letterSpacing: '-0.025em', color: 'white' }}>Scorefy</span>
      </div>

      {/* === NAVEGAÇÃO CENTRAL === */}
      {!hideNav && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', padding: '4px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'absolute', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <NavButton icon={<Globe size={18} />} label="Explorar" active={isActive('/')} onClick={() => navigate('/')} />
          <NavButton icon={<Users size={18} />} label="Seguindo" active={isActive('/feed')} onClick={() => navigate('/feed')} />
          <NavButton icon={<Sparkles size={18} />} label="Lançamentos" active={isActive('/releases')} onClick={() => navigate('/releases')} />
        </nav>
      )}

      {/* === ÁREA DIREITA === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 20 }}>
        
        {/* Busca */}
        {!hideSearch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                id="search-input"
                type="text" placeholder="Pesquisar..."
                onChange={(e) => onSearch?.(e.target.value)}
                onFocus={() => setInputFocus(true)} onBlur={() => setInputFocus(false)}
                style={{
                  backgroundColor: inputFocus ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '9999px',
                  padding: '8px 16px 8px 40px', fontSize: '14px', width: inputFocus ? '280px' : '220px',
                  color: 'white', outline: 'none', transition: 'all 0.2s ease'
                }}
              />
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: inputFocus ? 'white' : '#9ca3af', pointerEvents: 'none' }}>
                <Search size={16} />
              </div>
            </div>
            
            {/* Filtro */}
            <div style={{ position: 'relative' }} ref={filterRef}>
              <div 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                style={{ 
                  padding: '8px', borderRadius: '50%', 
                  backgroundColor: showFilterMenu ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: showFilterMenu ? 'white' : '#9ca3af', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  transition: 'all 0.2s' 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { if(!showFilterMenu) { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#9ca3af'; } }}
              >
                <SlidersHorizontal size={18} />
              </div>

              {/* Menu Dropdown de Seletores Modernos */}
              {showFilterMenu && (
                <div style={{
                  position: 'absolute', top: '48px', right: '0', width: '280px',
                  backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                  zIndex: 100, animation: 'fadeIn 0.2s ease-out', display: 'flex', flexDirection: 'column', gap: '20px'
                }}>
                  
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: 'bold' }}>
                    Filtros Rápidos
                  </h4>
                  
                  {/* Seletor de Géneros */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por Gênero</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      {['Pop', 'Rock', 'Hip Hop', 'Indie', 'Skate Punk', 'Alternative Pop', 'Pop Rock', 'Indie Rock'].map(g => (
                        <button 
                          key={g} 
                          onClick={() => handleQuickFilter(g)}
                          style={{ 
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                            color: '#e5e7eb', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'; e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e5e7eb'; }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seletor de Anos*/}
                  <div>
                    <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Por Ano</span>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) handleQuickFilter(e.target.value);
                      }}
                      style={{ 
                        width: '100%', marginTop: '10px', backgroundColor: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', color: 'white', 
                        padding: '10px 14px', borderRadius: '12px', fontSize: '14px', 
                        outline: 'none', cursor: 'pointer', display: 'block', transition: 'border 0.2s'
                      }}
                      onFocus={e => e.target.style.borderColor = '#10b981'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    >
                      <option value="" style={{ color: 'black' }}>Selecione um ano...</option>
                      {Array.from({ length: 71 }, (_, i) => 2025 - i).map(y => (
                        <option key={y} value={y} style={{ color: 'black' }}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* Notificações */}
        {user && (
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={toggleNotifMenu}
              onMouseEnter={() => setBellHover(true)}
              onMouseLeave={() => setBellHover(false)}
              style={{
                padding: '8px', borderRadius: '50%',
                backgroundColor: showNotifMenu || bellHover ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none', cursor: 'pointer', color: showNotifMenu || bellHover ? 'white' : '#9ca3af',
                position: 'relative', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '6px', right: '8px', width: '8px', height: '8px', backgroundColor: '#1d9bf0', borderRadius: '50%', border: '2px solid #121215' }} />
              )}
            </button>

            {/* BALÃO DE NOTIFICAÇÕES */}
            {showNotifMenu && (
              <div style={{
                position: 'absolute', top: '50px', right: '-10px', width: '380px',
                backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
                display: 'flex', flexDirection: 'column', zIndex: 100, overflow: 'hidden',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Notificações</h3>
                  {unreadCount > 0 && <span style={{ fontSize: '12px', color: '#1d9bf0', fontWeight: 'bold', backgroundColor: 'rgba(29, 155, 240, 0.1)', padding: '4px 8px', borderRadius: '12px' }}>{unreadCount} não lidas</span>}
                </div>
                
                <div className="custom-scrollbar" style={{ overflowY: 'auto', maxHeight: '420px', display: 'flex', flexDirection: 'column', paddingRight: '2px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7280', fontSize: '15px' }}>
                      <Bell size={32} color="#333" style={{ margin: '0 auto 12px auto' }} />
                      Você não tem novas notificações.
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const firstWord = notif.mensagem.split(' ')[0] || '?';
                      const cleanUsername = firstWord.replace('@', ''); // Tira o @ para redirecionar
                      const initial = cleanUsername.charAt(0).toUpperCase();
                      const messageRest = notif.mensagem.substring(firstWord.length);

                      // Lógica central de clique na notificação
                      const handleNotificationClick = () => {
                        // Marca como lida
                        if (!notif.lida) handleMarkAsRead(notif._id, notif.lida);
                        
                        setShowNotifMenu(false);

                        if (notif.tipo === 'follow') {
                          navigate(`/profile/${cleanUsername}`);
                        } else if (notif.tipo === 'curtida' || notif.tipo === 'resposta') {
                          
                          // Verifica se o backend salvou mesmo o id_album na notificação
                          if (notif.id_album) {
                            navigate(`/album/${notif.id_album}`);
                          } else {
                            // log pra ver o erro
                            console.error("Falta o ID do álbum nesta notificação:", notif);
                            alert("Erro de Backend: O servidor não salvou o 'id_album' nesta notificação. reinicie o servidor Python!");
                          }
                        }
                      };

                      return (
                        <div
                          key={notif._id}
                          onClick={handleNotificationClick} 
                          style={{
                            display: 'flex', gap: '12px', padding: '16px 20px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            backgroundColor: notif.lida ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                            cursor: 'pointer', transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = notif.lida ? 'transparent' : 'rgba(255, 255, 255, 0.03)')}
                        >
                          {/* Ícone de Ação Dinâmico */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '32px', flexShrink: 0, paddingTop: '4px' }}>
                            {notif.tipo === 'curtida' && <Heart size={26} fill="#f91880" color="#f91880" />}
                            {notif.tipo === 'resposta' && <MessageCircle size={26} fill="#1d9bf0" color="#1d9bf0" />}
                            {notif.tipo === 'follow' && <UserPlus size={26} color="#10b981" />}
                          </div>

                          {/* Conteúdo */}
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                            
                            {/* Avatar de quem interagiu */}
                            <div 
                              style={{ 
                                width: '32px', height: '32px', borderRadius: '50%', 
                                backgroundColor: '#222', border: '1px solid rgba(255,255,255,0.1)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                color: 'white', fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', flexShrink: 0
                              }}
                            >
                              {notif.imagem_url && notif.imagem_url !== 'default_avatar.png' ? (
                                <img src={notif.imagem_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                              ) : (
                                initial
                              )}
                            </div>

                            {/* Texto Principal da Ação */}
                            <p style={{ margin: 0, fontSize: '15px', color: notif.lida ? '#9ca3af' : '#e5e7eb', lineHeight: '1.4' }}>
                              <strong style={{ color: notif.lida ? '#d1d5db' : 'white' }}>{firstWord}</strong>
                              {messageRest}
                            </p>

                            {/* Comentário extra */}
                            {notif.tipo === 'resposta' && notif.texto_comentario && (
                              <p style={{ margin: 0, fontSize: '15px', color: '#6b7280', lineHeight: '1.4' }}>
                                {notif.texto_comentario}
                              </p>
                            )}

                            {/* Data */}
                            <span style={{ fontSize: '12px', color: '#4b5563', marginTop: '2px' }}>
                              {notif.data}
                            </span>
                          </div>
                          
                          {/* Indicador visual lateral de nova notificação */}
                          {!notif.lida && (
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1d9bf0', alignSelf: 'center', flexShrink: 0 }} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AVATAR USUÁRIO */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div
            onClick={toggleUserMenu}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              background: showMenu ? 'rgba(255,255,255,0.05)' : 'transparent',
              padding: '4px 8px 4px 4px', borderRadius: '50px', transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#222', border: '2px solid rgba(255,255,255,0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
            }}>
              {userAvatar && userAvatar !== 'default_avatar.png' ? (
                <img 
                  src={userAvatar} 
                  alt="User" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
              ) : (
                <User size={20} color={user ? 'white' : '#888'} />
              )}
            </div>
            
            {user && <span style={{ fontWeight: '600', fontSize: '14px', color: 'white', paddingRight: '4px' }}>{user.username}</span>}
          </div>

          {/* BALÃOZINHO DO USUÁRIO */}
          {showMenu && (
            <div style={{
              position: 'absolute', top: '50px', right: '0', width: '220px',
              backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 100, animation: 'fadeIn 0.2s ease-out'
            }}>
              {user ? (
                <>
                  <div style={{ padding: '8px 12px', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{user.nome}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{user.email}</p>
                  </div>
                  <MenuItem icon={<User size={16} />} label="Meu Perfil" onClick={() => navigate(`/profile/${user.username}`)} />
                  <MenuItem icon={<Settings size={16} />} label="Configurações" onClick={() => navigate('/settings')} />
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '4px 8px' }} />
                  <MenuItem icon={<LogOut size={16} />} label="Sair da conta" onClick={handleLogout} danger />
                </>
              ) : (
                <>
                  <div style={{ padding: '12px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#ccc' }}>Faça parte do Scorefy!</p>
                  </div>
                  <MenuItem icon={<LogIn size={16} />} label="Fazer Login" onClick={() => navigate('/login')} highlight />
                  <MenuItem icon={<UserPlus size={16} />} label="Cadastrar-se" onClick={() => navigate('/register')} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- ESTILOS INJETADOS AQUI --- */}
      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(-10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        
        /* SCROLLBAR CUSTOMIZADA E MODERNA */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #3f3f46; /* Cinza escuro elegante */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #52525b; /* Fica um bocadinho mais claro no hover */
        }
      `}</style>
    </header>
  );
}

function MenuItem({ icon, label, onClick, danger, highlight }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
        padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontSize: '14px', fontWeight: '500', textAlign: 'left',
        background: highlight ? (hover ? '#2563eb' : '#3b82f6') : (hover ? 'rgba(255,255,255,0.08)' : 'transparent'),
        color: highlight ? 'white' : (danger ? '#ef4444' : (hover ? 'white' : '#ccc')),
        transition: 'all 0.2s'
      }}
    >
      {icon} {label}
    </button>
  );
}

function NavButton({ icon, label, active, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const baseStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '9999px', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', border: 'none', cursor: 'pointer', outline: 'none' };
  const activeStyle = { backgroundColor: '#1a93daff', color: 'white' };
  const inactiveStyle = { backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.05)' : 'transparent', color: isHovered ? 'white' : '#9ca3af' };
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      style={{...baseStyle, ...(active ? activeStyle : inactiveStyle)}}
    >
      {icon}<span>{label}</span>
    </button>
  );
}