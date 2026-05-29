"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAuditoria() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  const [logs, setLogs] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    if (!usuario) {
      router.push('/');
    } else if (usuario.perfil.toUpperCase() !== 'ADMINISTRADOR') {
      router.push('/dashboard');
    } else {
      buscarLogs();
    }
  }, [usuario, router]);

  const buscarLogs = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/admin/logs');
      if (resposta.ok) {
        setLogs(await resposta.json());
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  const logsFiltrados = logs.filter(log => 
    log.acao.toLowerCase().includes(termoBusca.toLowerCase()) || 
    log.email.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (log.detalhes && log.detalhes.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/admin/dashboard')}>Voltar ao Dashboard</button>
        
        <h2 style={{ margin: '0 0 20px 0', color: '#000000' }}>Logs de Auditoria (Rastreabilidade)</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            placeholder="Pesquisar por usuário, e-mail ou ação..." 
            style={styles.input} 
          />
        </div>

        <div style={styles.tableContainer}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0056b3', color: 'white', textAlign: 'left' }}>
                <th style={styles.th}>Data/Hora</th>
                <th style={styles.th}>Usuário (E-mail)</th>
                <th style={styles.th}>Perfil</th>
                <th style={styles.th}>Ação Realizada</th>
                <th style={styles.th}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#333' }}>Nenhum registro encontrado.</td>
                </tr>
              ) : (
                logsFiltrados.map(log => (
                  <tr key={log.id_log} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={styles.td}>{new Date(log.data_hora).toLocaleString('pt-BR')}</td>
                    <td style={styles.td}><strong>{log.email}</strong></td>
                    <td style={styles.td}>
                      <span style={{ backgroundColor: '#e9ecef', padding: '3px 6px', borderRadius: '4px', fontSize: '12px' }}>
                        {log.perfil}
                      </span>
                    </td>
                    <td style={styles.td}>{log.acao}</td>
                    <td style={styles.td}><span style={{ color: '#333', fontStyle: 'italic' }}>{log.detalhes || '-'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  tableContainer: { overflowX: 'auto', backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px solid #e3e3e3' },
  th: { padding: '12px 15px', borderBottom: '2px solid #ddd' },
  td: { padding: '12px 15px', color: '#333' }
};