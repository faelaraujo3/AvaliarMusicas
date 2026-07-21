import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Heart, Plus, Star, StarHalf, MessageCircle, X, Send, Pencil, Trash2, CornerDownRight, Play, Pause } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Album() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- ESTADOS ---
    const [album, setAlbum] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [artistPhoto, setArtistPhoto] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estado do Favorito
    const [isFavorite, setIsFavorite] = useState(false);

    //  Estados para Nova Review
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newReviewText, setNewReviewText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Estados para Responder Reviews
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    // Verificação de Usuário
    const currentUserId = user ? Number(user.id_user) : null;
    const hasUserReviewed = reviews.some(r => Number(r.id_user) === currentUserId);

    // Estados para Editar Reviews/Respostas
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editingReply, setEditingReply] = useState(null);
    const [editReplyText, setEditReplyText] = useState("");
    
    // Estado para Modal de Confirmação (Exclusão)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, text: '', onConfirm: null });

    // Estados para Tracklist
    const [trackAverages, setTrackAverages] = useState({});
    const [trackUserRatings, setTrackUserRatings] = useState({});
    const [trackHoverRatings, setTrackHoverRatings] = useState({});
    
    // Global Player Context
    const { activeTrack, isPlaying, playTrack } = usePlayer();

    useEffect(() => {
        fetchAlbumData();
    }, [id]);

    const fetchAlbumData = () => {
        fetch(`http://localhost:5000/api/albuns/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) return;

                const alb = data.album;
                const artistName = alb.nome_artista || alb.artist || "Desconhecido";

                setAlbum({
                    ...alb,
                    artist: artistName,
                    rating: data.nota_media || 0
                });
                setReviews(data.reviews || []);

                // Busca foto do artista
                fetch(`http://localhost:5000/api/busca?q=${encodeURIComponent(artistName)}`)
                    .then(r => r.json())
                    .then(searchData => {
                        const found = searchData.artistas.find(a => a.name.toLowerCase() === artistName.toLowerCase());
                        if (found && found.image_url) setArtistPhoto(found.image_url);
                    });
                
                // Busca track ratings
                fetch(`http://localhost:5000/api/albuns/${id}/tracks/ratings${currentUserId ? `?id_user=${currentUserId}` : ''}`)
                    .then(r => r.json())
                    .then(ratingData => {
                        setTrackAverages(ratingData.medias || {});
                        setTrackUserRatings(ratingData.user_ratings || {});
                    });

                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleRateTrack = async (trackId, nota) => {
        if (!user) return alert("Faça login para avaliar uma faixa.");
        try {
            await fetch(`http://localhost:5000/api/albuns/${id}/tracks/${trackId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_user: currentUserId, nota })
            });
            setTrackUserRatings(prev => ({ ...prev, [trackId]: nota }));
            // opcional: podiamos dar um refetch pra atualizar a media aqui, mas pra nao travar a tela a gente deixa assim
        } catch (e) {
            alert("Erro ao avaliar faixa.");
        }
    };

    const togglePlay = (track, previewUrl) => {
        if (!previewUrl) return alert("Prévia não disponível para esta faixa.");
        playTrack({
            ...track,
            album: { id: album.id_album, image: album.image },
            artist: album.artist
        });
    };

    const handleMouseMoveStar = (e, index) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - left) / width;
        const newHover = percent <= 0.5 ? index - 0.5 : index;
        setHoverRating(prev => (prev !== newHover ? newHover : prev));
    };

    const handlePostReview = () => {
        if (newReviewRating === 0) return alert("Selecione uma nota.");
        if (!user) return alert("Faça login para avaliar.");

        setSubmitting(true);
        const url = editingReviewId
            ? `http://localhost:5000/api/reviews/${editingReviewId}`
            : 'http://localhost:5000/api/reviews';
        const method = editingReviewId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_user: Number(currentUserId),
                id_album: Number(id),
                nota: newReviewRating,
                texto: newReviewText
            })
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Erro ao publicar");
                return data;
            })
            .then(() => {
                setSubmitting(false);
                setShowReviewModal(false);
                setNewReviewText("");
                setNewReviewRating(0);
                setEditingReviewId(null);
                fetchAlbumData();
            })
            .catch(err => {
                alert(err.message);
                setSubmitting(false);
            });
    };

    const handleDeleteReview = (reviewId) => {
        setConfirmModal({
            isOpen: true,
            text: "Deseja mesmo excluir esta review? Esta ação não pode ser desfeita.",
            onConfirm: () => {
                fetch(`http://localhost:5000/api/reviews/${reviewId}`, { method: 'DELETE' })
                    .then(() => fetchAlbumData());
                setConfirmModal({ isOpen: false, text: '', onConfirm: null });
            }
        });
    };

    const openEditReview = (review) => {
        setEditingReviewId(review._id);
        setNewReviewRating(review.nota);
        setNewReviewText(review.texto);
        setShowReviewModal(true);
    };

    const handleDeleteReply = (reviewId, id_user, texto) => {
        setConfirmModal({
            isOpen: true,
            text: "Excluir este comentário?",
            onConfirm: () => {
                fetch(`http://localhost:5000/api/reviews/${reviewId}/responder/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_user, texto })
                }).then(() => fetchAlbumData());
                setConfirmModal({ isOpen: false, text: '', onConfirm: null });
            }
        });
    };

    const handleSaveEditReply = (reviewId, id_user, texto_antigo) => {
        if (!editReplyText.trim()) return;
        fetch(`http://localhost:5000/api/reviews/${reviewId}/responder/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_user, texto_antigo, novo_texto: editReplyText })
        }).then(() => {
            setEditingReply(null);
            fetchAlbumData();
        });
    };

    const handleLikeReview = (reviewId) => {
        if (!user) return alert("Faça login para curtir");
        fetch(`http://localhost:5000/api/reviews/${reviewId}/curtir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_user: currentUserId, username: user.username })
        }).then(() => fetchAlbumData());
    };

    // --- NOVA LÓGICA: Curtir Comentário ---
    const handleLikeReply = (reviewId, id_resposta) => {
        if (!user) return alert("Faça login para curtir");
        if (!id_resposta) return alert("Este comentário é muito antigo e não suporta curtidas. Teste criar um novo!");

        fetch(`http://localhost:5000/api/reviews/${reviewId}/respostas/${id_resposta}/curtir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_user: currentUserId, username: user.username })
        }).then(() => fetchAlbumData());
    };

    const handlePostReply = (reviewId) => {
        if (!user) return alert("Faça login para responder");
        if (!replyText.trim()) return;

        fetch(`http://localhost:5000/api/reviews/${reviewId}/responder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_user: currentUserId, username: user.username, texto: replyText })
        }).then(() => {
            setReplyText("");
            setReplyingTo(null);
            fetchAlbumData();
        });
    };

    const renderStars = (val, size = 16) => {
        const stars = [];
        const fullStars = Math.floor(val);
        const hasHalf = val % 1 >= 0.25;
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) stars.push(<Star key={i} size={size} fill="#facc15" color="#facc15" />);
            else if (i === fullStars + 1 && hasHalf) stars.push(<StarHalf key={i} size={size} fill="#facc15" color="#facc15" />);
            else stars.push(<Star key={i} size={size} color="#374151" fill="rgba(255,255,255,0.05)" />);
        }
        return stars;
    };

    // --- FUNÇÃO MÁGICA: Transforma @username em links clicáveis azuis ---
    const renderTextWithMentions = (text) => {
        if (!text) return null;
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('@') && part.length > 1) {
                const username = part.substring(1);
                return (
                    <span
                        key={idx}
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${username}`); }}
                        style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                        {part}
                    </span>
                );
            }
            return <span key={idx}>{part}</span>;
        });
    };

    if (loading) return <LoadingSpinner />;
    if (!album) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', paddingBottom: '80px' }}>
            <Header hideNav={true} hideSearch={true} />
            
            {/* --- DYNAMIC ISLAND MOVIDA PARA GLOBAL --- */}

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80vh', backgroundImage: `url(${album.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(70px) brightness(0.4)', zIndex: 0, pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)' }} />

            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10 }}>

                {/* === HEADER DO ÁLBUM === */}
                <section style={{ display: 'flex', gap: '50px', alignItems: 'flex-end', marginBottom: '80px', flexWrap: 'wrap' }}>
                    <div style={{ width: '280px', flexShrink: 0, borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        <img src={album.image} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            {album.record_type && album.record_type === 'single' && (
                                <span style={{ background: 'white', color: 'black', fontWeight: '900', letterSpacing: '0.05em', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                                    {album.record_type}
                                </span>
                            )}
                            <span style={{ color: '#fffd8bff', fontWeight: 'bold', letterSpacing: '0.1em', fontSize: '14px', textTransform: 'uppercase' }}>{album.genre}</span>
                        </div>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 16px 0', lineHeight: '1', letterSpacing: '-0.03em' }}>{album.title}</h1>

                        {/* Artista Clicável */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div
                                onClick={() => album.id_artista && navigate(`/artist/${album.id_artista}`)}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#222', cursor: 'pointer' }}
                            >
                                {artistPhoto ? <img src={artistPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#333' }} />}
                            </div>

                            <span
                                onClick={() => album.id_artista && navigate(`/artist/${album.id_artista}`)}
                                style={{ fontSize: '20px', fontWeight: '600', opacity: 0.9, cursor: 'pointer' }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                {album.artist}
                            </span>

                            <span style={{ opacity: 0.4 }}>• {album.year}</span>
                        </div>

                        {/* DESCRIÇÃO */}
                        <p style={{ fontSize: '16px', color: '#d1d5db', lineHeight: '1.6', maxWidth: '600px', margin: '0 0 32px 0' }}>
                            {album.description || "Sem descrição disponível."}
                        </p>

                        {/* Nota e Botões */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '14px' }}>
                                {renderStars(album.rating, 22)}
                                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{album.rating}</span>
                            </div>

                            {/* Botão de Avaliar */}
                            {!loading && user && !hasUserReviewed && (
                                <button
                                    onClick={() => { setEditingReviewId(null); setNewReviewRating(0); setNewReviewText(""); setShowReviewModal(true); }}
                                    style={{ 
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                        color: 'white', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                                        padding: '12px 28px', 
                                        borderRadius: '100px', 
                                        fontWeight: 'bold', 
                                        fontSize: '15px',
                                        cursor: 'pointer', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px',
                                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                >
                                    <Plus size={20} /> Avaliar Álbum
                                </button>
                            )}

                            {!loading && !user && (
                                <span 
                                    style={{ color: '#a1a1aa', fontSize: '15px', cursor: 'pointer', borderBottom: '1px solid #a1a1aa', paddingBottom: '2px', transition: 'color 0.2s' }} 
                                    onClick={() => navigate('/login')}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderBottomColor = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderBottomColor = '#a1a1aa'; }}
                                >
                                    Faça login para avaliar
                                </span>
                            )}

                            {hasUserReviewed && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '10px 20px', borderRadius: '100px', fontWeight: 'bold' }}>
                                    ✓ Você já avaliou
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                {/* === TRACKLIST === */}
                {!loading && album.tracks && album.tracks.length > 0 && (
                    <section style={{ margin: '40px 0' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Faixas</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {album.tracks.map((track, idx) => {
                                const min = Math.floor(track.duration / 60);
                                const sec = track.duration % 60;
                                const durationStr = `${min}:${sec.toString().padStart(2, '0')}`;
                                const avgRating = trackAverages[track.id];
                                const myRating = trackUserRatings[track.id] || 0;
                                const hover = trackHoverRatings[track.id] || 0;

                                return (
                                    <div key={track.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <span style={{ color: '#a1a1aa', width: '24px', textAlign: 'right', fontWeight: 'bold' }}>{idx + 1}</span>
                                            {track.preview && (
                                                <button 
                                                    onClick={() => togglePlay(track, track.preview)} 
                                                    style={{ background: 'transparent', border: 'none', color: (activeTrack && activeTrack.id === track.id) ? '#3b82f6' : '#fff', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                                    title="Ouvir prévia"
                                                >
                                                    {(activeTrack && activeTrack.id === track.id && isPlaying) ? <Pause size={18} /> : <Play size={18} />}
                                                </button>
                                            )}
                                            <span style={{ fontWeight: '600', fontSize: '16px', color: (activeTrack && activeTrack.id === track.id) ? '#3b82f6' : '#fff' }}>{track.title}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                            {avgRating ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a1a1aa', fontSize: '14px' }}>
                                                    <Star size={14} fill="#a1a1aa" color="#a1a1aa" />
                                                    {avgRating.toFixed(1)}
                                                </div>
                                            ) : <div style={{ width: '45px' }} />}
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onMouseLeave={() => setTrackHoverRatings(prev => ({ ...prev, [track.id]: 0 }))}>
                                                {[1, 2, 3, 4, 5].map((starIdx) => {
                                                    const displayRating = hover || myRating;
                                                    const isFilled = starIdx <= displayRating;
                                                    return (
                                                        <Star 
                                                            key={starIdx} 
                                                            size={20} 
                                                            fill={isFilled ? "#fbbf24" : "transparent"} 
                                                            color={isFilled ? "#fbbf24" : "#4b5563"} 
                                                            style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                                                            onMouseEnter={() => setTrackHoverRatings(prev => ({ ...prev, [track.id]: starIdx }))}
                                                            onClick={() => handleRateTrack(track.id, starIdx)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <span style={{ color: '#a1a1aa', fontSize: '14px', width: '45px', textAlign: 'right' }}>{durationStr}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                {/* === REVIEWS === */}
                <section style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Reviews ({reviews.length})</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {reviews.length === 0 && <p style={{ color: '#6b7280' }}>Seja o primeiro a avaliar!</p>}

                        {reviews.map((review) => {
                            const isDeleted = review.excluida === true || review.texto === "Esta review foi excluída pelo autor";

                            return (
                                <div
                                    key={review._id}
                                    style={{
                                        display: 'flex', gap: '24px', padding: '32px',
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        borderRadius: '24px',
                                        transition: 'transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                                    }}
                                >
                                    {/* Foto do Usuário */}
                                    <div
                                        onClick={() => navigate(`/profile/${review.username}`)}
                                        style={{
                                            width: '48px', height: '48px', borderRadius: '50%', background: '#222',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', cursor: 'pointer', overflow: 'hidden', flexShrink: 0
                                        }}
                                    >
                                        {review.imagem_url && review.imagem_url !== 'default_avatar.png' ? (
                                            <img src={review.imagem_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={review.username} />
                                        ) : (
                                            review.username ? review.username.charAt(0).toUpperCase() : '?'
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        {/* Nome, Data e Ações da Review */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <span
                                                    onClick={() => navigate(`/profile/${review.username}`)}
                                                    style={{ fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
                                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                                >
                                                    {review.username}
                                                </span>

                                                {!isDeleted && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                                        <div style={{ display: 'flex', gap: '2px' }}>{renderStars(review.nota, 14)}</div>
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '2px 8px', borderRadius: '8px' }}>
                                                            {review.nota}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{review.data_postagem}</span>

                                                {!isDeleted && Number(review.id_user) === currentUserId && (
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button
                                                            onClick={() => openEditReview(review)}
                                                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }}
                                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                                            title="Editar Review"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReview(review._id)}
                                                            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }}
                                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                                            title="Excluir Review"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Texto da Review com marcações Mágicas (@) */}
                                        <p style={{ margin: '12px 0 0 0', lineHeight: '1.6', color: isDeleted ? '#ef4444' : '#e5e7eb', fontSize: '15px', fontStyle: isDeleted ? 'italic' : 'normal', opacity: isDeleted ? 0.8 : 1 }}>
                                            {isDeleted ? review.texto : renderTextWithMentions(review.texto)}
                                        </p>

                                        {/* Esconde os botões de curtir/responder na review principal se estiver excluída */}
                                        {!isDeleted && (
                                            <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
                                                <ActionButton
                                                    icon={<Heart size={16} fill={review.curtidas?.includes(currentUserId) ? "#ef4444" : "none"} color={review.curtidas?.includes(currentUserId) ? "#ef4444" : "#6b7280"} />}
                                                    label={review.curtidas?.length || 0}
                                                    onClick={() => handleLikeReview(review._id)}
                                                />
                                                <ActionButton
                                                    icon={<MessageCircle size={16} color="#6b7280" />}
                                                    label={review.respostas?.length || 'Responder'}
                                                    onClick={() => navigate(`/review/${review._id}`)}
                                                />
                                            </div>
                                        )}



                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            {/* MODAL */}
            {showReviewModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ background: '#121215', padding: '40px', borderRadius: '32px', width: '540px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
                        <button onClick={() => setShowReviewModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: '#a1a1aa', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}><X size={18} /></button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <img src={album.image} alt={album.title} style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }} />
                            <div>
                                <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>{editingReviewId ? 'Editar Avaliação' : 'Nova Avaliação'}</h2>
                                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '15px', fontWeight: '500' }}>{album.title} • <span style={{ opacity: 0.7 }}>{album.artist}</span></p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '20px' }}>
                            <span style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Sua Nota</span>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onMouseLeave={() => setHoverRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <div key={star} onMouseMove={(e) => handleMouseMoveStar(e, star)} onClick={() => setNewReviewRating(hoverRating || star)} style={{ cursor: 'pointer', position: 'relative', width: '44px', height: '44px' }}>
                                        <Star size={44} color="rgba(255,255,255,0.1)" fill="rgba(255,255,255,0.05)" strokeWidth={1} style={{ position: 'absolute' }} />
                                        <div style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none', width: (hoverRating || newReviewRating) >= star ? '100%' : (hoverRating || newReviewRating) >= star - 0.5 ? '50%' : '0%' }}>
                                            <Star size={44} fill="#facc15" color="#facc15" strokeWidth={0} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <textarea placeholder="Escreva o que você achou deste álbum... (opcional mas recomendado!)" value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '20px', color: 'white', fontSize: '16px', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: '1.6' }} onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'} />

                        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                            <button onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handlePostReview} disabled={submitting} style={{ flex: 2, padding: '16px', borderRadius: '16px', background: 'white', color: 'black', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Enviando...' : 'Publicar Review'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO */}
            {confirmModal.isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ background: '#161618', padding: '30px', borderRadius: '24px', width: '380px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Atenção</h3>
                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '15px' }}>{confirmModal.text}</p>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button onClick={() => setConfirmModal({ isOpen: false, text: '', onConfirm: null })} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>Cancelar</button>
                            <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#dc2626'} onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
        </div>
    );
}

function ActionButton({ icon, label, onClick }) {
    const [h, setH] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: h ? 'white' : '#666', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}>
            {icon}<span>{label}</span>
        </button>
    );
}