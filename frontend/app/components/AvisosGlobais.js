"use client";

import { useEffect, useState } from 'react';

export default function AvisosGlobais() {
  const [avisos, setAvisos] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    const buscarAvisos = async () => {
      try {
        const resposta = await fetch('http://localhost:3000/avisos'); 
        if (resposta.ok) {
          const dados = await resposta.json();
          const avisosAtivos = dados.filter(a => a.status === 'ATIVO');
          setAvisos(avisosAtivos);
        }
      } catch (erro) {
        console.error(erro);
      }
    };

    buscarAvisos();
  }, []);

  useEffect(() => {
    if (avisos.length <= 1) return;

    const intervalo = setInterval(() => {
      setIndiceAtual((prev) => (prev === avisos.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(intervalo);
  }, [avisos.length]);

  const avisoAnterior = () => {
    setIndiceAtual((prev) => (prev === 0 ? avisos.length - 1 : prev - 1));
  };

  const proximoAviso = () => {
    setIndiceAtual((prev) => (prev === avisos.length - 1 ? 0 : prev + 1));
  };

  if (avisos.length === 0) return null;

  const aviso = avisos[indiceAtual];
  
  const corBorda = aviso.tipo === 'URGENTE' ? '#dc3545' : aviso.tipo === 'ALERTA' ? '#ffc107' : '#17a2b8';
  const corFundo = aviso.tipo === 'URGENTE' ? '#f8d7da' : aviso.tipo === 'ALERTA' ? '#fff3cd' : '#d1ecf1';
  const corTexto = aviso.tipo === 'URGENTE' ? '#721c24' : aviso.tipo === 'ALERTA' ? '#856404' : '#0c5460';

  return (
    <div style={styles.wrapper}>
      {avisos.length > 1 && (
        <button onClick={avisoAnterior} style={styles.setaNav}>
          &#10094;
        </button>
      )}

      <div style={{ ...styles.cardAviso, borderLeftColor: corBorda, backgroundColor: corFundo, color: corTexto }}>
        <div style={styles.header}>
          <h4 style={styles.title}>
            {aviso.tipo === 'URGENTE' && '🚨 '}
            {aviso.tipo === 'ALERTA' && '⚠️ '}
            {aviso.tipo === 'INFO' && 'ℹ️ '}
            {aviso.titulo}
          </h4>
          
          {avisos.length > 1 && (
            <span style={styles.contador}>
              {indiceAtual + 1} / {avisos.length}
            </span>
          )}
        </div>
        <p style={styles.mensagem}>{aviso.mensagem}</p>
      </div>

      {avisos.length > 1 && (
        <button onClick={proximoAviso} style={styles.setaNav}>
          &#10095;
        </button>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '20px',
    width: '100%'
  },
  cardAviso: {
    flex: 1,
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '5px solid',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease-in-out',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 'bold'
  },
  mensagem: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4'
  },
  setaNav: {
    backgroundColor: '#f1f3f5',
    border: '1px solid #dee2e6',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#495057',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexShrink: 0
  },
  contador: {
    fontSize: '12px',
    fontWeight: 'bold',
    opacity: 0.7
  }
};