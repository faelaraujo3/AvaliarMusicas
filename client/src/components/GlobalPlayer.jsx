import React from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Pause, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GlobalPlayer() {
  const { activeTrack, isPlaying, volume, playTrack, handleVolumeChange, stopTrack } = usePlayer();
  const navigate = useNavigate();

  if (!activeTrack) return null;

  return (
    <div style={{
        position: 'fixed',
        bottom: activeTrack ? '24px' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(25, 25, 30, 0.31)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '100px',
        padding: '8px 24px 8px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 9999,
        transition: 'bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
        <img 
            src={activeTrack.album?.image} 
            alt="cover" 
            style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                objectFit: 'cover'
            }} 
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '140px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'white' }}>
                {activeTrack.title}
            </span>
            <span 
              onClick={() => { if(activeTrack.album?.id) navigate(`/album/${activeTrack.album.id}`) }}
              style={{ fontSize: '12px', color: '#a1a1aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
            >
                {activeTrack.artist}
            </span>
        </div>

        <button 
            onClick={() => playTrack(activeTrack)}
            style={{
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'white', color: 'black', border: 'none', cursor: 'pointer'
            }}
        >
            {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" style={{ marginLeft: '2px' }} />}
        </button>
        
        <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={volume} 
            onChange={handleVolumeChange}
            className="modern-volume-slider"
        />

        <button 
            onClick={stopTrack}
            style={{
                width: '30px', height: '30px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.1)', color: '#a1a1aa', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s', marginLeft: '8px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        >
            <X size={14} />
        </button>

        <style>{`
            .modern-volume-slider {
                -webkit-appearance: none;
                width: 80px;
                background: transparent;
            }
            .modern-volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 10px;
                width: 10px;
                border-radius: 50%;
                background: #ffffff;
                cursor: pointer;
                margin-top: -3px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.5);
                transition: transform 0.1s;
            }
            .modern-volume-slider::-webkit-slider-thumb:hover {
                transform: scale(1.3);
            }
            .modern-volume-slider::-webkit-slider-runnable-track {
                width: 100%;
                height: 4px;
                cursor: pointer;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }
        `}</style>
    </div>
  );
}
