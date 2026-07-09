import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AlbumCard from '../components/AlbumCard';
import { Flame, Star, Sparkles, Globe, Search, User } from 'lucide-react';

export default function AlbumList({ apiEndpoint }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // --- ESTADOS DE PESQUISA ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ albuns: [], artistas: [], usuarios: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Define o visual baseado na rota atual
  const getPageConfig = () => {
    switch (location.pathname) {
      case '/trending':
        return {
          title: 'Em Alta',
          description: 'Os álbuns que estão movimentando a comunidade. Baseado no volume de reviews da última semana.',
          icon: <Flame size={48} />,
          color: '#ec8134de', 
          gradient: 'rgba(255, 124, 31, 0.14)'
        };
      case '/top-rated':
        return {
          title: 'Melhores Avaliações',
          description: 'A elite da música: estes são os álbuns com as maiores médias de todos os tempos no Scorefy.',
          icon: <Star size={48} fill="#fabf0dff" />,
          color: '#fcc00dff',
          gradient: 'rgba(248, 188, 7, 0.16)'
        };
      case '/releases':
        return {
          title: 'Novos Lançamentos',
          description: 'Fique atualizado com as novidades mais recentes que acabaram de chegar ao nosso catálogo.',
          icon: <Sparkles size={48} />,
          color: '#3b82f6',
          gradient: 'rgba(59, 131, 246, 0.21)'
        };
      default:
        return {
          title: 'Explorar',
          description: 'Descubra novos sons na nossa biblioteca completa.',
          icon: <Globe size={48} />,
          color: '#ffffff',
          gradient: 'rgba(255, 255, 255, 0.1)'
        };
    }
  };

  const config = getPageConfig();

  // Carrega os álbuns da lista da página
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000${apiEndpoint}`)
      .then(res => res.json())
      .then(data => {
        let mapped = data.map(item => ({
          id: item.id_album,
          title: item.title,
          artist: item.artist || item.nome_artista,
          image: item.image,
          rating: item.rating !== undefined ? item.rating : 0,
          year: item.year,
          genre: item.genre
        }));

        // --- CORREÇÃO DE ORDENAÇÃO ---
        if (location.pathname === '/top-rated') {
          // Ordena rigorosamente da maior nota para a menor
          mapped.sort((a, b) => b.rating - a.rating);
        } else if (location.pathname === '/releases') {
          // Ordena rigorosamente do ano mais recente para o mais antigo
          mapped.sort((a, b) => b.year - a.year);
        }

        setAlbums(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro:", err);
        setLoading(false);
      });
  }, [apiEndpoint, location.pathname]);

  // --- LÓGICA DE PESQUISA EM TEMPO REAL ---
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const delayFn = setTimeout(() => {
        fetch(`http://localhost:5000/api/busca?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setSearchResults({
              albuns: data.albuns || [],
              artistas: data.artistas || [],
              usuarios: data.usuarios || []
            });
          })
          .catch(err => console.error("Erro na busca:", err));
      }, 300);

      return () => clearTimeout(delayFn);
    } else {
      setIsSearching(false);
      setSearchResults({ albuns: [], artistas: [], usuarios: [] });
    }
  }, [searchQuery]);

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', paddingBottom: '80px' }}>
        
        {/* Passa a função onSearch para o Header capturar o texto */}
        <Header onSearch={setSearchQuery} />

        {isSearching ? (
          // --- TELA DE RESULTADOS DA PESQUISA ---
          <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>
              Resultados para "{searchQuery}"
            </h2>
            
            {/* SEÇÃO 1: ÁLBUNS */}
            {searchResults.albuns?.length > 0 && (
              <section style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '23px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Álbuns
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                  {searchResults.albuns.map(album => (
                    <AlbumCard key={album.id_album} album={{...album, id: album.id_album, rating: album.rating || 0}} />
                  ))}
                </div>
              </section>
            )}

            {/* SEÇÃO 2: ARTISTAS */}
            {searchResults.artistas?.length > 0 && (
              <section style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '23px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Artistas
                </h3>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                  {searchResults.artistas.map(art => (
                    <div 
                      key={art.id_artista} 
                      onClick={() => navigate(`/artist/${encodeURIComponent(art.name)}`)} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s', width: '180px' }} 
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{ width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#222', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                        {art.image_url ? (
                          <img src={art.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt={art.name}/>
                        ) : (
                          <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <User size={64} color="#666" />
                          </div>
                        )}
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: '17px', textAlign: 'center' }}>{art.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SEÇÃO 3: USUÁRIOS */}
            {searchResults.usuarios?.length > 0 && (
              <section style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '23px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Usuários
                </h3>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {searchResults.usuarios.map(u => (
                    <div 
                      key={u.id_user} 
                      onClick={() => navigate(`/profile/${u.username}`)} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', width: '150px' }} 
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-4px)'}} 
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateY(0)'}}
                    >
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '28px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                        {u.imagem_url && u.imagem_url !== 'default_avatar.png' ? <img src={u.imagem_url} style={{width:'100%', height:'100%', objectFit:'cover'}} alt={u.username}/> : u.username.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ textAlign: 'center', width: '100%' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.nome}</div>
                        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>@{u.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* NENHUM RESULTADO */}
            {searchResults.albuns?.length === 0 && searchResults.artistas?.length === 0 && searchResults.usuarios?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
                <Search size={48} style={{ opacity: 0.2, margin: '0 auto 16px auto' }} />
                <p style={{ fontSize: '18px' }}>Nenhum resultado encontrado para "{searchQuery}".</p>
                <p style={{ fontSize: '14px', opacity: 0.6, marginTop: '8px' }}>Tente pesquisar por outro álbum, ano, gênero ou usuário.</p>
              </div>
            )}
          </main>

        ) : (
          
          // --- TELA NORMAL DA LISTA DE ÁLBUNS ---
          <>
            {/* --- HERO HEADER --- */}
            <div style={{ 
              background: `linear-gradient(180deg, ${config.gradient} 0%, rgba(18, 18, 21, 0) 100%)`,
              padding: '64px 24px 32px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: '32px' }}>
                
                {/* Ícone grande c fundo */}
                <div style={{ 
                  padding: '24px', 
                  backgroundColor: 'rgba(255,255,255,0.05)', 
                  borderRadius: '24px', 
                  color: config.color,
                  boxShadow: `0 8px 32px -8px ${config.gradient}`,
                  backdropFilter: 'blur(10px)'
                }}>
                  {config.icon}
                </div>

                <div style={{ paddingBottom: '4px' }}>
                  <span style={{ 
                    textTransform: 'uppercase', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    letterSpacing: '0.1em', 
                    color: config.color,
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Coleção Curada
                  </span>
                  <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 12px 0', lineHeight: '1', letterSpacing: '-0.03em' }}>
                    {config.title}
                  </h1>
                  <p style={{ fontSize: '18px', color: '#9ca3af', margin: 0, maxWidth: '600px', lineHeight: '1.5' }}>
                    {config.description}
                  </p>
                </div>
              </div>
            </div>

            <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px', animation: 'fadeIn 0.3s ease-out' }}>
              
              {/* CONTADOR */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '32px',
              }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#e5e7eb' }}>
                  {loading ? 'Carregando...' : `${albums.length} Álbuns encontrados`}
                </span>
              </div>

              {/* GRID DE ÁLBUNS */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#9ca3af' }}>
                  Carregando coleção...
                </div>
              ) : (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '24px' 
                }}>
                  {albums.map((album) => (
                    <div key={album.id}>
                      <AlbumCard album={album} />
                    </div>
                  ))}
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </>
  );
}