"use client";

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
  const [novaSenha, setNovaSenha] = useState('');
  const [msgRecuperacao, setMsgRecuperacao] = useState({ texto: '', cor: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const dados = await res.json();

      if (res.ok) {
        localStorage.setItem('usuarioImunoPet', JSON.stringify(dados));
        
        switch (dados.perfil) {
          case 'ADMINISTRADOR':
            router.push('/admin/dashboard');
            break;
          case 'GESTOR_CLINICA':
            router.push('/dashboard');
            break;
          case 'VETERINARIO':
            router.push('/dashboard');
            break;
          case 'TUTOR':
            router.push('/dashboard');
            break;
          case 'GOVERNO':
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        setErro(dados.erro || 'Erro ao fazer login');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor');
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setMsgRecuperacao({ texto: '', cor: '' });

    try {
      const res = await fetch('http://localhost:3000/redefinir-senha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRecuperacao, nova_senha: novaSenha })
      });

      const dados = await res.json();

      if (res.ok) {
        setMsgRecuperacao({ texto: 'Senha alterada com sucesso! Você já pode fazer login.', cor: 'green' });
        setTimeout(() => {
          setModalOpen(false);
          setEmailRecuperacao('');
          setNovaSenha('');
          setMsgRecuperacao({ texto: '', cor: '' });
        }, 3000);
      } else {
        setMsgRecuperacao({ texto: dados.erro || 'Erro ao redefinir senha.', cor: 'red' });
      }
    } catch (error) {
      setMsgRecuperacao({ texto: 'Erro de conexão com o servidor.', cor: 'red' });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        
        <AvisosGlobais />

        <h1 style={styles.title}>ImunoPet Brasil</h1>
        <p style={styles.subtitle}>Faça login para acessar o sistema</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
            required
          />
          
          {erro && (
            <div style={styles.errorBox}>
              <strong>Atenção:</strong> {erro}
            </div>
          )}

          <button type="submit" style={styles.button}>Entrar</button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button 
            onClick={() => setModalOpen(true)} 
            style={styles.btnLink}
          >
            Esqueci minha senha
          </button>
        </div>
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Redefinir Senha</h3>
            <p style={{ fontSize: '14px', color: '#333' }}>
              Digite seu e-mail cadastrado e a nova senha que deseja utilizar.
            </p>
            
            <form onSubmit={handleRedefinirSenha}>
              <input
                type="email"
                placeholder="E-mail cadastrado"
                value={emailRecuperacao}
                onChange={(e) => setEmailRecuperacao(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                style={styles.input}
                required
                minLength="6"
              />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.button, margin: 0, flex: 1 }}>Atualizar Senha</button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ ...styles.btnCancelar, flex: 1 }}>Cancelar</button>
              </div>
            </form>
            
            {msgRecuperacao.texto && (
              <div style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold', color: msgRecuperacao.cor }}>
                {msgRecuperacao.texto}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
const styles = {
  container: {
    marginBottom: '20px',
    padding: '15px',
    borderRadius: '4px',
    borderLeft: '5px solid',
    borderRight: '1px solid #ddd',
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    position: 'relative',
    transition: 'all 0.3s ease-in-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  mensagem: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4'
  },
  controles: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  btnNav: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '2px 6px',
    transition: 'transform 0.1s'
  },
  contador: {
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: '35px',
    textAlign: 'center'
  }
};