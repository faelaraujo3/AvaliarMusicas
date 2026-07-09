import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AlbumCard from '../components/AlbumCard';
import { BadgeCheck, User, Disc, Star, MapPin, Music } from 'lucide-react';

export default function Artist() {
  const { artistName } = useParams();
  const navigate = useNavigate();
  
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  const decodedName = decodeURIComponent(artistName);

useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/busca?q=${encodeURIComponent(decodedName)}`)
      .then(res => res.json())
      .then(async data => {
        const foundArtist = data.artistas.find(
          a => a.name.toLowerCase() === decodedName.toLowerCase()
        );

        if (foundArtist) {
          setArtist(foundArtist);

          // filtra os álbuns do artista
          const artistAlbumsRaw = data.albuns.filter(
            a => a.id_artista === foundArtist.id_artista
          );

          // buscamos os detalhes de cada álbum pra pegar a nota real
          const albumsWithRatings = await Promise.all(
            artistAlbumsRaw.map(async (a) => {
              try {
                const res = await fetch(`http://localhost:5000/api/albuns/${a.id_album}`);
                const albumDetail = await res.json();
                return {
                  id: a.id_album,
                  title: a.title,
                  artist: foundArtist.name,
                  image: a.image,
                  year: a.year,
                  genre: a.genre,
                  rating: albumDetail.nota_media || 0 
                };
              } catch {
                return { ...a, id: a.id_album, artist: foundArtist.name, rating: 0 };
              }
            })
          );

          setAlbums(albumsWithRatings);

          // Calcula a média geral do artista baseada na nota de cada álbum
          if (albumsWithRatings.length > 0) {
            const albumsWithReviews = albumsWithRatings.filter(a => a.rating > 0);
            if (albumsWithReviews.length > 0) {
              const total = albumsWithReviews.reduce((acc, curr) => acc + curr.rating, 0);
              setAverageRating((total / albumsWithReviews.length).toFixed(1));
            } else {
              setAverageRating("0.0");
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar artista:", err);
        setLoading(false);
      });
  }, [decodedName]);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white', paddingBottom: '80px', overflowX: 'hidden' }}>
      <Header hideNav={true} hideSearch={true} />

      {/* --- BACKGROUND --- */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '80vh',
          backgroundImage: artist?.image_url ? `url(${artist.image_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(80px) brightness(0.6) saturate(1.2)',
          opacity: 0.5,
          zIndex: 0,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)'
        }}
      />
      
      {!artist?.image_url && (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '600px', zIndex: 0,
            background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.2) 0%, rgba(18, 18, 21, 0) 70%)'
        }} />
      )}

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {loading ? (
           <div style={{ textAlign: 'center', marginTop: '100px', color: '#9ca3af' }}>Carregando perfil...</div>
        ) : artist ? (
          <>
            {/* === HEADER DO ARTISTA === */}
            <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '32px' }}>
              
              {/* Avatar do Artista */}
              <div 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%', 
                  boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5)', 
                  position: 'relative'
                }}
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', position: 'relative', backgroundColor: '#1e293b' }}>
                    {artist.image_url && artist.image_url.startsWith('http') ? (
                    <img 
                        src={artist.image_url} 
                        alt={artist.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={64} color="rgba(255,255,255,0.2)" />
                    </div>
                    )}
                </div>
              </div>

              {/* Informações Textuais */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '700px' }}>
                
                {/* Nome + Verificado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                  <h1 style={{ fontSize: '64px', fontWeight: '900', margin: 0, letterSpacing: '-0.03em', lineHeight: '1' }}>
                    {artist.name}
                  </h1>
                  <VerifiedBadge />
                </div>

                {/* Tags e Estatística */}
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '12px', 
                    justifyContent: 'center',
                    marginTop: '4px' 
                }}>
                    {artist.genre && (
                        <InfoPill icon={<Music size={14} />} text={artist.genre} color="#60a5fa" />
                    )}
                    {artist.country && (
                        <InfoPill icon={<MapPin size={14} />} text={artist.country} />
                    )}
                    <InfoPill icon={<Disc size={14} />} text={`${albums.length} Álbuns`} />
                    {albums.length > 0 && (
                        <InfoPill icon={<Star size={14} fill="#facc15" color="#facc15" />} text={averageRating} />
                    )}
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p style={{ color: '#d1d5db', fontSize: '16px', lineHeight: '1.6', margin: '8px 0 0 0', opacity: 0.9 }}>
                    {artist.bio}
                  </p>
                )}
              </div>
            </section>

            {/* === DISCOGRAFIA === */}
            <section style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Discografia</h2>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
              </div>
              
              {albums.length > 0 ? (
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                    gap: '24px' 
                  }}
                >
                  {albums.map(album => (
                    <div 
                      key={album.id} 
                      onClick={() => navigate(`/album/${album.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <AlbumCard album={album} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  Nenhum álbum encontrado para este artista.
                </div>
              )}
            </section>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold' }}>Artista não encontrado</h2>
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '99px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                Voltar para o Início
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

// Componente reutilizável para mostrar informações com ícones
function InfoPill({ icon, text, color = '#e5e7eb' }) {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '6px 16px', 
            backgroundColor: 'rgba(255,255,255,0.06)', 
            backdropFilter: 'blur(12px)', 
            borderRadius: '99px', 
            border: '1px solid rgba(255,255,255,0.05)',
            fontSize: '13px',
            fontWeight: '600',
            color: color
        }}>
            {icon}
            <span>{text}</span>
        </div>
    );
}

function VerifiedBadge() {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width="32" 
      height="32" 
      style={{ flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(29, 155, 240, 0.5))' }}
    >
      <path 
        fill="#1d9bf0" 
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.74 2.746 1.867 3.447.014.21.025.418.025.63 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.333 1.818 2.25 3.337 2.25s2.816-.917 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.212-.01-.42-.025-.63A4.05 4.05 0 0 0 22.5 12.5z" 
      />
      <path 
        fill="white" 
        d="M10.25 15.5l-3.5-3.5 1.5-1.5 2 2 5-5 1.5 1.5-6.5 6.5z" 
      />
    </svg>
  );
}