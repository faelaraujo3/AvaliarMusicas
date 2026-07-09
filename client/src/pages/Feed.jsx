import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Star, StarHalf, MessageCircle, Heart, Music } from 'lucide-react';

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:5000/api/feed/${user.id_user}`)
        .then(res => res.json())
        .then(data => {
          setFeed(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Erro ao buscar feed:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Função para renderizar estrelas (ligeiramente maior agora)
  const renderStars = (val) => {
    const stars = [];
    const fullStars = Math.floor(val);
    const hasHalf = val % 1 >= 0.25;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) stars.push(<Star key={i} size={16} fill="#facc15" color="#facc15" />);
      else if (i === fullStars + 1 && hasHalf) stars.push(<StarHalf key={i} size={16} fill="#facc15" color="#facc15" />);
      else stars.push(<Star key={i} size={16} color="#52525b" fill="rgba(255,255,255,0.05)" />);
    }
    return stars;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: 'white', paddingBottom: '80px' }}>
      <Header />

      {/* Container principal mais largo (900px) */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Cabeçalho da Página com efeito Glass */}
        <div style={{ 
            marginBottom: '16px', padding: '24px', 
            borderRadius: '24px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)'
        }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.02em' }}>
                
                Seguindo
            </h1>
            <p style={{ color: '#a1a1aa', margin: 0, fontSize: '16px' }}>As avaliações mais recentes da sua bolha musical.</p>
        </div>

        {/* Estados de Loading/Vazio/Login */}
        {!user ? (
          <EmptyStateBox 
            icon={<Users size={48} />} 
            title="Faça login para ter o seu Feed"
            description="Siga os seus amigos e críticos favoritos para ver o que eles andam a ouvir."
            action={<button onClick={() => navigate('/login')} style={buttonStyle}>Fazer Login</button>}
          />
        ) : loading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px', fontSize: '18px', fontWeight: '500' }}>Carregando a sua timeline...</div>
        ) : feed.length === 0 ? (
          <EmptyStateBox 
            icon={<Music size={48} />}
            title="O seu feed está muito silencioso"
            description="Procure utilizadores na barra de pesquisa e comece a segui-los para ver as suas avaliações aqui!"
          />
        ) : (
          /* Lista de Cards do Feed */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {feed.map(item => (
              <FeedCard key={item._id} item={item} navigate={navigate} renderStars={renderStars} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- Componentes Auxiliares para manter o código limpo ---

// O novo Card de Review Moderno
function FeedCard({ item, navigate, renderStars }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onClick={() => navigate(`/album/${item.id_album}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                display: 'flex', gap: '20px', padding: '28px', 
                borderRadius: '24px',
                // Design moderno de cartão flutuante
                backgroundColor: isHovered ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                boxShadow: isHovered ? '0 10px 30px -10px rgba(0,0,0,0.5)' : 'none',
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative', overflow: 'hidden'
            }}
        >
            {/* Avatar do Autor */}
            <div 
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.autor_username}`); }}
                style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#27272a', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
            >
                {item.autor_imagem && item.autor_imagem !== 'default_avatar.png' ? (
                    <img src={item.autor_imagem} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.autor_nome} />
                ) : (
                    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', color: '#a1a1aa' }}>{item.autor_username.charAt(0).toUpperCase()}</div>
                )}
            </div>

            {/* Conteúdo do Post */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Header do Post */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    <span 
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${item.autor_username}`); }}
                        style={{ fontWeight: 'bold', fontSize: '17px', color: 'white' }}
                        onMouseEnter={e => e.target.style.textDecoration='underline'} onMouseLeave={e => e.target.style.textDecoration='none'}
                    >
                        {item.autor_nome}
                    </span>
                    <span style={{ color: '#a1a1aa', fontSize: '14px' }}>@{item.autor_username}</span>
                    <span style={{ color: '#52525b', fontSize: '14px' }}>· {item.data_postagem.split(' ')[0]}</span>
                </div>

                {/* Review Texto */}
                {item.texto && (
                    <p style={{ margin: '0', fontSize: '16px', color: '#e4e4e7', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {item.texto}
                    </p>
                )}

                {/* Card Embutido do Álbum (Efeito Glassmorphism Moderno) */}
                {item.album_info && (
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '20px', marginTop: '8px',
                        padding: '16px', borderRadius: '20px', 
                        backgroundColor: 'rgba(255,255,255,0.03)', // Fundo subtil
                        border: '1px solid rgba(255,255,255,0.08)', // Borda de vidro
                        backdropFilter: 'blur(12px)', // O efeito de vidro fosco
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                    >
                        {/* Capa do Álbum Maior */}
                        <img src={item.album_info.image} alt="Capa" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <span style={{ fontWeight: '800', fontSize: '18px', color: 'white', letterSpacing: '-0.01em' }}>{item.album_info.title}</span>
                            <span style={{ fontSize: '14px', color: '#a1a1aa' }}>{item.album_info.artist}</span>
                            
                            {/* Nota Destacada */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', backgroundColor: 'rgba(0,0,0,0.2)', width: 'fit-content', padding: '4px 10px', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>{renderStars(item.nota)}</div>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#facc15' }}>{item.nota}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botões de Interação (Feedback Visual) */}
                <div style={{ display: 'flex', gap: '24px', marginTop: '8px', color: '#71717a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}><Heart size={18} /> {item.curtidas?.length || 0}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}><MessageCircle size={18} /> {item.respostas?.length || 0}</div>
                </div>

            </div>
        </div>
    );
}

// Componente para estados vazios
function EmptyStateBox({ icon, title, description, action }) {
    return (
        <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: 'rgba(255,255,255,0.015)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ opacity: 0.3, margin: '0 auto 24px auto', display: 'flex', justifyContent: 'center' }}>
                {React.cloneElement(icon, { size: 64 })}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>{title}</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '32px', fontSize: '16px', maxWidth: '400px', marginInline: 'auto' }}>{description}</p>
            {action}
        </div>
    );
}

const buttonStyle = { background: '#3b82f6', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '99px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px -10px rgba(59, 130, 246, 0.5)' };