"use client";

import { useEffect, useState } from 'react';

export default function AvisosGlobais() {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const res = await fetch('http://localhost:3000/avisos-ativos');
        if (res.ok) {
          const data = await res.json();
          setAvisos(data);
        }
      } catch (error) {
      }
    };
    fetchAvisos();
  }, []);

  if (avisos.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', width: '100%' }}>
      {avisos.map(aviso => {
        let corFundo = '#d1ecf1';
        let corTexto = '#0c5460';
        let corBorda = '#bee5eb';
        let icone = 'ℹ️';

        if (aviso.tipo === 'ALERTA') {
          corFundo = '#fff3cd';
          corTexto = '#856404';
          corBorda = '#ffeeba';
          icone = '⚠️';
        } else if (aviso.tipo === 'URGENTE') {
          corFundo = '#f8d7da';
          corTexto = '#721c24';
          corBorda = '#f5c6cb';
          icone = '🚨';
        }

        return (
          <div key={aviso.id_aviso} style={{ backgroundColor: corFundo, color: corTexto, border: `1px solid ${corBorda}`, padding: '15px', borderRadius: '5px', width: '100%', boxSizing: 'border-box' }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{icone} {aviso.titulo}</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>{aviso.mensagem}</p>
          </div>
        );
      })}
    </div>
  );
}