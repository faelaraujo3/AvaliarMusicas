import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const PlayerContext = createContext();

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    const audio = audioRef.current;
    
    audio.onended = () => {
      setIsPlaying(false);
      setActiveTrack(null);
    };

    return () => {
      if (audio) {
        audio.pause();
        audio.onended = null;
      }
    };
  }, []);

  const playTrack = (track) => {
    if (!track || !track.preview) return;
    
    const audio = audioRef.current;

    // Se é a mesma música e está pausada, continua
    if (activeTrack && activeTrack.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
      return;
    }

    // Se é uma música nova
    audio.src = track.preview;
    audio.volume = volume;
    audio.play();
    setActiveTrack(track);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setActiveTrack(null);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  return (
    <PlayerContext.Provider value={{
      activeTrack,
      isPlaying,
      volume,
      playTrack,
      pauseTrack,
      stopTrack,
      handleVolumeChange
    }}>
      {children}
    </PlayerContext.Provider>
  );
}
