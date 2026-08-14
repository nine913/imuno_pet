"use client";

import { apiFetch } from './lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AvisosGlobais from './components/AvisosGlobais';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [msgRecuperacao, setMsgRecuperacao] = useState({ texto: '', cor: '' });
  const [enviando, setEnviando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const res = await apiFetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      const dados = await res.json();
      if (res.ok) {
        localStorage.setItem('usuarioImunoPet', JSON.stringify(dados));
        router.push('/dashboard');
      } else {
        setErro(dados.erro || 'Erro ao fazer login');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor');
    }
  };

  const handleSolicitarRedefinicao = async (e) => {
    e.preventDefault();
    setMsgRecuperacao({ texto: '', cor: '' });
    setEnviando(true);
    try {
      const res = await apiFetch('/solicitar-redefinicao-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRecuperacao })
      });
      const dados = await res.json();
      if (res.ok) {
        setMsgRecuperacao({ texto: dados.mensagem, cor: '#059669' });
      } else {
        setMsgRecuperacao({ texto: dados.erro || 'Erro ao solicitar redefinição.', cor: '#e11d48' });
      }
    } catch (error) {
      setMsgRecuperacao({ texto: 'Erro de conexão com o servidor.', cor: '#e11d48' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #0f172a;
          background-image:
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 10s infinite ease-in-out alternate;
          z-index: 0;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: #3b82f6;
          top: -10%;
          left: -10%;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: #8b5cf6;
          bottom: -20%;
          right: -10%;
          animation-delay: -5s;
        }

        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(30px) scale(1.1); }
        }

        .content-area {
          z-index: 10;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.5);
        }

        .brand {
          text-align: center;
          margin-bottom: 32px;
        }

        .brand h1 {
          font-size: 34px;
          font-weight: 800;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          letter-spacing: -1px;
        }

        .brand p {
          color: #64748b;
          font-size: 15px;
          margin: 8px 0 0 0;
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 20px;
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 16px 20px;
          background: #f1f5f9;
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 15px;
          color: #0f172a;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
          font-family: inherit;
        }

        .input-field::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        .input-field:focus {
          outline: none;
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .forgot-password {
          position: absolute;
          right: 4px;
          top: -24px;
          font-size: 13px;
          font-weight: 700;
          color: #3b82f6;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .forgot-password:hover {
          color: #1d4ed8;
        }

        .btn-primary {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.3);
          font-family: inherit;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -4px rgba(37, 99, 235, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffe4e6;
          color: #e11d48;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 20px;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 20px;
          box-sizing: border-box;
        }

        .modal-box {
          background: #ffffff;
          padding: 40px;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }

        .modal-box h3 {
          margin: 0 0 8px 0;
          font-size: 24px;
          color: #0f172a;
          font-weight: 800;
        }

        .modal-box p {
          margin: 0 0 24px 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
        }

        .btn-secondary {
          width: 100%;
          padding: 16px;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .modal-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
      `}</style>

      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="content-area">
        <div>
          <AvisosGlobais />
        </div>

        <div className="glass-card">
          <div className="brand">
            <h1>ImunoPet</h1>
            <p>Gestão Inteligente de Saúde Animal</p>
          </div>

          <form onSubmit={handleLogin}>
            {erro && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {erro}
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                placeholder="Seu e-mail de acesso"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <button type="button" onClick={() => setModalOpen(true)} className="forgot-password">
                Esqueceu a senha?
              </button>
              <input
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button type="submit" className="btn-primary">
              Acessar Plataforma
            </button>
          </form>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Redefinir Senha</h3>
            <p>Digite seu e-mail cadastrado. Se ele existir em nossa base, enviaremos um link para você criar uma nova senha.</p>

            <form onSubmit={handleSolicitarRedefinicao}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input
                  type="email"
                  placeholder="E-mail cadastrado"
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {msgRecuperacao.texto && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: msgRecuperacao.cor === '#059669' ? '#d1fae5' : '#ffe4e6', color: msgRecuperacao.cor, fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>
                  {msgRecuperacao.texto}
                </div>
              )}

              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={enviando} style={{ flex: 1, padding: '14px', opacity: enviando ? 0.7 : 1 }}>
                  {enviando ? 'Enviando...' : 'Enviar link'}
                </button>
                <button type="button" onClick={() => { setModalOpen(false); setMsgRecuperacao({ texto: '', cor: '' }); }} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}