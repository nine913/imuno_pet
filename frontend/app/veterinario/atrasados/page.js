"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VetAtrasados() {
  const [usuario, setUsuario] = useState(null);
  const [atrasados, setAtrasados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);
    carregarAtrasados();
  }, [router]);

  const carregarAtrasados = async () => {
    setCarregando(true);
    setErro('');
    try {
      const resposta = await fetch('http://localhost:3000/animais-atrasados');
      if (resposta.ok) {
        const dados = await resposta.json();
        setAtrasados(dados);
      } else {
        setErro('Erro ao carregar os registros.');
      }
    } catch (e) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>
          Voltar ao Painel
        </button>
        <h2 style={styles.h2}>⚠️ Controle de Vacinação Atrasada</h2>
        <p>Lista de pacientes com doses pendentes após a data de vencimento:</p>
        
        <div>
          {carregando ? (
            <p>Carregando...</p>
          ) : erro ? (
            <p style={{ color: 'red' }}>{erro}</p>
          ) : atrasados.length === 0 ? (
            <p style={{ color: 'green', fontWeight: 'bold', fontSize: '18px' }}>
              Nenhuma vacina atrasada no sistema!
            </p>
          ) : (
            atrasados.map((item, index) => {
              const dataVenc = new Date(item.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
              const telLimpo = item.telefone ? item.telefone.replace(/\D/g, '') : '';
              const mensagemWhats = `Olá, ${item.nome_tutor}. Notamos no sistema ImunoPet que a vacina ${item.nome_vacina} do(a) ${item.nome_animal} venceu em ${dataVenc}. Gostaria de agendar a nova dose?`;
              const linkWhats = `https://wa.me/55${telLimpo}?text=${encodeURIComponent(mensagemWhats)}`;

              return (
                <div key={index} style={styles.atrasadoCard}>
                  <div>
                    <strong style={{ fontSize: '18px' }}>🐾 {item.nome_animal} ({item.especie})</strong><br />
                    <span>Vacina: <strong>{item.nome_vacina}</strong> (Venceu em: {dataVenc})</span><br />
                    <span style={{ fontSize: '13px', color: '#333' }}>Tutor: {item.nome_tutor} | Contato: {item.telefone}</span>
                  </div>
                  <a href={linkWhats} target="_blank" rel="noopener noreferrer" style={styles.btnContato}>
                    📱 Entrar em Contato
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    margin: 0,
    padding: '20px',
    minHeight: '100vh'
  },
  container: {
    maxWidth: '900px',
    margin: 'auto',
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  h2: {
    color: '#dc3545',
    marginTop: 0
  },
  btnVoltar: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginBottom: '20px'
  },
  atrasadoCard: {
    border: '1px solid #f5c6cb',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px',
    backgroundColor: '#f8d7da',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#721c24'
  },
  btnContato: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textDecoration: 'none',
    fontSize: '14px',
    textAlign: 'center'
  }
};