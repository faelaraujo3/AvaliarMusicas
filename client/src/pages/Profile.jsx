import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { User, Pencil, MapPin, Search, X, Plus, Star, StarHalf, Check, Trash2, Image as ImageIcon, Users, ListMusic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 
import { useParams, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { identifier } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    id_user: null, username: '', name: '', bio: '', location: '', imagem_url: 'default_avatar.png',
    reviews: [], seguidores: [], seguindo: [], listas: []
  });

  const [networkData, setNetworkData] = useState({ seguidores: [], seguindo: [] });
  const [networkModalType, setNetworkModalType] = useState(null);

  const isMyProfile = user && profileData.id_user && user.id_user === profileData.id_user;
  const isFollowing = user && profileData.seguidores?.includes(Number(user.id_user));

  const [topAlbumsSlots, setTopAlbumsSlots] = useState([null, null, null, null, null]);
  const [tempData, setTempData] = useState({});
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);
  const [modalSearch, setModalSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');

  // Estados de Criação de Listas
  const [createListModalOpen, setCreateListModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListDesc, setNewListDesc] = useState("");

  useEffect(() => { fetchProfile(); }, [identifier, user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let targetUserId = null;
      if (identifier) {
        const resUser = await fetch(`http://localhost:5000/api/profile/username/${identifier}`);
        if (!resUser.ok) { setLoading(false); return; }
        const dataUser = await resUser.json();
        targetUserId = dataUser.id_user;
      } else if (user) {
        targetUserId = user.id_user;
      } else {
        setLoading(false); return;
      }

      const res = await fetch(`http://localhost:5000/api/users/${targetUserId}`);
      const data = await res.json();    

      if (data.user) {
        setProfileData({
          id_user: data.user.id_user, username: data.user.username, name: data.user.nome || data.user.username,
          bio: data.user.bio || '', location: data.user.localizacao || '', imagem_url: data.user.imagem_url || 'default_avatar.png',
          reviews: data.reviews || [], seguidores: data.seguidores || [], seguindo: data.seguindo || [], listas: data.listas || []
        });
        
        setTempData({ name: data.user.nome || data.user.username, bio: data.user.bio || '', location: data.user.localizacao || '', imagem_url: data.user.imagem_url || 'default_avatar.png' });

        const slots = [null, null, null, null, null];
        if (data.favorites) data.favorites.forEach((fav, index) => { if (index < 5) slots[index] = fav; });
        setTopAlbumsSlots(slots);
        fetchNetwork(targetUserId);
      }
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  const fetchNetwork = async (userId) => {
    try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}/rede`);
        const data = await res.json();
        if(!data.error) setNetworkData(data);
    } catch (err) { console.error(err); }
  };

  const handleFollowToggle = async () => {
    if (!user) return alert("Faça login para seguir usuários.");
    
    try {
        const res = await fetch(`http://localhost:5000/api/users/${profileData.id_user}/follow`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ id_user_logado: user.id_user })
        });
        
        const data = await res.json();
        
        if (res.ok) { 
            const myId = Number(user.id_user);
            
            if (data.status === 'followed') {
               setProfileData(prev => ({
                   ...prev,
                   seguidores: Array.from(new Set([...prev.seguidores.map(Number), myId]))
               }));
            } else if (data.status === 'unfollowed') {
               setProfileData(prev => ({
                   ...prev,
                   seguidores: prev.seguidores.filter(id => Number(id) !== myId)
               }));
            }
            
            fetchNetwork(profileData.id_user); 
        }
    } catch (e) { 
        console.error(e); 
    }
  };

  const handleSaveProfile = async () => {
    const favoriteIds = topAlbumsSlots.filter(album => album !== null).map(album => album.id_album);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id_user}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: tempData.name, bio: tempData.bio, localizacao: tempData.location, imagem_url: tempData.imagem_url, albuns_favoritos: favoriteIds })
      });
      if (res.ok) {
        setProfileData(prev => ({ ...prev, name: tempData.name, bio: tempData.bio, location: tempData.location, imagem_url: tempData.imagem_url }));
        setIsEditing(false);
      } else { alert("Erro ao salvar perfil"); }
    } catch (e) { alert("Erro de conexão"); }
  };

  const handleStartEditing = () => {
    setTempData({ name: profileData.name, bio: profileData.bio, location: profileData.location, imagem_url: profileData.imagem_url });
    setIsEditing(true);
  };

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return alert("Dê um título à sua lista.");
    try {
        await fetch(`http://localhost:5000/api/users/${user.id_user}/listas`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo: newListTitle, descricao: newListDesc })
        });
        setCreateListModalOpen(false); setNewListTitle(""); setNewListDesc(""); fetchProfile();
    } catch (e) { console.error(e); }
  };

  const openSlotModal = (index) => { setActiveSlot(index); setModalSearch(''); setSearchResults([]); setModalOpen(true); };
  const selectTopAlbum = (album) => {
    const newSlots = [...topAlbumsSlots]; newSlots[activeSlot] = album;
    setTopAlbumsSlots(newSlots); setModalOpen(false); if (!isEditing) handleStartEditing();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (modalSearch.length > 2) {
        fetch(`http://localhost:5000/api/busca?q=${encodeURIComponent(modalSearch)}`).then(res => res.json()).then(data => setSearchResults(data.albuns || []));
      } else { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [modalSearch]);

  const removeTopAlbum = (e, index) => {
    e.stopPropagation();
    const newSlots = [...topAlbumsSlots]; newSlots[index] = null;
    setTopAlbumsSlots(newSlots); if (!isEditing) handleStartEditing();
  };

  const renderStars = (rating) => {
    const stars = []; const fullStars = Math.floor(rating); const hasHalf = rating % 1 >= 0.4;
    for (let i = 0; i < fullStars; i++) stars.push(<Star key={i} size={14} fill="#facc15" color="#facc15" />);
    if (hasHalf) stars.push(<StarHalf key="h" size={14} fill="#facc15" color="#facc15" />);
    return stars;
  };

  if (!user && !identifier) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Faça login para ver seu perfil.</div>;
  if (loading) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Carregando...</div>;
  if (!profileData.id_user) return <div style={{ color: 'white', padding: 40, textAlign: 'center' }}>Usuário não encontrado.</div>;

  const currentAvatar = isEditing ? tempData.imagem_url : profileData.imagem_url;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', paddingBottom: '80px' }}>
      <Header hideSearch={true} />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* HEADER PERFIL (MANTIDO) */}
        <section style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '32px', flex: 1 }}>
            <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '4px solid #18181b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                {currentAvatar && currentAvatar !== 'default_avatar.png' ? <img src={currentAvatar} style={{ width:'100%', height:'100%', objectFit:'cover'}} alt="Avatar" /> : <User size={64} color="#666" />}
              </div>
              {isEditing && (
                <div onClick={() => { setTempPhotoUrl(tempData.imagem_url === 'default_avatar.png' ? '' : tempData.imagem_url); setPhotoModalOpen(true); }} style={{ position: 'absolute', bottom: '4px', right: '4px', width: '44px', height: '44px', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.4)', transition: 'all 0.2s ease', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }} title="Alterar Foto">
                  <Pencil size={20} color="white" />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, maxWidth: '500px', paddingTop: '8px' }}>
              {!isEditing ? (
                <>
                  <div>
                    <h1 style={{ fontSize: '38px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>{profileData.name}</h1>
                    <span style={{ fontSize: '15px', color: '#9ca3af', fontWeight: '500' }}>@{profileData.username}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '4px' }}>
                      <span onClick={() => setNetworkModalType('seguindo')} style={{ cursor: 'pointer', fontSize: '15px', color: '#d1d5db', transition: 'color 0.2s' }}><strong style={{ color: 'white', fontSize: '18px' }}>{networkData.seguindo?.length || 0}</strong> Seguindo</span>
                      <span onClick={() => setNetworkModalType('seguidores')} style={{ cursor: 'pointer', fontSize: '15px', color: '#d1d5db', transition: 'color 0.2s' }}><strong style={{ color: 'white', fontSize: '18px' }}>{networkData.seguidores?.length || 0}</strong> Seguidores</span>
                  </div>
                  {profileData.bio ? <p style={{ color: '#d1d5db', lineHeight: '1.6', margin: 0, fontSize: '15px' }}>{profileData.bio}</p> : <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}></p>}
                  {profileData.location && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}><MapPin size={16} /> {profileData.location}</div>}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <input value={tempData.name} onChange={e => setTempData({...tempData, name: e.target.value})} placeholder="Seu nome" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '20px', fontWeight:'bold', outline: 'none' }} />
                  <textarea value={tempData.bio} onChange={e => setTempData({...tempData, bio: e.target.value})} placeholder="Escreva algo sobre você..." rows={3} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '15px', resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px' }}><MapPin size={18} color="#9ca3af" /><input value={tempData.location} onChange={e => setTempData({...tempData, location: e.target.value})} placeholder="Sua localização" style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', fontSize: '15px' }} /></div>
                </div>
              )}
            </div>
          </div>
          <div>
            {isMyProfile ? (
              <button onClick={() => isEditing ? handleSaveProfile() : handleStartEditing()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '9999px', backgroundColor: isEditing ? '#10b981' : 'white', border: 'none', color: isEditing ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}>
                {isEditing ? <><Check size={18} /> Salvar Alterações</> : <><Pencil size={18} /> Editar Perfil</>}
              </button>
            ) : (
              <button onClick={handleFollowToggle} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', borderRadius: '9999px', backgroundColor: isFollowing ? 'transparent' : 'white', border: isFollowing ? '1px solid rgba(255,255,255,0.3)' : 'none', color: isFollowing ? 'white' : 'black', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '15px' }}>
                {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
              </button>
            )}
          </div>
        </section>

        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* TOP 5 FAVORITOS */}
        {(isMyProfile || topAlbumsSlots.some(album => album !== null)) && (
          <section>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '24px'}}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin:0 }}>Álbuns Favoritos</h2>
              {isMyProfile && (
                <span style={{fontSize:'13px', color: isEditing ? '#10b981' : '#666'}}>
                    {isEditing ? "Modo edição ativo" : "Clique nos quadrados para editar"}
                </span>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {topAlbumsSlots.map((album, index) => {
                if (!isMyProfile && !album) return <div key={index} style={{ aspectRatio: '1/1', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }} />;
                return (
                  <div key={index} onClick={() => isMyProfile ? openSlotModal(index) : (album && navigate(`/album/${album.id_album}`))} style={{ aspectRatio: '1/1', borderRadius: '16px', backgroundColor: album ? 'transparent' : 'rgba(255,255,255,0.02)', border: album ? 'none' : '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isMyProfile || album) ? 'pointer' : 'default', position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}>
                    {album ? (
                      <>
                        <img src={album.image} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div onClick={(e) => removeTopAlbum(e, index)} className="remove-btn" style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', padding: 6, borderRadius: '50%', cursor:'pointer', display: isEditing ? 'block' : 'none' }}>
                            <Trash2 size={16} color="#ef4444" />
                        </div>
                      </>
                    ) : <Plus size={32} color="rgba(255,255,255,0.2)" />}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* --- SEÇÃO LISTAS c/ rota --- */}
        {(isMyProfile || profileData.listas.length > 0) && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Playlists</h2> 
                <span style={{ backgroundColor: 'rgba(147, 147, 177, 0.2)', color: '#ffffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>{profileData.listas.length}</span>
              </div>
              
              {isMyProfile && (
                <button 
                    onClick={() => setCreateListModalOpen(true)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <Plus size={16} /> Nova Lista
                </button>
              )}
            </div>

            {profileData.listas.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px' }}>Nenhuma lista criada ainda.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                    {profileData.listas.map(lista => {
                        const imgs = [...(lista.capas || []), null, null, null, null].slice(0, 4);
                        
                        return (
                            <div 
                                key={lista._id} 
                                onClick={() => navigate(`/playlist/${lista._id}`)} // NAVEGAÇÃO PARA NOVA ROTA AQUI
                                style={{ display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }}
                            >
                                {/* O Grid 2x2 ou Capa Personalizada */}
                                <div style={{ 
                                    aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', 
                                    display: lista.capa_personalizada ? 'block' : 'grid', 
                                    gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '2px',
                                    backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)', transition: 'transform 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {lista.capa_personalizada ? (
                                        <img src={lista.capa_personalizada} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        imgs.map((img, i) => (
                                            <div key={i} style={{ background: img ? 'transparent' : 'rgba(255,255,255,0.02)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {img ? <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ListMusic size={24} color="rgba(255,255,255,0.1)" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                                {/* Título da Lista */}
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lista.titulo}</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>{lista.albuns?.length || 0} álbuns</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
          </section>
        )}

        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* REVIEWS (MANTIDO IGUAL) */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Reviews</h2>
            <span style={{ backgroundColor: 'rgba(101, 133, 185, 0.19)', color: '#ffffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>{profileData.reviews.length}</span>
          </div>
          {profileData.reviews.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px' }}>Nenhuma review publicada ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {profileData.reviews.map(review => (
                <div key={review._id} style={{ display: 'flex', gap: '24px', padding: '24px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  {review.album_info && <div style={{ width: '100px', height: '100px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}><img src={review.album_info.image} alt="Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 onClick={() => navigate(`/album/${review.id_album}`)} style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', letterSpacing: '-0.01em', color: 'white', cursor: 'pointer' }}>{review.album_info?.title || "Álbum"}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>{renderStars(review.nota)}</div>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffffff', backgroundColor: 'rgba(49, 171, 192, 0.18)', padding: '2px 8px', borderRadius: '8px' }}>{review.nota}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#9ca3af', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px' }}>{review.data_postagem}</span>
                    </div>
                    <div style={{ marginTop: '8px' }}><p style={{ margin: 0, fontSize: '15px', color: '#e5e7eb', lineHeight: '1.6' }}>{review.texto}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL DE SEGUIDORES / SEGUINDO */}
      {networkModalType && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'fadeIn 0.1s ease-out' }}>
              <div style={{ backgroundColor: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '450px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.7)', maxHeight: '80vh' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                          {networkModalType === 'seguidores' ? 'Seguidores' : 'Seguindo'}
                      </h3>
                      <button onClick={() => setNetworkModalType(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
                  </div>

                  <div className="custom-scrollbar" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                      {networkData[networkModalType]?.length === 0 ? (
                          <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
                              <Users size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                              <p>Nada para ver aqui ainda.</p>
                          </div>
                      ) : (
                          networkData[networkModalType]?.map(person => (
                              <div 
                                  key={person.id_user} 
                                  onClick={() => {
                                      setNetworkModalType(null);
                                      navigate(`/profile/${person.username}`); 
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '16px', cursor: 'pointer', transition: 'background-color 0.2s' }} 
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} 
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {person.imagem_url && person.imagem_url !== 'default_avatar.png' ? (
                                          <img src={person.imagem_url} alt={person.username} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                      ) : ( <User size={24} color="#888" /> )}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontWeight: 'bold', fontSize: '15px', color: 'white' }}>{person.nome}</span>
                                      <span style={{ fontSize: '14px', color: '#9ca3af' }}>@{person.username}</span>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* MODAL DE BUSCAR ÁLBUM PARA FAVORITOS (MANTIDO) */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Selecionar Álbum</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input autoFocus value={modalSearch} onChange={e => setModalSearch(e.target.value)} placeholder="Digite para buscar..." style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px 14px 44px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.map(album => (
                <div key={album.id_album} onClick={() => selectTopAlbum(album)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <img src={album.image} alt={album.title} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{album.title}</div>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>{album.artist || album.nome_artista}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRIAR LISTA */}
      {createListModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ backgroundColor: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.7)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Nova Lista</h3>
                    <button onClick={() => setCreateListModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>Título da Lista</label>
                        <input autoFocus value={newListTitle} onChange={e => setNewListTitle(e.target.value)} placeholder="Ex: Meus Álbuns de Rock Favoritos" style={{ width: '100%', marginTop: '6px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>Descrição (Opcional)</label>
                        <textarea value={newListDesc} onChange={e => setNewListDesc(e.target.value)} placeholder="Fale um pouco sobre esta lista..." rows={3} style={{ width: '100%', marginTop: '6px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }} />
                    </div>
                </div>

                <button onClick={handleCreateList} style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', fontSize: '15px', border: 'none', cursor: 'pointer' }}>Criar Lista</button>
            </div>
        </div>
      )}

      {/* EDITAR FOTO DE PERFIL */}
      {photoModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ backgroundColor: '#18181c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.7)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Alterar Foto</h3>
              <button onClick={() => setPhotoModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#222', margin: '0 auto', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tempPhotoUrl ? (
                <img src={tempPhotoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; }} />
              ) : (
                <ImageIcon size={40} color="#666" />
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold' }}>URL da Imagem</label>
              <input 
                autoFocus 
                value={tempPhotoUrl} 
                onChange={e => setTempPhotoUrl(e.target.value)} 
                placeholder="https://exemplo.com/minhafoto.jpg" 
                style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} 
              />
            </div>

            <button 
              onClick={() => {
                setTempData({ ...tempData, imagem_url: tempPhotoUrl || 'default_avatar.png' });
                setPhotoModalOpen(false);
              }}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', fontSize: '15px', border: 'none', cursor: 'pointer' }}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .remove-btn { display: ${isEditing ? 'block' : 'none'}; }
        div:hover > .remove-btn { display: block; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #3f3f46; border-radius: 10px; }
      `}</style>
    </div>
  );
}