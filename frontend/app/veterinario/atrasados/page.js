"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function VetAtrasados() {
  const [usuario, setUsuario] = useState(null);
  const [atrasados, setAtrasados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

  const carregarAtrasados = async (id_clinica) => {
    setCarregando(true);
    setErro('');
    
    if (!id_clinica) {
      setCarregando(false);
      return;
    }

    try {
      const resposta = await apiFetch(`/animais-atrasados?id_clinica=${id_clinica}`);
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza a sessão salva em localStorage (sistema externo, só existe no cliente) na montagem; padrão seguro para SSR
    setUsuario(user);
    carregarAtrasados(user.id_clinica);

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
  }, [router]);

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#f87171' : '#dc2626');
  
  const sombraEmoji = isEscuro ? 'drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.4))' : 'none';

  return (
    <LayoutPainel>
      <style>{`
        .premium-btn {
          transition: all 0.2s ease;
        }
        .premium-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .premium-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '8px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ filter: sombraEmoji }}>⚠️</span> Controle de Atrasados
          </h2>
          <p style={{ color: textSecundario, fontSize: '15px', margin: 0 }}>Lista de pacientes com doses pendentes após a data de vencimento.</p>
        </div>
        
        <div>
          {carregando ? (
            <div style={{ textAlign: 'center', padding: '40px', color: textSecundario, fontWeight: '500' }}>Carregando registros...</div>
          ) : erro ? (
            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', fontWeight: '500' }}>{erro}</div>
          ) : atrasados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: '#10b981', fontWeight: '600', fontSize: '18px' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>✅</span>
              Nenhuma vacina atrasada no sistema! Ótimo trabalho.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {atrasados.map((item, index) => {
                const dataVenc = new Date(item.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                const telLimpo = item.telefone ? item.telefone.replace(/\D/g, '') : '';
                const mensagemWhats = `Olá, ${item.nome_tutor}. Notamos no sistema ImunoPet que a vacina ${item.nome_vacina} do(a) ${item.nome_animal} venceu em ${dataVenc}. Gostaria de agendar a nova dose?`;
                const linkWhats = `https://wa.me/55${telLimpo}?text=${encodeURIComponent(mensagemWhats)}`;

                return (
                  <div key={index} className="premium-card" style={{ 
                    border: `1px solid ${borderColor}`, 
                    borderLeft: `6px solid ${isEscuro ? '#991b1b' : '#ef4444'}`, 
                    padding: '24px', 
                    borderRadius: '16px', 
                    backgroundColor: bgCard, 
                    color: textColor, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '20px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isEscuro ? '#7f1d1d' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', filter: sombraEmoji, flexShrink: 0 }}>
                        🐾
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', color: textColor, margin: '0 0 6px 0', fontWeight: '700' }}>
                          {item.nome_animal} <span style={{ fontSize: '14px', color: textSecundario, fontWeight: '500' }}>({item.especie})</span>
                        </h3>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', backgroundColor: isEscuro ? '#1e1e1e' : '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, display: 'inline-block' }}>
                            Vacina: <strong style={{ color: headerColor }}>{item.nome_vacina}</strong> | Venceu em: <strong>{dataVenc}</strong>
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', color: textSecundario }}>
                          <strong>Tutor:</strong> {item.nome_tutor} | <strong>Contato:</strong> {item.telefone}
                        </span>
                      </div>
                    </div>
                    <a href={linkWhats} target="_blank" rel="noopener noreferrer" className="premium-btn" style={{ 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      padding: '12px 20px', 
                      border: 'none', 
                      borderRadius: '10px', 
                      cursor: 'pointer', 
                      fontWeight: '600', 
                      textDecoration: 'none', 
                      fontSize: '14px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}>
                      <span style={{ fontSize: '18px', filter: sombraEmoji }}>📱</span> Chamar no WhatsApp
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}