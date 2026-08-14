"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';

function FormularioNovaSenha() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [msg, setMsg] = useState({ texto: '', cor: '' });
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ texto: '', cor: '' });

    if (novaSenha !== confirmacao) {
      setMsg({ texto: 'As senhas não coincidem.', cor: '#e11d48' });
      return;
    }

    setEnviando(true);
    try {
      const res = await apiFetch('/confirmar-redefinicao-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nova_senha: novaSenha })
      });
      const dados = await res.json();
      if (res.ok) {
        setSucesso(true);
        setMsg({ texto: 'Senha redefinida com sucesso! Redirecionando para o login...', cor: '#059669' });
        setTimeout(() => router.push('/'), 2500);
      } else {
        setMsg({ texto: dados.erro || 'Não foi possível redefinir a senha.', cor: '#e11d48' });
      }
    } catch (error) {
      setMsg({ texto: 'Erro de conexão com o servidor.', cor: '#e11d48' });
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
          align-items: center;
          justify-content: center;
          background-color: #0f172a;
          background-image:
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
          padding: 20px;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
          font-family: 'Plus Jakarta Sans', Arial, sans-serif;
        }
        .glass-card h1 {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          text-align: center;
        }
        .glass-card p {
          color: #64748b;
          font-size: 14px;
          margin: 0 0 24px 0;
          text-align: center;
          line-height: 1.5;
        }
        .input-field {
          width: 100%;
          padding: 16px 20px;
          background: #f1f5f9;
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          box-sizing: border-box;
          margin-bottom: 16px;
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
        }
      `}</style>

      <div className="glass-card">
        <h1>Criar nova senha</h1>
        <p>
          {token
            ? 'Escolha uma nova senha para sua conta.'
            : 'Link de redefinição inválido. Solicite um novo link na tela de login.'}
        </p>

        {token && !sucesso && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Nova senha (mín. 6 caracteres)"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="input-field"
              minLength="6"
              required
            />
            <input
              type="password"
              placeholder="Confirme a nova senha"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              className="input-field"
              minLength="6"
              required
            />

            {msg.texto && (
              <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', backgroundColor: msg.cor === '#059669' ? '#d1fae5' : '#ffe4e6', color: msg.cor, fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>
                {msg.texto}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}

        {!token && (
          <button className="btn-primary" onClick={() => router.push('/')}>
            Voltar para o login
          </button>
        )}
      </div>
    </div>
  );
}

export default function RedefinirSenha() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Carregando...</div>}>
      <FormularioNovaSenha />
    </Suspense>
  );
}
