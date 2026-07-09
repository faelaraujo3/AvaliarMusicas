import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, ShieldCheck, Bell, Sparkles, CheckCircle2, AlertCircle, Heart, MessageCircle, Users } from 'lucide-react';

export default function Settings() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('conta');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    senha_atual: '',
    senha_nova: '',
    senha_confirmacao: ''
  });

  // --- NOVO: ESTADO DE NOTIFICAÇÕES ---
  const [prefNotificacoes, setPrefNotificacoes] = useState({
    curtidas: true,
    respostas: true,
    seguidores: true
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || ''
      }));
      if (user.pref_notificacoes) {
        setPrefNotificacoes(user.pref_notificacoes);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ type: '', message: '' });
  };

  const toggleNotificacao = (key) => {
    setPrefNotificacoes(prev => ({ ...prev, [key]: !prev[key] }));
    setStatus({ type: '', message: '' });
  };

  const handleSaveAccount = async () => {
    if (!formData.username || !formData.email) {
      return setStatus({ type: 'error', message: 'Preencha todos os campos.' });
    }
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id_user}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username.toLowerCase(), email: formData.email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStatus({ type: 'success', message: 'Dados da conta atualizados com sucesso!' });
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
    setLoading(false);
  };

  const handleSaveSecurity = async () => {
    if (!formData.senha_atual || !formData.senha_nova || !formData.senha_confirmacao) {
      return setStatus({ type: 'error', message: 'Preencha todos os campos de senha.' });
    }
    if (formData.senha_nova !== formData.senha_confirmacao) {
      return setStatus({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
    }
    if (formData.senha_nova === formData.senha_atual) {
      return setStatus({ type: 'error', message: 'A nova senha deve ser diferente da atual.' });
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id_user}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha_atual: formData.senha_atual, senha_nova: formData.senha_nova })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStatus({ type: 'success', message: 'Senha alterada com sucesso!' });
      setFormData({ ...formData, senha_atual: '', senha_nova: '', senha_confirmacao: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
    setLoading(false);
  };

  // --- NOVO: SALVAR NOTIFICAÇÕES ---
  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id_user}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pref_notificacoes: prefNotificacoes })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStatus({ type: 'success', message: 'Preferências de notificação salvas!' });
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        login(data.user);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'conta', label: 'Detalhes da Conta', icon: <User size={18} /> },
    { id: 'seguranca', label: 'Segurança e Senha', icon: <Lock size={18} /> },
    { id: 'notificacoes', label: 'Notificações', icon: <Bell size={18} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: 'white' }}>
      <Header hideSearch={true} />

      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px', display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* SIDEBAR DE NAVEGAÇÃO */}
        <aside style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '16px', paddingLeft: '12px' }}>Configurações</h2>
          
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setStatus({type:'', message:''}); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                padding: '14px 16px', borderRadius: '12px', border: 'none',
                backgroundColor: activeTab === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#9ca3af',
                fontWeight: activeTab === tab.id ? 'bold' : '500',
                fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}

          
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <section style={{ flex: 1, backgroundColor: '#18181c', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'fadeIn 0.3s ease-out' }}>
          
          {status.message && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', marginBottom: '32px',
              backgroundColor: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
              color: status.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: '14px'
            }}>
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              {status.message}
            </div>
          )}

          {activeTab === 'conta' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Detalhes da Conta</h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Altere as informações básicas de login e identificação.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nome de Usuário</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontWeight: 'bold' }}>@</span>
                  <input name="username" value={formData.username} onChange={handleChange} placeholder="seu.username" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px 14px 36px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveAccount} disabled={loading} style={{ padding: '12px 32px', borderRadius: '12px', backgroundColor: 'white', color: 'black', fontWeight: 'bold', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={24} color="#10b981" /> Segurança da Conta
                </h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Atualize sua senha para manter sua conta protegida.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Senha Atual</label>
                <input name="senha_atual" type="password" value={formData.senha_atual} onChange={handleChange} placeholder="••••••••" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nova Senha</label>
                <input name="senha_nova" type="password" value={formData.senha_nova} onChange={handleChange} placeholder="••••••••" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirmar Nova Senha</label>
                <input name="senha_confirmacao" type="password" value={formData.senha_confirmacao} onChange={handleChange} placeholder="••••••••" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 16px', color: 'white', outline: 'none', fontSize: '15px', boxSizing: 'border-box', transition: 'border 0.2s' }} onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveSecurity} disabled={loading} style={{ padding: '12px 32px', borderRadius: '12px', backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {loading ? 'Atualizando...' : 'Atualizar Senha'}
                </button>
              </div>
            </div>
          )}

          {/*  NOTIFICAÇÕES COM TOGGLE */}
          {activeTab === 'notificacoes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={24} color="#3b82f6" /> Preferências de Notificação
                </h3>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Escolha sobre o que você deseja ser avisado no Scorefy.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <ToggleSwitch 
                  icon={<Heart size={20} color="#ef4444" />}
                  label="Curtidas em Reviews" 
                  description="Receber aviso quando alguém curtir sua avaliação." 
                  checked={prefNotificacoes.curtidas} 
                  onChange={() => toggleNotificacao('curtidas')} 
                />
                <ToggleSwitch 
                  icon={<MessageCircle size={20} color="#3b82f6" />}
                  label="Respostas a Reviews" 
                  description="Receber aviso quando alguém comentar na sua avaliação." 
                  checked={prefNotificacoes.respostas} 
                  onChange={() => toggleNotificacao('respostas')} 
                />
                <ToggleSwitch 
                  icon={<Users size={20} color="#10b981" />}
                  label="Novos Seguidores" 
                  description="Receber aviso quando um usuário começar a te seguir." 
                  checked={prefNotificacoes.seguidores} 
                  onChange={() => toggleNotificacao('seguidores')} 
                />
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveNotifications} disabled={loading} style={{ padding: '12px 32px', borderRadius: '12px', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {loading ? 'Salvando...' : 'Salvar Preferências'}
                </button>
              </div>
            </div>
          )}

        </section>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// Toggle 
function ToggleSwitch({ icon, label, description, checked, onChange }) {
  return (
    <div 
      onClick={onChange}
      style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
        cursor: 'pointer', transition: 'all 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'white' }}>{label}</div>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>{description}</div>
        </div>
      </div>
      
      <div style={{ 
        width: '46px', height: '26px', borderRadius: '13px', 
        backgroundColor: checked ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
        position: 'relative', transition: 'background-color 0.3s'
      }}>
        <div style={{ 
          width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white', 
          position: 'absolute', top: '3px', left: checked ? '23px' : '3px', 
          transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }} />
      </div>
    </div>
  );
}