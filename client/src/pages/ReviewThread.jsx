import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { MessageCircle, Star, StarHalf, CornerDownRight, ArrowLeft, Send } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

export default function ReviewThread() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reviewData, setReviewData] = useState(null);
  const [albumData, setAlbumData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const loggedUserId = user?.id_user;
  const loggedUsername = user?.username || user?.nome;
  const loggedUserImage = user?.imagem_url?.startsWith('http') ? user.imagem_url : `/${user?.imagem_url || 'default_avatar.png'}`;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReview();
  }, [id]);

  const fetchReview = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/reviews/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setReviewData(data.review);
          setAlbumData(data.album);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar review:", err);
        setLoading(false);
      });
  };

  const handleReplySubmit = () => {
    if (!user) return alert("Faça login para responder");
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    fetch(`http://localhost:5000/api/reviews/${id}/responder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_user: Number(loggedUserId),
        username: loggedUsername,
        texto: replyText
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsSubmitting(false);
        if (data.status === "sucesso" || data.message) {
          setReplyText('');
          fetchReview(); // recarrega a thread
        } else {
          console.error("Erro no servidor:", data);
          alert("Erro ao enviar comentário");
        }
      })
      .catch(err => {
        console.error("Erro ao enviar resposta", err);
        setIsSubmitting(false);
        alert("Erro ao enviar comentário");
      });
  };

  // faz o parse do texto pra renderizar as tags de imagem/gif no meio da string
  const renderTextWithImages = (text) => {
    const imgRegex = /(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp))/ig;
    const testRegex = /^https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp)$/i;
    
    if (!text) return null;
    const parts = text.split(imgRegex);

    return parts.map((part, i) => {
      if (testRegex.test(part)) {
        return (
          <div key={i} style={{ marginTop: '12px', marginBottom: '12px' }}>
            <img 
              src={part} 
              alt="Anexo" 
              style={{ 
                maxHeight: '120px', 
                maxWidth: '100%', 
                borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.1)',
                objectFit: 'contain'
              }} 
            />
          </div>
        );
      }
      return <span key={i} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{part}</span>;
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white' }}>
        <Header hideNav hideSearch />
        <LoadingSpinner />
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Header hideNav hideSearch />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Review não encontrada</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', paddingBottom: '80px', overflowX: 'hidden' }}>
      <Header hideNav hideSearch />

      {/* background com a capa do album e blur no topo da pagina */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50vh',
          backgroundImage: albumData?.image ? `url(${albumData.image})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(100px) brightness(0.3)',
          opacity: 0.5,
          zIndex: 0,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '850px', margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* header da thread com botao de voltar e a info do album */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            onClick={() => navigate(-1)} 
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
              transition: 'background 0.2s ease', border: '1px solid rgba(255,255,255,0.05)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <ArrowLeft size={20} />
          </div>

          {albumData && (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              onClick={() => navigate(`/album/${albumData.id_album}`)}
            >
              <img src={albumData.image} alt={albumData.title} style={{ width: '48px', height: '48px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', objectFit: 'cover' }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{albumData.title}</h2>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{albumData.artist}</span>
              </div>
            </div>
          )}
        </div>

        {/* card da review principal */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* header do usuario e nota geral */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={reviewData.imagem_url?.startsWith('http') ? reviewData.imagem_url : `/${reviewData.imagem_url || 'default_avatar.png'}`} alt={reviewData.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div 
                  onClick={() => navigate(`/profile/${reviewData.username}`)}
                  style={{ fontSize: '16px', fontWeight: '600', color: 'white', cursor: 'pointer' }}
                >
                  {reviewData.username}
                </div>
                <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                  {reviewData.data}
                </div>
              </div>
            </div>

            {reviewData.nota && (
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '4px 10px', borderRadius: '99px' }}>
                {[...Array(5)].map((_, i) => {
                  const num = i + 1;
                  if (reviewData.nota >= num) return <Star key={i} size={14} fill="#facc15" color="#facc15" />;
                  if (reviewData.nota >= num - 0.5) return <StarHalf key={i} size={14} fill="#facc15" color="#facc15" />;
                  return <Star key={i} size={14} color="#4b5563" />;
                })}
              </div>
            )}
          </div>

          {/* corpo do texto da review */}
          <div style={{ fontSize: '16px', color: '#f3f4f6', marginBottom: '20px' }}>
            {renderTextWithImages(reviewData.texto)}
          </div>

          {/* exibe o breakdown de notas por faixa se o user tiver avaliado o album a fundo */}
          {reviewData.track_ratings && reviewData.track_ratings.length > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Notas para as faixas
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reviewData.track_ratings.map((tr, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                      {tr.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="#facc15" color="#facc15" />
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#facc15' }}>{tr.nota}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* lista de respostas (thread) */}
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={20} />
            Comentários ({(reviewData.respostas || []).length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* input pra criar nova resposta */}
            {/* input pra criar nova resposta */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.015)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <img src={loggedUserImage} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Adicione um comentário à discussão..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '15px',
                    minHeight: '40px',
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    boxSizing: 'border-box'
                  }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = (e.target.scrollHeight) + 'px';
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button 
                    onClick={handleReplySubmit}
                    disabled={isSubmitting || !replyText.trim()}
                    style={{
                      background: replyText.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.05)',
                      color: replyText.trim() ? 'white' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '99px',
                      padding: '8px 24px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      boxShadow: replyText.trim() ? '0 4px 15px rgba(37, 99, 235, 0.4)' : 'none'
                    }}
                    onMouseEnter={e => { if (replyText.trim()) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { if (replyText.trim()) e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>

            {/* iterando sobre os comentarios existentes */}
            {(reviewData.respostas || []).map((resp, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  padding: '20px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.05)' 
                }}
              >
                <img 
                  src={resp.imagem_url?.startsWith('http') ? resp.imagem_url : `/${resp.imagem_url || 'default_avatar.png'}`} 
                  alt={resp.username} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} 
                  onClick={() => navigate(`/profile/${resp.username}`)}
                />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div 
                      style={{ fontWeight: 'bold', fontSize: '15px', color: 'white', cursor: 'pointer' }}
                      onClick={() => navigate(`/profile/${resp.username}`)}
                    >
                      {resp.username}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {resp.data}
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '15px', color: '#e5e7eb', lineHeight: '1.5' }}>
                    {renderTextWithImages(resp.texto)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
