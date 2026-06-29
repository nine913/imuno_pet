"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function AdminAuditoria() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [logs, setLogs] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (!saved) {
        router.push('/');
        return;
      }
      const user = JSON.parse(saved);
      if (user.perfil.toUpperCase() !== 'ADMINISTRADOR') {
        router.push('/dashboard');
        return;
      }
      setUsuario(user);

      const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
      if (configSalvas) {
        const config = JSON.parse(configSalvas);
        setTema(config.tema || 'claro');
        setAltoContraste(config.altoContraste || false);
      }

      buscarLogs();
    }
  }, [router]);

  const buscarLogs = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/admin/logs');
      if (resposta.ok) {
        setLogs(await resposta.json());
      }
    } catch (erro) {}
  };

  const logsFiltrados = logs.filter(log => 
    log.acao.toLowerCase().includes(termoBusca.toLowerCase()) || 
    log.email.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (log.detalhes && log.detalhes.toLowerCase().includes(termoBusca.toLowerCase()))
  );

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#000000');
  const thBg = isEscuro ? '#003366' : '#0056b3';
  const tagBg = isEscuro ? '#444444' : '#e9ecef';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', color: textColor }}>
        <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: altoContraste ? '3px solid #ffcc00' : `1px solid ${borderColor}` }}>
          
          <h2 style={{ margin: '0 0 20px 0', color: headerColor }}>Logs de Auditoria (Rastreabilidade)</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="text" 
              value={termoBusca} 
              onChange={(e) => setTermoBusca(e.target.value)} 
              placeholder="Pesquisar por usuário, e-mail ou ação..." 
              style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
            />
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: bgCard, borderRadius: '8px', border: `1px solid ${borderColor}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'inherit' }}>
              <thead>
                <tr style={{ backgroundColor: thBg, color: 'white', textAlign: 'left' }}>
                  <th style={{ padding: '12px 15px', borderBottom: `2px solid ${borderColor}` }}>Data/Hora</th>
                  <th style={{ padding: '12px 15px', borderBottom: `2px solid ${borderColor}` }}>Usuário (E-mail)</th>
                  <th style={{ padding: '12px 15px', borderBottom: `2px solid ${borderColor}` }}>Perfil</th>
                  <th style={{ padding: '12px 15px', borderBottom: `2px solid ${borderColor}` }}>Ação Realizada</th>
                  <th style={{ padding: '12px 15px', borderBottom: `2px solid ${borderColor}` }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: textSecundario }}>Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  logsFiltrados.map((log, idx) => (
                    <tr key={log.id_log} style={{ borderBottom: `1px solid ${borderColor}`, backgroundColor: idx % 2 === 0 ? 'transparent' : (isEscuro ? '#2d2d2d' : '#f9f9f9') }}>
                      <td style={{ padding: '12px 15px', color: textColor }}>{new Date(log.data_hora).toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '12px 15px', color: textColor }}><strong>{log.email}</strong></td>
                      <td style={{ padding: '12px 15px', color: textColor }}>
                        <span style={{ backgroundColor: tagBg, padding: '3px 6px', borderRadius: '4px', fontSize: '0.85em' }}>
                          {log.perfil}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', color: textColor }}>{log.acao}</td>
                      <td style={{ padding: '12px 15px', color: textSecundario }}><span style={{ fontStyle: 'italic' }}>{log.detalhes || '-'}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}