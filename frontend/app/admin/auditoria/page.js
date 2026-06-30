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
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#f8fafc';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');
  const thBg = isEscuro ? '#0f172a' : '#f8fafc';
  const tagBg = isEscuro ? '#334155' : '#f1f5f9';

  return (
    <LayoutPainel>
      <style>{`
        .premium-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        }
      `}</style>
      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: headerColor, margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Logs de Auditoria</h2>
          <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Histórico completo de ações e rastreabilidade no sistema.</p>
        </div>

        <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}` }}>
          
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              className="premium-input"
              value={termoBusca} 
              onChange={(e) => setTermoBusca(e.target.value)} 
              placeholder="Pesquisar por usuário, e-mail ou ação..." 
              style={{ width: '100%', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '15px', outline: 'none', transition: 'all 0.2s' }} 
            />
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: thBg, padding: '16px', borderBottom: `2px solid ${borderColor}`, color: textSecundario, fontWeight: '700', textAlign: 'left' }}>Data/Hora</th>
                  <th style={{ backgroundColor: thBg, padding: '16px', borderBottom: `2px solid ${borderColor}`, color: textSecundario, fontWeight: '700', textAlign: 'left' }}>Usuário (E-mail)</th>
                  <th style={{ backgroundColor: thBg, padding: '16px', borderBottom: `2px solid ${borderColor}`, color: textSecundario, fontWeight: '700', textAlign: 'left' }}>Perfil</th>
                  <th style={{ backgroundColor: thBg, padding: '16px', borderBottom: `2px solid ${borderColor}`, color: textSecundario, fontWeight: '700', textAlign: 'left' }}>Ação Realizada</th>
                  <th style={{ backgroundColor: thBg, padding: '16px', borderBottom: `2px solid ${borderColor}`, color: textSecundario, fontWeight: '700', textAlign: 'left' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: textSecundario, fontWeight: '500' }}>Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  logsFiltrados.map((log, idx) => {
                    const bgColor = idx % 2 === 0 ? 'transparent' : inputBg;
                    return (
                      <tr key={log.id_log} style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}>
                        <td style={{ padding: '16px', color: textColor, fontWeight: '500' }}>{new Date(log.data_hora).toLocaleString('pt-BR')}</td>
                        <td style={{ padding: '16px', color: textColor, fontWeight: '600' }}>{log.email}</td>
                        <td style={{ padding: '16px', color: textColor }}>
                          <span style={{ backgroundColor: tagBg, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px' }}>
                            {log.perfil}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: textColor }}>{log.acao}</td>
                        <td style={{ padding: '16px', color: textSecundario, fontStyle: 'italic' }}>{log.detalhes || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}