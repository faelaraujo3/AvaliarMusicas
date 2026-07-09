import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AlbumCard({ album }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Função para gerar as estrelas
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.4;
    const starSize = 18;

    // Cheias
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} size={starSize} fill="#facc15" color="#facc15" />
      );
    }

    // Meia
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" size={starSize} fill="#facc15" color="#facc15" />
      );
    }

    // Vazias
    const currentCount = stars.length;
    for (let i = 0; i < (5 - currentCount); i++) {
      stars.push(
        <Star key={`empty-${i}`} size={starSize} color="#1f2937" fill="rgba(31, 41, 55, 0.5)" />
      );
    }

    return stars;
  };

  return (
    <div
      onClick={() => navigate(`/album/${album.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '208px', 
        flexShrink: 0,
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.3s ease'
      }}
    >
      {/* Imagem */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1/1',
          borderRadius: '16px', 
          overflow: 'hidden',
          marginBottom: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <img
          src={album.image}
          alt={album.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s ease'
          }}
        />
        {/* Overlay Escuro no Hover */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      </div>

      {/* Info Container */}
      <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Área da Nota */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}
        >
          {/* Estrelas */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {renderStars(album.rating)}
          </div>

          {/* Número da Nota */}
          <span
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.9)',
              backgroundColor: 'rgba(126, 194, 211, 0.25)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}
          >
            {album.rating}
          </span>
        </div>

        {/* Título e Artista */}
        <h3
          style={{
            fontWeight: 'bold',
            color: isHovered ? '#818cf8' : 'white', 
            fontSize: '15px', 
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.25,
            transition: 'color 0.2s',
            marginTop: '4px',
            margin: 0
          }}
        >
          {album.title}
        </h3>
        <p
          style={{
            fontSize: '13px', 
            color: '#9ca3af',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: '2px 0 0 0'
          }}
        >
          {album.artist}
        </p>
      </div>
    </div>
  );
}