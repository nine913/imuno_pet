"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
            router.push('/gestor/dashboard');
            break;
          case 'VETERINARIO':
            router.push('/veterinario/buscar');
            break;
          case 'TUTOR':
            router.push('/tutor/dashboard');
            break;
          case 'GOVERNO':
            router.push('/governo/dashboard');
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
            <p style={{ fontSize: '14px', color: '#666' }}>
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
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' },
  loginBox: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', color: '#0056b3', marginBottom: '10px', marginTop: 0 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', width: '100%', boxSizing: 'border-box' },
  button: { padding: '12px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancelar: { padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  btnLink: { background: 'none', border: 'none', color: '#0056b3', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' },
  errorBox: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #f5c6cb', fontSize: '14px', textAlign: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }
};