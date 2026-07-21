import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TrackList({ title, apiEndpoint }) {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { activeTrack, isPlaying, playTrack } = usePlayer();
  const [hoveredTrack, setHoveredTrack] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000${apiEndpoint}`)
      .then(res => res.json())
      .then(data => {
        setTracks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [apiEndpoint]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white' }}>
      <Header />
      <main style={{ padding: '100px 40px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>{title}</h1>
        
        {loading ? (
          <LoadingSpinner fullScreen={false} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>
            {tracks.map(track => {
              const isThisPlaying = isPlaying && activeTrack?.id === track.id;
              return (
                <div 
                  key={track.id}
                  onClick={() => { if(track.album?.id) navigate(`/album/${track.album.id}`) }}
                  onMouseEnter={() => setHoveredTrack(track.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'background 0.3s, transform 0.2s',
                    transform: hoveredTrack === track.id ? 'translateY(-4px)' : 'none'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                    <img 
                      src={track.album?.image} 
                      alt={track.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s', filter: (hoveredTrack === track.id || isThisPlaying) ? 'brightness(0.5) blur(3px)' : 'brightness(1)' }} 
                    />
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); playTrack(track); }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${(hoveredTrack === track.id || isThisPlaying) ? 1 : 0.8})`,
                        opacity: (hoveredTrack === track.id || isThisPlaying) ? 1 : 0,
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                      }}
                    >
                      {isThisPlaying ? <Pause fill="white" size={24} /> : <Play fill="white" size={24} style={{ marginLeft: '4px' }} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                    <span style={{ fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
