import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AlbumCard from '../components/AlbumCard';
import { ArrowRight, Sparkles, Disc, Music, User, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Imagens estáticas do banner (mantidas conforme seu design)
import billieImg from '../assets/Billie.jpg';
import taylorImg from '../assets/Taylor2.jpg';
import addisonImg from '../assets/addison.png';
import logoAddison from '../assets/addisonlogo.png';
import PinkPantheress from '../assets/pinkpantheress.jpg';
import ZaraLarsson from '../assets/zarams.jpg';
import Katseye from '../assets/katseye.jpg';

export default function Home({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sections, setSections] = useState({ trending: [], top_rated: [], new_releases: [] });

  // Estados para dados reais do Backend
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pesquisa
  const [searchResults, setSearchResults] = useState({ albuns: [], artistas: [], usuarios: [] });
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // carrega as seções de albuns do backend ao montar o componente
  useEffect(() => {
    fetch('http://localhost:5000/api/home/secoes')
      .then(res => res.json())
      .then(data => {
        const format = (list) => list.map(item => ({
          id: item.id_album,
          title: item.title,
          artist: item.artist || item.nome_artista,
          image: item.image,
          rating: item.rating !== undefined ? item.rating : 0,
          year: item.year
        }));

        setSections({
          trending: format(data.trending),
          top_rated: format(data.top_rated),
          new_releases: format(data.new_releases)
        });

        // Mantém a compatibilidade com a sua variável safeAlbums caso precise
        setAlbums(format(data.trending));
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar seções:", err);
        setLoading(false);
      });
  }, []);

  // LÓGICA DE PESQUISA EM TEMPO REAL
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

  // BANNER EM CARROSSEL
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      type: 'gradient',
      bg: 'linear-gradient(90deg, #104e8bff 0%, #319fe9ff 100%)',
      badge: 'Recomendado',
      badgeColor: '#caf3f8ff',
      icon: <Sparkles size={12} />,
      title: 'Descubra um novo jeito de curtir música.',
      desc: 'Avalie, compartilhe e descubra o que seus amigos estão ouvindo em tempo real.',
      btnText: 'Começar a Avaliar',
      path: '/profile',
    },
    {
      id: 2,
      type: 'image',
      bg: billieImg,
      badge: 'Álbum em Destaque',
      badgeColor: '#5fc7f0ff',
      icon: <Disc size={12} />,
      title: 'HIT ME HARD AND SOFT',
      titleColor: '#83ecffff',
      overlay: 'linear-gradient(90deg, #0e5f94ff 0%, #11528faa 40%, rgba(11, 83, 131, 0) 60%)',
      desc: 'Confira as avaliações do álbum eleito como "Melhor da Década" pelos nossos usuários.',
      btnText: 'Visitar Álbum',
      path: '/album/45',
    },
    {
      id: 3,
      type: 'image',
      bg: PinkPantheress,
      badge: 'Em Alta',
      badgeColor: '#ffd3d0ff',
      icon: <Music size={12} />,
      title: 'FANCY THAT',
      titleColor: '#ffffffff',
      overlay: 'linear-gradient(90deg, #a50909ff 10%, #b824119d 30%, rgba(143, 11, 11, 0) 70%)',
      desc: 'É altamente ilegal ignorar esse álbum.',
      btnText: 'Visitar Álbum',
      path: '/album/67',
    },
    {
      id: 4,
      type: 'image',
      bg: taylorImg,
      badge: 'Lançamento',
      badgeColor: '#fde68a',
      icon: <Music size={12} />,
      title: 'THE LIFE OF A SHOWGIRL',
      titleColor: '#f8dfb0ff',
      overlay: 'linear-gradient(90deg, #793322ff 10%, #86352aaa 40%, rgba(92, 39, 10, 0) 80%)',
      desc: 'Confira as reações mistas da comunidade ao lançamento mais recente de Taylor Swift.',
      btnText: 'Visitar Álbum',
      path: '/album/42',
    },
    {
      id: 5,
      type: 'image',
      bg: ZaraLarsson,
      badge: 'Em Alta',
      badgeColor: '#faf88eff',
      icon: <Music size={12} />,
      title: 'Midnight Sun',
      titleColor: '#fff024ff',
      titleFont: "'Parisienne', cursive",
      titleSize: '65px',
      overlay: 'linear-gradient(90deg, #0190b4ea 10%, #2dbfca63 40%, rgba(11, 139, 143, 0) 60%)',
      desc: 'Zara Larsson traz o Pop Refrescante de verão de volta aos holofotes de um sol eterno.',
      btnText: 'Visitar Álbum',
      path: '/album/68',
    },
    {
      id: 6,
      type: 'image',
      bg: addisonImg,
      badge: 'Em Alta',
      badgeColor: '#fffdebff',
      icon: <Music size={12} />,
      title: 'ADDISON',
      titleImage: logoAddison,
      overlay: 'linear-gradient(90deg, #d1a820f3 10%, #b99328aa 40%, rgba(173, 122, 12, 0) 80%)',
      desc: 'De celebridade da internet à indicada ao Grammy, conheça o álbum da Revelação do Ano pelo Scorefy.',
      btnText: 'Visitar Álbum',
      path: '/album/48',
    },
    {
      id: 7,
      type: 'image',
      bg: Katseye,
      badge: 'Em Alta',
      badgeColor: '#faf88eff',
      icon: <Music size={12} />,
      title: 'Katseye',
      titleColor: '#fff024ff',
      titleFont: "'Dancing Script', cursive",
      titleSize: '70px',
      overlay: 'linear-gradient(90deg, #0181b42a 10%, #2d6cca1e 20%, rgba(11, 64, 143, 0) 40%)',
      desc: 'Grupo global a se conferir.',
      btnText: 'Visitar Álbum',
      path: '/album/69',
    }
  ];

  // Timer: muda o banner a cada 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          
          body { 
            margin: 0; 
            background-color: #121215; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
          }
          
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}
      </style>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#121215',
          color: 'white',
          paddingBottom: '80px',
          boxSizing: 'border-box'
        }}
      >
        <Header onSearch={setSearchQuery} user={user} onLogout={onLogout} />

        <main
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px'
          }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', color: '#9ca3af' }}>
              Carregando biblioteca...
            </div>
          ) : isSearching ? (

            // TELA DE RESULTADOS DA PESQUISA
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '32px' }}>
                Resultados para "{searchQuery}"
              </h2>

              {/* SEÇÃO 1: ÁLBUNS */}
              {searchResults.albuns?.length > 0 && (
                <section style={{ marginBottom: '56px' }}>
                  <h3 style={{ fontSize: '23px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Álbuns
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                    {searchResults.albuns.map(album => (
                      <AlbumCard key={album.id_album} album={{ ...album, id: album.id_album, rating: album.rating || 0 }} />
                    ))}
                  </div>
                </section>
              )}

              {searchResults.artistas?.length > 0 && (
                <section style={{ marginBottom: '56px' }}>
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
                            <img src={art.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={art.name} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                <section style={{ marginBottom: '56px' }}>
                  <h3 style={{ fontSize: '23px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Usuários
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {searchResults.usuarios.map(u => (
                      <div
                        key={u.id_user}
                        onClick={() => navigate(`/profile/${u.username}`)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', width: '150px' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '28px', fontWeight: 'bold', color: 'white', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }}>
                          {u.imagem_url && u.imagem_url !== 'default_avatar.png' ? <img src={u.imagem_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={u.username} /> : u.username.charAt(0).toUpperCase()}
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
            </div>
          ) : (
            <>
              {/* --- HERO SECTION (CARROSSEL) --- */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: '32px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  height: '400px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
                }}
              >
                {/* Slides */}
                {slides.map((slide, index) => {
                  const isActive = index === currentSlide;

                  return (
                    <div
                      key={slide.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: isActive ? 1 : 0,
                        transition: 'opacity 1s ease-in-out',
                        zIndex: isActive ? 10 : 0,
                        background: slide.type === 'gradient' ? slide.bg : `url(${slide.bg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '32px 48px',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* Overlay para imagens */}
                      {slide.type === 'image' && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: slide.overlay || 'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
                            zIndex: -1
                          }}
                        />
                      )}

                      {/* Conteúdo do Slide */}
                      <div style={{ position: 'relative', zIndex: 20, maxWidth: '600px' }}>

                        {/* Badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            marginBottom: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: slide.badgeColor
                          }}
                        >
                          {slide.icon} <span>{slide.badge}</span>
                        </div>

                        {/* Título */}
                        {slide.titleImage ? (
                          <div
                            role="img"
                            aria-label={slide.title}
                            style={{
                              height: '120px',
                              marginBottom: '5px',
                              width: '110%',
                              backgroundColor: slide.titleColor || '#008dc5ff',
                              maskImage: `url(${slide.titleImage})`,
                              WebkitMaskImage: `url(${slide.titleImage})`,
                              maskSize: 'contain',
                              WebkitMaskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              WebkitMaskRepeat: 'no-repeat',
                              maskPosition: 'left center',
                              WebkitMaskPosition: 'left center'
                            }}
                          />
                        ) : (
                          <h1
                            style={{
                              fontSize: slide.titleSize || '40px',
                              fontFamily: slide.titleFont || 'inherit',
                              color: slide.titleColor || 'white',
                              fontWeight: slide.titleFont ? '700' : '900',
                              marginBottom: '12px',
                              lineHeight: 1.1,
                              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            {slide.title}
                          </h1>
                        )}

                        {/* Descrição */}
                        <p
                          style={{
                            color: '#e5e7eb',
                            marginBottom: '24px',
                            fontSize: '16px',
                            maxWidth: '480px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                          }}
                        >
                          {slide.desc}
                        </p>

                        {/* Botão */}
                        <HeroButton text={slide.btnText} path={slide.path} />
                      </div>

                      {/* Decoração para o slide Gradiente */}
                      {slide.type === 'gradient' && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '400px',
                            height: '400px',
                            borderRadius: '50%',
                            filter: 'blur(80px)',
                            transform: 'translate(33%, -50%)',
                            pointerEvents: 'none',
                            background: 'rgba(99, 102, 241, 0.2)'
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Navegação do banner */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 30
                  }}
                >
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backgroundColor: idx === currentSlide ? 'white' : 'rgba(255, 255, 255, 0.3)',
                        transform: idx === currentSlide ? 'scale(1.2)' : 'scale(1)',
                        padding: 0
                      }}
                      aria-label={`Ir para slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Seções dinâmicas com dados do banco */}
              <SectionRow title="Em Alta" albums={sections.trending} path="/trending" />
              <SectionRow title="Melhores Avaliações" albums={sections.top_rated} path="/top-rated" />
              <SectionRow title="Novos Lançamentos" albums={sections.new_releases} path="/releases" />
            </>
          )}
        </main>
      </div>
    </>
  );
}

function HeroButton({ text, path }) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        backgroundColor: 'white',
        color: 'black',
        padding: '12px 32px',
        borderRadius: '9999px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer',
        transform: hover ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.2s',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {text}
    </button>
  );
}

function SectionRow({ title, albums, path }) {
  const [btnHover, setBtnHover] = useState(false);
  const navigate = useNavigate();

  if (!albums || albums.length === 0) return null;

  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
          {title}
        </h2>

        <button
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          onClick={() => navigate(path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: btnHover ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '8px 16px',
            borderRadius: '100px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease'
          }}
        >
          Ver Mais
          <div style={{ transform: btnHover ? 'translateX(2px)' : 'translateX(0)', transition: 'transform 0.2s', display: 'flex' }}>
            <ArrowRight size={14} />
          </div>
        </button>
      </div>

      <div
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '16px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        {albums.map((album, index) => (
          <div key={`${album.id}-${index}`} style={{ scrollSnapAlign: 'start' }}>
            <AlbumCard album={album} />
          </div>
        ))}
      </div>
    </section>
  );
}