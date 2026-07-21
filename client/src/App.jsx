import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Album from './pages/Album';
import Artist from './pages/Artist';
import Login from './pages/Login';
import Register from './pages/Register';
import AlbumList from './pages/AlbumList';
import TrackList from './pages/TrackList';
import Settings from './pages/Settings';
import Feed from './pages/Feed';
import ReviewThread from './pages/ReviewThread';
import Playlist from './pages/Playlist';
import ChatWidget from './components/ChatWidget';
import GlobalPlayer from './components/GlobalPlayer';
import { PlayerProvider } from './contexts/PlayerContext';
import './App.css';

function App() {

  // Estado para saber se está logado
  // inicializa tentando ler do localstorage prra manter logado ao dar F5
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('scorefy_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('scorefy_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('scorefy_user');
  };

  // Componente para proteger rotas
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };


  return (
    <PlayerProvider>
      <BrowserRouter>
        <GlobalPlayer />
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas que exigem login */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />

          <Route path="/trending" element={
            <ProtectedRoute>
              <AlbumList title="Em Alta" apiEndpoint="/api/lista/em-alta" />
            </ProtectedRoute>
          } />

          <Route path="/trending-singles" element={
            <ProtectedRoute>
              <AlbumList title="Singles em Alta" apiEndpoint="/api/lista/singles-em-alta" />
            </ProtectedRoute>
          } />

          <Route path="/top-tracks" element={
            <ProtectedRoute>
              <TrackList title="Faixas Mais Bem Avaliadas" apiEndpoint="/api/lista/melhores-faixas" />
            </ProtectedRoute>
          } />

          <Route path="/top-rated" element={
            <ProtectedRoute>
              <AlbumList title="Melhores Avaliações" apiEndpoint="/api/lista/melhores" />
            </ProtectedRoute>
          } />

          <Route path="/releases" element={
            <ProtectedRoute>
              <AlbumList title="Novos Lançamentos" apiEndpoint="/api/lista/lancamentos" />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/profile/:identifier" element={<Profile />} />

          <Route path="/playlist/:id" element={<Playlist />} />

          <Route path="/album/:id" element={
            <ProtectedRoute>
              <Album />
            </ProtectedRoute>
          } />

          <Route path="/artist/:id" element={
            <ProtectedRoute>
              <Artist />
            </ProtectedRoute>
          } />

          <Route path="/review/:id" element={
            <ProtectedRoute>
              <ReviewThread />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/feed" element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } />
        </Routes>
        
        <ChatWidget />
      </BrowserRouter>
    </PlayerProvider>
  );
}

export default App;