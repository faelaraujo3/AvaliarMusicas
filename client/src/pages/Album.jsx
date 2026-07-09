import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Heart, Plus, Star, StarHalf, MessageCircle, X, Send, Pencil, Trash2, CornerDownRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleMouseMoveStar = (e, index) => {
        const { left, width } = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - left) / width;
        setHoverRating(percent <= 0.5 ? index - 0.5 : index);
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
        if (!window.confirm("Deseja mesmo excluir esta review? Os comentários serão mantidos.")) return;
        fetch(`http://localhost:5000/api/reviews/${reviewId}`, { method: 'DELETE' })
            .then(() => fetchAlbumData());
    };

    const openEditReview = (review) => {
        setEditingReviewId(review._id);
        setNewReviewRating(review.nota);
        setNewReviewText(review.texto);
        setShowReviewModal(true);
    };

    const handleDeleteReply = (reviewId, id_user, texto) => {
        if (!window.confirm("Excluir este comentário?")) return;
        fetch(`http://localhost:5000/api/reviews/${reviewId}/responder/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_user, texto })
        }).then(() => fetchAlbumData());
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

    if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>;
    if (!album) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', paddingBottom: '80px' }}>
            <Header hideNav={true} hideSearch={true} />

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80vh', backgroundImage: `url(${album.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(80px) brightness(0.3)', zIndex: 0, pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 100%)' }} />

            <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 10 }}>

                {/* === HEADER DO ÁLBUM === */}
                <section style={{ display: 'flex', gap: '50px', alignItems: 'flex-end', marginBottom: '80px', flexWrap: 'wrap' }}>
                    <div style={{ width: '280px', flexShrink: 0, borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        <img src={album.image} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <span style={{ color: '#fffd8bff', fontWeight: 'bold', letterSpacing: '0.1em', fontSize: '14px', textTransform: 'uppercase' }}>{album.genre}</span>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '8px 0 16px 0', lineHeight: '1', letterSpacing: '-0.03em' }}>{album.title}</h1>

                        {/* Artista Clicável */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div
                                onClick={() => navigate(`/artist/${encodeURIComponent(album.artist)}`)}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#222', cursor: 'pointer' }}
                            >
                                {artistPhoto ? <img src={artistPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: '#333' }} />}
                            </div>

                            <span
                                onClick={() => navigate(`/artist/${encodeURIComponent(album.artist)}`)}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '14px' }}>
                                {renderStars(album.rating, 22)}
                                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{album.rating}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                {/* === REVIEWS === */}
                <section style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>Reviews ({reviews.length})</h2>

                        {!loading && user && !hasUserReviewed && (
                            <button
                                onClick={() => { setEditingReviewId(null); setNewReviewRating(0); setNewReviewText(""); setShowReviewModal(true); }}
                                style={{ background: 'white', color: 'black', border: 'none', padding: '10px 24px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Plus size={18} /> Avaliar
                            </button>
                        )}

                        {!loading && !user && (
                            <span style={{ color: '#666', fontSize: '14px', cursor: 'pointer' }} onClick={() => navigate('/login')}>
                                Faça login para avaliar
                            </span>
                        )}

                        {hasUserReviewed && (
                            <span style={{ color: '#4ade80', fontSize: '14px', fontWeight: 'bold' }}>✓ Você já avaliou</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {reviews.length === 0 && <p style={{ color: '#6b7280' }}>Seja o primeiro a avaliar!</p>}

                        {reviews.map((review) => {
                            const isDeleted = review.excluida === true || review.texto === "Esta review foi excluída pelo autor";

                            return (
                                <div
                                    key={review._id}
                                    style={{
                                        display: 'flex', gap: '20px', padding: '32px 0',
                                        borderBottom: '1px solid rgba(255,255,255,0.08)',
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
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === review._id ? null : review._id);
                                                        setReplyText(`@${review.username} `); // Pré-preenche o @ do dono da review
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Lista de Respostas (Sub-comentários) */}
                                        {review.respostas && review.respostas.length > 0 && (
                                            <div style={{ marginTop: '24px', paddingLeft: '24px', borderLeft: '2px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                                {review.respostas.map((resp, idx) => {
                                                    const isEditingThisReply = editingReply && editingReply.reviewId === review._id && editingReply.texto === resp.texto;

                                                    return (
                                                        <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                                                            <div
                                                                onClick={() => navigate(`/profile/${resp.username}`)}
                                                                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
                                                            >
                                                                {resp.imagem_url && resp.imagem_url !== 'default_avatar.png' ? (
                                                                    <img src={resp.imagem_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={resp.username} />
                                                                ) : (
                                                                    resp.username.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <span
                                                                            onClick={() => navigate(`/profile/${resp.username}`)}
                                                                            style={{ fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                                                                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                                                        >
                                                                            {resp.username}
                                                                        </span>
                                                                        <span style={{ fontSize: '11px', color: '#6b7280' }}>{resp.data}</span>
                                                                    </div>

                                                                    {/* Botões Editar / Excluir Comentário */}
                                                                    {Number(resp.id_user) === currentUserId && (
                                                                        <div style={{ display: 'flex', gap: '10px' }}>
                                                                            <button
                                                                                onClick={() => { setEditingReply({ reviewId: review._id, texto: resp.texto }); setEditReplyText(resp.texto); }}
                                                                                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }}
                                                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                                                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                                                            >
                                                                                <Pencil size={13} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteReply(review._id, resp.id_user, resp.texto)}
                                                                                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }}
                                                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                                                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                                                            >
                                                                                <Trash2 size={13} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Edição em Linha do Comentário */}
                                                                {isEditingThisReply ? (
                                                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                                        <input autoFocus value={editReplyText} onChange={(e) => setEditReplyText(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none', fontSize: '13px' }} />
                                                                        <button onClick={() => handleSaveEditReply(review._id, resp.id_user, resp.texto)} style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0 12px', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Salvar</button>
                                                                        <button onClick={() => setEditingReply(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#d1d5db', lineHeight: '1.5' }}>
                                                                            {renderTextWithMentions(resp.texto)}
                                                                        </p>
                                                                        
                                                                        {/* NOVO: Interações do Comentário (Curtir e Responder) */}
                                                                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                                                                            <button 
                                                                                onClick={() => handleLikeReply(review._id, resp.id_resposta)} 
                                                                                style={{ background: 'transparent', border: 'none', color: resp.curtidas?.includes(currentUserId) ? '#ef4444' : '#6b7280', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, transition: '0.2s' }}
                                                                                onMouseEnter={e => !resp.curtidas?.includes(currentUserId) && (e.currentTarget.style.color = 'white')}
                                                                                onMouseLeave={e => !resp.curtidas?.includes(currentUserId) && (e.currentTarget.style.color = '#6b7280')}
                                                                            >
                                                                                <Heart size={12} fill={resp.curtidas?.includes(currentUserId) ? '#ef4444' : 'none'} /> {resp.curtidas?.length || 0}
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    setReplyingTo(review._id);
                                                                                    setReplyText(`@${resp.username} `); // Pré-preenche o @ de quem comentou
                                                                                }} 
                                                                                style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, transition: '0.2s' }}
                                                                                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                                                                onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                                                                            >
                                                                                <CornerDownRight size={12} /> Responder
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* CAIXA DE RESPOSTA NOVA (Design Modernizado) */}
                                        {replyingTo === review._id && (
                                            <div 
                                                style={{ 
                                                    marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center',
                                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
                                                    borderRadius: '99px', padding: '6px 6px 6px 16px', transition: 'border 0.2s' 
                                                }}
                                                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                            >
                                                <input 
                                                    autoFocus 
                                                    placeholder="Adicione um comentário..." 
                                                    value={replyText} 
                                                    onChange={(e) => setReplyText(e.target.value)} 
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handlePostReply(review._id);
                                                    }}
                                                    style={{ 
                                                        flex: 1, background: 'transparent', border: 'none', 
                                                        color: 'white', outline: 'none', fontSize: '14px' 
                                                    }} 
                                                />
                                                <button 
                                                    onClick={() => handlePostReply(review._id)} 
                                                    disabled={!replyText.trim()}
                                                    style={{ 
                                                        background: replyText.trim() ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
                                                        border: 'none', borderRadius: '50px', width: '36px', height: '36px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: replyText.trim() ? 'white' : '#666', 
                                                        cursor: replyText.trim() ? 'pointer' : 'not-allowed', 
                                                        transition: 'all 0.2s' 
                                                    }}
                                                >
                                                    <Send size={16} style={{ marginLeft: '-2px' }} />
                                                </button>
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ background: '#161618', padding: '40px', borderRadius: '28px', width: '440px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>
                        <button onClick={() => setShowReviewModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>

                        <div style={{ textAlign: 'left' }}>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800' }}>Nova Avaliação</h2>
                            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{album.title}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} onMouseMove={(e) => handleMouseMoveStar(e, star)} onClick={() => setNewReviewRating(hoverRating || star)} style={{ cursor: 'pointer', position: 'relative', width: '36px', height: '36px' }}>
                                    <Star size={36} color="#333" fill="#333" strokeWidth={1} style={{ position: 'absolute' }} />
                                    <div style={{ position: 'absolute', overflow: 'hidden', pointerEvents: 'none', width: (hoverRating || newReviewRating) >= star ? '100%' : (hoverRating || newReviewRating) >= star - 0.5 ? '50%' : '0%' }}>
                                        <Star size={36} fill="#fbbf24" color="#fbbf24" strokeWidth={0} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <textarea placeholder="O que você achou deste álbum?" value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} style={{ width: '100%', height: '180px', background: '#222', border: '1px solid #333', borderRadius: '16px', padding: '16px', color: 'white', fontSize: '15px', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowReviewModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#222', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handlePostReview} disabled={submitting} style={{ flex: 2, padding: '14px', borderRadius: '14px', background: 'white', color: 'black', border: 'none', fontWeight: '800', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Enviando...' : 'Publicar'}</button>
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