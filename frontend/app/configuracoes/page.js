"use client";

import { useEffect, useState } from 'react';
import LayoutPainel from '../components/LayoutPainel';

export default function Configuracoes() {
  const [usuario, setUsuario] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  const [tema, setTema] = useState('claro');
  const [fonte, setFonte] = useState('16px');
  const [altoContraste, setAltoContraste] = useState(false);
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesWhatsapp, setNotificacoesWhatsapp] = useState(true);

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      window.location.href = '/';
      return;
    }
    
    const user = JSON.parse(usuarioString);
    setUsuario(user);

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setFonte(config.fonte || '16px');
      setAltoContraste(config.altoContraste || false);
      setNotificacoesEmail(config.notificacoesEmail ?? true);
      setNotificacoesWhatsapp(config.notificacoesWhatsapp ?? true);
    }
  }, []);

  const salvarConfiguracoes = (e) => {
    e.preventDefault();
    
    const novasConfiguracoes = {
      tema,
      fonte,
      altoContraste,
      notificacoesEmail,
      notificacoesWhatsapp
    };

    localStorage.setItem(`imunoPetConfig_${usuario.id_usuario}`, JSON.stringify(novasConfiguracoes));
    
    setMensagem({ texto: 'Configurações salvas com sucesso! Atualizando...', cor: '#059669' });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#1e293b';
  const labelColor = isEscuro ? '#94a3b8' : '#475569';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#ffffff';
  const headerColor = altoContraste ? '#fbbf24' : (isEscuro ? '#60a5fa' : '#2563eb');
  const boxSombra = isEscuro ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', color: textColor }}>
        <div style={{ background: bgCard, padding: '40px', borderRadius: '16px', boxShadow: boxSombra, border: altoContraste ? '3px solid #fbbf24' : `1px solid ${borderColor}` }}>
          
          <h2 style={{ marginTop: 0, color: headerColor, marginBottom: '30px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Ajustes e Configurações
          </h2>

          <form onSubmit={salvarConfiguracoes}>
            
            <div style={{ padding: '24px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${borderColor}`, backgroundColor: isEscuro ? '#0f172a' : '#f8fafc' }}>
              <h3 style={{ color: headerColor, marginTop: 0, fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>🎨 Aparência e Acessibilidade</h3>
              
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: labelColor, fontSize: '14px' }}>Tema do Sistema:</label>
              <select value={tema} onChange={e => setTema(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', marginBottom: '20px' }}>
                <option value="claro">Modo Claro (Padrão)</option>
                <option value="escuro">Modo Escuro (Dark Mode)</option>
              </select>

              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: labelColor, fontSize: '14px' }}>Tamanho da Fonte:</label>
              <select value={fonte} onChange={e => setFonte(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}>
                <option value="14px">Pequeno (14px)</option>
                <option value="16px">Normal (16px)</option>
                <option value="18px">Grande (18px)</option>
                <option value="20px">Muito Grande (20px)</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <input type="checkbox" checked={altoContraste} onChange={e => setAltoContraste(e.target.checked)} id="contraste" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563eb' }} />
                <label htmlFor="contraste" style={{ cursor: 'pointer', fontWeight: '600', color: textColor, fontSize: '15px' }}>Ativar Modo de Alto Contraste</label>
              </div>
            </div>

            <div style={{ padding: '24px', borderRadius: '12px', marginBottom: '30px', border: `1px solid ${borderColor}`, backgroundColor: isEscuro ? '#0f172a' : '#f8fafc' }}>
              <h3 style={{ color: headerColor, marginTop: 0, fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>🔔 Alertas e Notificações</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <input type="checkbox" checked={notificacoesEmail} onChange={e => setNotificacoesEmail(e.target.checked)} id="notifEmail" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563eb' }} />
                <label htmlFor="notifEmail" style={{ cursor: 'pointer', color: textColor, fontWeight: '500', fontSize: '15px' }}>Receber relatórios e alertas por E-mail</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={notificacoesWhatsapp} onChange={e => setNotificacoesWhatsapp(e.target.checked)} id="notifWpp" style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563eb' }} />
                <label htmlFor="notifWpp" style={{ cursor: 'pointer', color: textColor, fontWeight: '500', fontSize: '15px' }}>Ativar lembretes de vacinas via WhatsApp</label>
              </div>
            </div>

            <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', width: '100%', fontWeight: '600', transition: 'background-color 0.2s', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
              Salvar Configurações
            </button>
          </form>

          {mensagem.texto && (
            <div style={{ textAlign: 'center', marginTop: '24px', padding: '12px', borderRadius: '8px', backgroundColor: mensagem.cor === '#059669' ? (isEscuro ? 'rgba(5, 150, 105, 0.2)' : '#d1fae5') : (isEscuro ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2'), color: mensagem.cor, fontWeight: '600', fontSize: '15px' }}>
              {mensagem.texto}
            </div>
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}