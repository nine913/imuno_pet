"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function VetCadastrarVacina() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [form, setForm] = useState({
    nome_vacina: '',
    doencas_prevenidas: '',
    fabricante: '',
    tipo_dose: '',
    intervalo_doses_dias: ''
  });

  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO' && user.perfil !== 'GESTOR_CLINICA' && user.perfil !== 'ADMINISTRADOR') {
      router.push('/dashboard');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza a sessão salva em localStorage (sistema externo, só existe no cliente) na montagem; padrão seguro para SSR
    setUsuario(user);

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
  }, [router]);

  const handleTipoDoseChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      tipo_dose: value,
      intervalo_doses_dias: value === 'intervalo' ? form.intervalo_doses_dias : ''
    });
  };

  const handleIntervaloChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setForm({ ...form, intervalo_doses_dias: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      nome_vacina: form.nome_vacina,
      doencas_prevenidas: form.doencas_prevenidas,
      fabricante: form.fabricante,
      intervalo_doses_dias: form.tipo_dose === 'intervalo' ? form.intervalo_doses_dias : 0,
      id_usuario_log: usuario.id_usuario
    };

    try {
      const resposta = await apiFetch('/admin/cadastrar-vacina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem({ texto: dados.mensagem || 'Vacina salva com sucesso!', cor: '#10b981' });
        setTimeout(() => {
          router.push('/veterinario/vacinas');
        }, 1500);
      } else {
        setMensagem({ texto: dados.erro, cor: '#ef4444' });
      }
    } catch (erro) {
      setMensagem({ texto: 'Erro ao conectar com o servidor.', cor: '#ef4444' });
    }
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#f8fafc';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');
  
  const sombraEmoji = isEscuro ? 'drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.4))' : 'none';

  return (
    <LayoutPainel>
      <style>{`
        .premium-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        }
        .premium-btn {
          transition: all 0.2s ease;
        }
        .premium-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif' }}>
        <div style={{ background: bgCard, padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', width: '100%', maxWidth: '500px', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}` }}>
          
          <h2 style={{ color: headerColor, margin: '0 0 24px 0', fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ filter: sombraEmoji }}>💉</span> Cadastrar Vacina
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Nome da Vacina:</label>
              <input 
                type="text" 
                className="premium-input"
                value={form.nome_vacina} 
                onChange={(e) => setForm({ ...form, nome_vacina: e.target.value })} 
                required 
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Fabricante:</label>
              <input 
                type="text" 
                className="premium-input"
                value={form.fabricante} 
                onChange={(e) => setForm({ ...form, fabricante: e.target.value })} 
                required 
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Doenças Prevenidas:</label>
              <textarea 
                className="premium-input"
                value={form.doencas_prevenidas} 
                onChange={(e) => setForm({ ...form, doencas_prevenidas: e.target.value })} 
                rows="3" 
                required 
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s', resize: 'vertical' }} 
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Tipo de Dose:</label>
              <select 
                className="premium-input"
                value={form.tipo_dose} 
                onChange={handleTipoDoseChange} 
                required 
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
              >
                <option value="">Selecione...</option>
                <option value="unica">Dose Única</option>
                <option value="intervalo">Múltiplas Doses (Com Intervalo)</option>
              </select>
            </div>

            {form.tipo_dose === 'intervalo' && (
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Intervalo entre doses (em dias):</label>
                <input 
                  type="number" 
                  className="premium-input"
                  value={form.intervalo_doses_dias} 
                  onChange={handleIntervaloChange} 
                  min="0" 
                  required 
                  style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
                />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="premium-btn" style={{ flex: 1, padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>
                Salvar Vacina
              </button>
              <button 
                type="button" 
                className="premium-btn"
                style={{ flex: 1, padding: '14px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }} 
                onClick={() => router.push('/veterinario/vacinas')}
              >
                Cancelar
              </button>
            </div>
          </form>
          
          {mensagem.texto && (
            <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', backgroundColor: mensagem.cor === '#10b981' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: mensagem.cor === '#10b981' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
              {mensagem.texto}
            </div>
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}