"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const resposta = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        const usuarioImunoPet = {
          id_usuario: dados.id_usuario,
          perfil: dados.perfil,
          id_clinica: dados.id_clinica,
          id_especifico: dados.id_especifico,
          nome: dados.nome
        };

        localStorage.setItem('usuarioImunoPet', JSON.stringify(usuarioImunoPet));
        router.push('/dashboard');
      } else {
        setMensagem(dados.erro);
      }
    } catch (erro) {
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2 style={styles.h2}>ImunoPet Brasil</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            style={styles.input}
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Entrar</button>
        </form>
        {mensagem && (
          <div style={styles.mensagem}>
            {mensagem}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f9',
    margin: 0
  },
  container: {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '300px'
  },
  h2: {
    textAlign: 'center',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  mensagem: {
    textAlign: 'center',
    marginTop: '15px',
    fontWeight: 'bold',
    color: 'red'
  }
};