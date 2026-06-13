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
        console.error("Erro ao carregar avisos globais:", erro);
      }
    };

    buscarAvisos();
  }, []);

  useEffect(() => {
    if (avisos.length <= 1) return;

    const intervalo = setInterval(() => {
      proximoAviso();
    }, 5000);

    return () => clearInterval(intervalo);
  }, [avisos.length, indiceAtual]);

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
    <div style={{ ...styles.container, borderLeftColor: corBorda, backgroundColor: corFundo, color: corTexto }}>
      
      <div style={styles.header}>
        <h4 style={styles.title}>
          {aviso.tipo === 'URGENTE' && '🚨 '}
          {aviso.tipo === 'ALERTA' && '⚠️ '}
          {aviso.tipo === 'INFO' && 'ℹ️ '}
          {aviso.titulo}
        </h4>

        {avisos.length > 1 && (
          <div style={styles.controles}>
            <button onClick={avisoAnterior} style={{ ...styles.btnNav, color: corTexto }}>
              &#10094;
            </button>
            <span style={styles.contador}>
              {indiceAtual + 1} / {avisos.length}
            </span>
            <button onClick={proximoAviso} style={{ ...styles.btnNav, color: corTexto }}>
              &#10095;
            </button>
          </div>
        )}
      </div>

      <p style={styles.mensagem}>{aviso.mensagem}</p>
      
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