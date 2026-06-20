"use client";

import { useEffect, useState } from 'react';
import LayoutPainel from '../components/LayoutPainel';

export default function Configuracoes() {
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  const [tema, setTema] = useState('claro');
  const [fonte, setFonte] = useState('16px');
  const [altoContraste, setAltoContraste] = useState(false);
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesWhatsapp, setNotificacoesWhatsapp] = useState(true);

  useEffect(() => {
    const configSalvas = localStorage.getItem('imunoPetConfig');
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

    localStorage.setItem('imunoPetConfig', JSON.stringify(novasConfiguracoes));
    
    setMensagem({ texto: 'Configurações salvas! Atualizando o sistema...', cor: 'green' });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const bgContainer = tema === 'escuro' ? '#1e1e1e' : 'white';
  const textColor = tema === 'escuro' ? '#fdfdfd' : '#000000';
  const labelColor = tema === 'escuro' ? '#cccccc' : '#333333';
  const borderColor = tema === 'escuro' ? '#444444' : '#e3e3e3';
  const inputBg = tema === 'escuro' ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (tema === 'escuro' ? '#66b2ff' : '#0056b3');

  return (
    <LayoutPainel>
      <div style={{ padding: '30px', maxWidth: '800px', margin: 'auto', color: textColor }}>
        <div style={{ background: bgContainer, padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: altoContraste ? '3px solid #ffcc00' : 'none' }}>
          <h2 style={{ marginTop: 0, color: altoContraste ? '#ffcc00' : textColor, marginBottom: '30px' }}>Ajustes e Configurações</h2>

          <form onSubmit={salvarConfiguracoes}>
            <div style={{ padding: '20px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
              <h3 style={{ color: headerColor, marginTop: 0 }}>🎨 Aparência e Acessibilidade</h3>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', marginTop: '15px', color: labelColor }}>Tema do Sistema:</label>
              <select value={tema} onChange={e => setTema(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor }}>
                <option value="claro">Modo Claro (Padrão)</option>
                <option value="escuro">Modo Escuro (Dark Mode)</option>
              </select>

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', marginTop: '15px', color: labelColor }}>Tamanho da Fonte:</label>
              <select value={fonte} onChange={e => setFonte(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor }}>
                <option value="14px">Pequeno (14px)</option>
                <option value="16px">Normal (16px)</option>
                <option value="18px">Grande (18px)</option>
                <option value="20px">Muito Grande (20px)</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                <input type="checkbox" checked={altoContraste} onChange={e => setAltoContraste(e.target.checked)} id="contraste" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <label htmlFor="contraste" style={{ cursor: 'pointer', fontWeight: 'bold', color: labelColor }}>Ativar Modo de Alto Contraste</label>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
              <h3 style={{ color: headerColor, marginTop: 0 }}>🔔 Alertas e Notificações</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <input type="checkbox" checked={notificacoesEmail} onChange={e => setNotificacoesEmail(e.target.checked)} id="notifEmail" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <label htmlFor="notifEmail" style={{ cursor: 'pointer', color: labelColor }}>Receber relatórios e alertas por E-mail</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={notificacoesWhatsapp} onChange={e => setNotificacoesWhatsapp(e.target.checked)} id="notifWpp" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <label htmlFor="notifWpp" style={{ cursor: 'pointer', color: labelColor }}>Ativar lembretes de vacinas via WhatsApp</label>
              </div>
            </div>

            <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', width: '100%', fontWeight: 'bold', marginTop: '10px' }}>
              Salvar Configurações
            </button>
          </form>

          {mensagem.texto && (
            <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold', color: mensagem.cor }}>
              {mensagem.texto}
            </div>
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}