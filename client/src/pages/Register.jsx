import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoScorefy from '../assets/logoscorefy.png';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function Register() {
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Conecta com o backend
      const response = await fetch('http://localhost:5000/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, username, email, senha }),
      });

      if (response.ok) {
        // Sucesso
        alert('Cadastro realizado com sucesso! Faça login para continuar.');
        navigate('/login');
      } else {
        // OU erro vindo da API (ex: email já existe)
        const data = await response.json();
        setError(data.error || 'Ocorreu um erro ao cadastrar.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Verifique se o backend está rodando.');
    }
  };

  return (
    <div style={styles.container}>
      {/* Elementos de fundo */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Cartão centralizado */}
      <div style={styles.glassCard}>
        
        {/* Cabeçalho do dard */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logoScorefy} alt="Scorefy" style={{ width: '60px', height: '60px', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>Crie sua conta</h1>
          <p style={{ color: '#9ca3af', marginTop: '8px' }}>Junte-se à comunidade e avalie seus álbuns favoritos.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* input do nome */}
          <div style={styles.inputGroup}>
            <User size={20} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Como devemos te chamar?" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={styles.input} 
              required
            />
          </div>
          
          {/* input do username (O @ do perfil) */}
           <div style={styles.inputGroup}>
            <span style={{ color: '#9ca3af', fontWeight: 'bold' }}>@</span>
             <input 
              type="text" 
              placeholder="Seu nome de usuário" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input} 
              required
             />
          </div>

          {/* input do email */}
          <div style={styles.inputGroup}>
            <Mail size={20} color="#9ca3af" />
            <input 
              type="email" 
              placeholder="Seu email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input} 
              required
            />
          </div>

          {/* input da senha */}
          <div style={styles.inputGroup}>
            <Lock size={20} color="#9ca3af" />
            <input 
              type="password" 
              placeholder="Sua senha" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={styles.input} 
              required
            />
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {/* Botão de Ação */}
          <button 
            type="submit" 
            style={styles.button}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Criar Conta
          </button>
        </form>

        {/* rodapé do dard */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
          Já tem uma conta?{' '}
          <span 
            onClick={() => navigate('/login')} 
            style={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Entrar
          </span>
        </div>
      </div>
    </div>
  );
}

// estilos isolados
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#121215',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    color: 'white'
  },
  glassCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '48px 32px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    margin: '24px'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    transition: 'border-color 0.2s'
  },
  input: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    width: '100%',
    outline: 'none',
    fontSize: '15px',
    fontFamily: 'inherit'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '14px',
    backgroundColor: 'white',
    color: 'black',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px'
  },
  blob1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    zIndex: 1
  },
  blob2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0) 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    zIndex: 1
  }
};