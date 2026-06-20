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
            router.push('/dashboard'); 
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
    <div style={styles.page}>
      
      <div style={styles.avisosContainer}>
        <AvisosGlobais />
      </div>

      <div style={styles.loginBox}>
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

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={() => setModalOpen(true)} style={styles.btnLink}>
            Esqueci minha senha
          </button>
        </div>
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Redefinir Senha</h3>
            <p style={{ fontSize: '14px', color: '#333', marginBottom: '20px' }}>
              Digite seu e-mail cadastrado e a nova senha que deseja utilizar.
            </p>
            
            <form onSubmit={handleRedefinirSenha} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ ...styles.button, margin: 0, flex: 1 }}>Atualizar Senha</button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ ...styles.btnCancelar, margin: 0, flex: 1 }}>Cancelar</button>
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
  page: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#f4f4f9', 
    padding: '20px',
    boxSizing: 'border-box'
  },
  avisosContainer: { 
    width: '100%', 
    maxWidth: '800px', 
    marginBottom: '30px' 
  },
  loginBox: { 
    backgroundColor: 'white', 
    padding: '40px', 
    borderRadius: '12px', 
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)', 
    width: '100%', 
    maxWidth: '400px', 
    textAlign: 'center' 
  },
  title: { 
    margin: '0 0 10px 0', 
    color: '#0056b3', 
    fontSize: '28px' 
  },
  subtitle: { 
    margin: '0 0 25px 0', 
    color: '#666', 
    fontSize: '15px' 
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px' 
  },
  input: { 
    padding: '14px', 
    border: '1px solid #ccc', 
    borderRadius: '6px', 
    fontSize: '16px', 
    outline: 'none',
    color: '#333',
    width: '100%',
    boxSizing: 'border-box'
  },
  button: { 
    padding: '14px', 
    backgroundColor: '#28a745', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginTop: '10px',
    width: '100%'
  },
  btnCancelar: {
    padding: '14px', 
    backgroundColor: '#6c757d', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    width: '100%'
  },
  errorBox: { 
    backgroundColor: '#f8d7da', 
    color: '#721c24', 
    padding: '12px', 
    borderRadius: '6px', 
    border: '1px solid #f5c6cb',
    fontSize: '14px',
    textAlign: 'left'
  },
  btnLink: { 
    background: 'none', 
    border: 'none', 
    color: '#0056b3', 
    cursor: 'pointer', 
    textDecoration: 'underline', 
    fontSize: '14px' 
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    background: 'rgba(0,0,0,0.6)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000 
  },
  modalContent: { 
    backgroundColor: 'white', 
    padding: '30px', 
    borderRadius: '8px', 
    width: '90%',
    maxWidth: '400px', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
  }
};