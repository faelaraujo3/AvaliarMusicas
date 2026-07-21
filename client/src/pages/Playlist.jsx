import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { ArrowLeft, Search, Plus, Trash2, ListMusic, Pencil, X, Image as ImageIcon, Music, Play, Pause, Disc } from 'lucide-react';
import AlbumCard from '../components/AlbumCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Playlist() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { playTrack, activeTrack, isPlaying } = usePlayer();
    
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Busca de álbuns para adicionar
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    // Modal de capa
    const [coverModalOpen, setCoverModalOpen] = useState(false);
    const [tempCoverUrl, setTempCoverUrl] = useState('');

    const fetchPlaylist = () => {
        fetch(`http://localhost:5000/api/listas/${id}`)
            .then(res => {
                if(!res.ok) throw new Error("Lista não encontrada");
                return res.json();
            })
            .then(data => {
                setPlaylist(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPlaylist();
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 2) {
                const isTrackList = playlist?.tipo === 'faixa';
                const url = isTrackList 
                     ? `http://localhost:5000/api/busca/faixas?q=${encodeURIComponent(searchQuery)}`
                     : `http://localhost:5000/api/busca?q=${encodeURIComponent(searchQuery)}`;
                fetch(url)
                    .then(res => res.json())
                    .then(data => setSearchResults(isTrackList ? (data || []) : (data.albuns || [])));
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, playlist]);

    const handleAddAlbum = async (albumId) => {
        try {
            await fetch(`http://localhost:5000/api/listas/${id}/albuns`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_album: albumId })
            });
            fetchPlaylist(); 
        } catch (e) { console.error(e); }
    };

    const handleRemoveAlbum = async (albumId) => {
        try {
            await fetch(`http://localhost:5000/api/listas/${id}/albuns/${albumId}`, { method: 'DELETE' });
            fetchPlaylist();
        } catch (e) { console.error(e); }
    };

    const handleAddTrack = async (track) => {
        try {
            await fetch(`http://localhost:5000/api/listas/${id}/faixas`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ faixa: track })
            });
            fetchPlaylist(); 
        } catch (e) { console.error(e); }
    };

    const handleRemoveTrack = async (trackId) => {
        try {
            await fetch(`http://localhost:5000/api/listas/${id}/faixas/${trackId}`, { method: 'DELETE' });
            fetchPlaylist();
        } catch (e) { console.error(e); }
    };

    const handleSaveCover = async () => {
        try {
            await fetch(`http://localhost:5000/api/listas/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ capa_personalizada: tempCoverUrl })
            });
            setCoverModalOpen(false);
            fetchPlaylist();
        } catch (e) { console.error(e); }
    };

    if (loading) return <LoadingSpinner />;
    if (!playlist) return <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', padding: '100px', textAlign: 'center' }}>Playlist não encontrada.</div>;

    const isOwner = user && playlist.id_user === user.id_user;
    const isTrackList = playlist.tipo === 'faixa';
    
    // ou a capa customizada, ou o primeiro álbum/faixa da lista, ou nulo
    let backgroundImageUrl = playlist.capa_personalizada;
    if (!backgroundImageUrl) {
        if (isTrackList && playlist.faixas && playlist.faixas.length > 0) backgroundImageUrl = playlist.faixas[0].album?.image;
        else if (!isTrackList && playlist.albuns_detalhados && playlist.albuns_detalhados.length > 0) backgroundImageUrl = playlist.albuns_detalhados[0].image;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', paddingBottom: '80px', position: 'relative' }}>
            <Header hideSearch={true} />

            {/* Banner Borrado */}
            {backgroundImageUrl && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '70vh', backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(100px) brightness(0.4)', zIndex: 0, pointerEvents: 'none', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)' }} />
            )}

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '48px' }}>
                
                {/* Voltar */}
                <button onClick={() => navigate(-1)} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: 'fit-content', backdropFilter: 'blur(10px)', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}>
                    <ArrowLeft size={18} /> Voltar
                </button>

                {/* --- HEADER PLAYLIST --- */}
                <section style={{ display: 'flex', gap: '40px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    
                    {/* Capa (Grid ou Custom) */}
                    <div 
                        onClick={() => { if(isOwner) { setTempCoverUrl(playlist.capa_personalizada || ''); setCoverModalOpen(true); }}}
                        style={{ 
                            width: '280px', height: '280px', flexShrink: 0, borderRadius: '24px', overflow: 'hidden', 
                            boxShadow: '0 30px 60px rgba(0,0,0,0.6)', cursor: isOwner ? 'pointer' : 'default', position: 'relative',
                            border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#18181b', group: 'cover'
                        }}
                    >
                        {playlist.capa_personalizada ? (
                            <img src={playlist.capa_personalizada} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', width: '100%', height: '100%', gap: '2px' }}>
                                {[0,1,2,3].map(i => {
                                    const item = isTrackList ? (playlist.faixas ? playlist.faixas[i] : null) : (playlist.albuns_detalhados ? playlist.albuns_detalhados[i] : null);
                                    const imgUrl = isTrackList ? item?.album?.image : item?.image;
                                    return (
                                        <div key={i} style={{ background: imgUrl ? 'transparent' : 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {imgUrl ? <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isTrackList ? <Music size={32} color="rgba(255,255,255,0.1)" /> : <ListMusic size={32} color="rgba(255,255,255,0.1)" />)}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                        
                        {/* overlay capa edicao */}
                        {isOwner && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', backdropFilter: 'blur(4px)' }} onMouseEnter={e => e.currentTarget.style.opacity=1} onMouseLeave={e => e.currentTarget.style.opacity=0}>
                                <Pencil size={32} color="white" style={{ marginBottom: '8px' }} />
                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Editar Capa</span>
                            </div>
                        )}
                    </div>

                    {/* infos da playlist */}
                    <div style={{ flex: 1, paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ color: 'white', fontWeight: 'bold', letterSpacing: '0.1em', fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>Playlist</span>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {isTrackList ? <Music size={10} color="#3b82f6" /> : <Disc size={10} color="#a855f7" />}
                                <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{isTrackList ? 'Músicas' : 'Álbuns'}</span>
                            </div>
                        </div>
                        <h1 style={{ fontSize: '64px', fontWeight: '900', margin: '0 0 16px 0', lineHeight: '1.1', letterSpacing: '-0.03em', wordBreak: 'break-word' }}>{playlist.titulo}</h1>
                        <p style={{ fontSize: '16px', color: '#d1d5db', lineHeight: '1.6', maxWidth: '600px', margin: '0 0 24px 0' }}>{playlist.descricao || "Sem descrição disponível."}</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div onClick={() => navigate(`/profile/${playlist.criador.username}`)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 16px 6px 6px', background: 'rgba(0,0,0,0.3)', borderRadius: '99px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                                    {playlist.criador.imagem_url && playlist.criador.imagem_url !== 'default_avatar.png' ? <img src={playlist.criador.imagem_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'bold' }}>{playlist.criador.username.charAt(0).toUpperCase()}</div>}
                                </div>
                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{playlist.criador.nome}</span>
                            </div>
                            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>• {isTrackList ? (playlist.faixas?.length || 0) : (playlist.albuns?.length || 0)} {isTrackList ? (playlist.faixas?.length === 1 ? 'música' : 'músicas') : (playlist.albuns?.length === 1 ? 'álbum' : 'álbuns')}</span>
                            <span style={{ color: '#a1a1aa', fontSize: '14px' }}>• Criada em {playlist.data_criacao.split(' ')[0]}</span>
                        </div>
                    </div>
                </section>

                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                {/* --- ÁREA DE CONTEÚDO --- */}
                <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                    
                    {/* ITENS DA LISTA */}
                    <div style={{ flex: '2', minWidth: '400px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{isTrackList ? 'Músicas nesta lista' : 'Álbuns nesta lista'}</h2>
                        
                        {(isTrackList ? playlist.faixas : playlist.albuns_detalhados)?.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px' }}>Esta lista ainda está vazia.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(isTrackList ? playlist.faixas : playlist.albuns_detalhados)?.map((item, idx) => (
                                    <div key={item.id || item.id_album} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: isTrackList ? 'default' : 'pointer' }} onClick={() => { if(!isTrackList) navigate(`/album/${item.id_album}`); }}>
                                            <span style={{ color: '#6b7280', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{idx + 1}</span>
                                            
                                            <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                                                <img src={isTrackList ? item.album?.image : item.image} alt={item.title} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} />
                                                {isTrackList && (
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); playTrack(item); }}
                                                        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', opacity: (isPlaying && activeTrack?.id === item.id) ? 1 : 0 }}
                                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                        onMouseLeave={e => { if(!isPlaying || activeTrack?.id !== item.id) e.currentTarget.style.opacity = 0; }}
                                                    >
                                                        {(isPlaying && activeTrack?.id === item.id) ? <Pause size={24} fill="white" color="white" /> : <Play size={24} fill="white" color="white" />}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'white', marginBottom: '2px' }}>{item.title}</div>
                                                <div style={{ color: '#9ca3af', fontSize: '14px' }}>{item.artist} {isTrackList ? '' : `• ${item.year}`}</div>
                                            </div>
                                        </div>
                                        
                                        {isOwner && (
                                            <button 
                                                onClick={() => isTrackList ? handleRemoveTrack(item.id) : handleRemoveAlbum(item.id_album)}
                                                style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '8px', cursor: 'pointer', opacity: 0.5, transition: '0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                                title="Remover da lista"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/*  PESQUISA */}
                    {isOwner && (
                        <div style={{ flex: '1', minWidth: '300px' }}>
                            <div style={{ backgroundColor: '#18181c', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: '100px' }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>{isTrackList ? 'Adicionar Músicas' : 'Adicionar Álbuns'}</h3>
                                
                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                    <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={isTrackList ? "Procure por uma música..." : "Procure por banda ou álbum..."} style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px 12px 44px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'} onBlur={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}/>
                                </div>

                                <div className="custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                                    {searchQuery.length > 2 ? searchResults.map(item => {
                                        const isAlreadyAdded = isTrackList 
                                            ? (playlist.faixas?.some(f => f.id === item.id))
                                            : (playlist.albuns?.includes(item.id_album));
                                        
                                        const itemImage = isTrackList ? item.album?.image : item.image;
                                        const itemId = isTrackList ? item.id : item.id_album;

                                        return (
                                            <div key={itemId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                                    <img src={itemImage} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.title}</div>
                                                        <div style={{ color: '#9ca3af', fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{item.artist}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => isAlreadyAdded ? (isTrackList ? handleRemoveTrack(item.id) : handleRemoveAlbum(item.id_album)) : (isTrackList ? handleAddTrack(item) : handleAddAlbum(item.id_album))}
                                                    style={{ flexShrink: 0, background: isAlreadyAdded ? 'transparent' : '#3b82f6', border: isAlreadyAdded ? '1px solid #ef4444' : 'none', color: isAlreadyAdded ? '#ef4444' : 'white', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                                                >
                                                    {isAlreadyAdded ? 'Remover' : 'Adicionar'}
                                                </button>
                                            </div>
                                        )
                                    }) : (
                                        <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>{isTrackList ? 'Digite o nome da música ou artista.' : 'Digite o nome do álbum ou banda.'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* EDITAR CAPA */}
            {coverModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ backgroundColor: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.7)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Capa da Playlist</h3>
                            <button onClick={() => setCoverModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ width: '200px', height: '200px', margin: '0 auto', borderRadius: '16px', backgroundColor: '#222', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {tempCoverUrl ? (
                                <img src={tempCoverUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
                            ) : (
                                <ImageIcon size={48} color="#666" />
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>URL da Imagem (Opcional)</label>
                            <input autoFocus value={tempCoverUrl} onChange={e => setTempCoverUrl(e.target.value)} placeholder="Deixe em branco para usar o Grid..." style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                            <span style={{fontSize: '12px', color: '#666'}}>Se apagar a URL, a lista volta a usar o grid de 4 capas automático.</span>
                        </div>

                        <button onClick={handleSaveCover} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', fontSize: '15px', border: 'none', cursor: 'pointer' }}>Salvar Alterações</button>
                    </div>
                </div>
            )}
        </div>
    );
}