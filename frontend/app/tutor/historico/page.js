"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

function HistoricoConteudo() {
  const [usuario, setUsuario] = useState(null);
  const [nomeAnimal, setNomeAnimal] = useState('Carregando...');
  const [historico, setHistorico] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const idAnimalUrl = searchParams.get('id');

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    setUsuario(user);

    if (!idAnimalUrl) {
      router.push('/tutor/animais');
      return;
    }

    carregarDetalhesPet(user.id_usuario);
    carregarHistoricoTutor(user.id_usuario, '', '');

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
  }, [idAnimalUrl, router]);

  const carregarDetalhesPet = async (userId) => {
    const id = userId || usuario?.id_usuario;
    try {
      const resposta = await apiFetch(`/detalhes-animal/${idAnimalUrl}?id_usuario_log=${id}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setNomeAnimal(dados.nome_animal);
      }
    } catch (erro) {}
  };

  const carregarHistoricoTutor = async (idUserOverride, termo = termoBusca, status = statusFiltro) => {
    setCarregando(true);
    setErro('');
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');
    try {
      const resposta = await apiFetch(`/historico-pet/${idAnimalUrl}?termo=${termo}&status=${status}&id_usuario_log=${userId}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setHistorico(dados);
      } else {
        setErro('Nenhum registro de vacina encontrado com esses critérios.');
      }
    } catch (erro) {
      setErro('Erro ao carregar a carteira de vacinação.');
    } finally {
      setCarregando(false);
    }
  };

  const handleBuscar = () => {
    carregarHistoricoTutor(usuario.id_usuario, termoBusca, statusFiltro);
  };

  const baixarCarteirinhaPDF = async () => {
    const elemento = document.getElementById('area-carteira');
    const cabecalho = document.getElementById('cabecalhoImpresso');
    
    cabecalho.style.display = 'block';
    
    const opcoes = {
      margin: 15,
      filename: `carteira_vacinacao_${nomeAnimal.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const html2pdf = (await import('html2pdf.js')).default;

    html2pdf().set(opcoes).from(elemento).save().then(() => {
      cabecalho.style.display = 'none';
    });
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#f8fafc';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');

  return (
    <LayoutPainel>
      <style>{`
        @media print {
          body { background-color: white !important; padding: 0; color: black !important; }
          .container { box-shadow: none; padding: 0; max-width: 100%; border: none; }
          .nao-imprimir { display: none !important; }
          .cabecalho-carteira { display: block !important; }
          * { color: black !important; }
        }
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

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div className="nao-imprimir" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <button className="premium-btn" style={{ padding: '12px 20px', color: '#475569', border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', fontSize: '14px', backgroundColor: bgCard, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => router.push('/tutor/animais')}>
            <span>←</span> Voltar aos Meus Pets
          </button>
          <button className="premium-btn" style={{ padding: '12px 24px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#0f766e', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(15, 118, 110, 0.2)' }} onClick={baixarCarteirinhaPDF}>
            <span style={{ fontSize: '16px' }}>📄</span> Baixar PDF
          </button>
        </div>
        
        <div id="area-carteira" style={{ padding: '40px', borderRadius: '16px', border: `1px solid ${borderColor}`, backgroundColor: bgCard, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          <div className="cabecalho-carteira" id="cabecalhoImpresso" style={{ display: 'none', textAlign: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ color: '#2563eb', margin: '0 0 10px 0', fontSize: '24px' }}>ImunoPet Brasil</h1>
            <h2 id="tituloPetImpresso" style={{ color: '#0f172a', margin: 0, fontSize: '18px' }}>Paciente: {nomeAnimal}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: isEscuro ? '#1e3a8a' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              📘
            </div>
            <div>
              <h2 className="nao-imprimir" style={{ color: headerColor, margin: '0 0 4px 0', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Carteira de Vacinação</h2>
              <span style={{ color: textSecundario, fontSize: '14px', fontWeight: '500' }}>Paciente: {nomeAnimal}</span>
            </div>
          </div>
          
          <div className="nao-imprimir" style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }} data-html2canvas-ignore="true">
            <input 
              type="text" 
              className="premium-input"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Pesquisar por vacina..." 
              style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', flex: 2, minWidth: '200px', outline: 'none', transition: 'all 0.2s' }} 
            />
            <select 
              className="premium-input"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', flex: 1, minWidth: '150px', outline: 'none', transition: 'all 0.2s' }}
            >
              <option value="">Status: Todos</option>
              <option value="APLICADA">Aplicadas</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="ATRASADA">Atrasadas</option>
            </select>
            <button className="premium-btn" style={{ padding: '0 24px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#2563eb', fontWeight: '600' }} onClick={handleBuscar}>
              Filtrar
            </button>
          </div>

          <div id="conteudoHistorico" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {carregando ? (
              <div style={{ textAlign: 'center', padding: '30px', color: textSecundario, fontWeight: '500' }}>Carregando dados médicos...</div>
            ) : erro ? (
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '10px', border: '1px solid #fecaca', fontWeight: '500' }}>{erro}</div>
            ) : historico.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', borderRadius: '12px', border: `1px dashed ${borderColor}`, color: textSecundario }}>Nenhum registro médico encontrado.</div>
            ) : (
              historico.map(reg => {
                const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
                const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
                
                let corStatus, bgBadge, textBadge;
                if (reg.status === 'APLICADA') {
                  corStatus = '#10b981';
                  bgBadge = isEscuro ? '#064e3b' : '#d1fae5';
                  textBadge = isEscuro ? '#34d399' : '#047857';
                } else if (reg.status === 'ATRASADA') {
                  corStatus = '#ef4444';
                  bgBadge = isEscuro ? '#7f1d1d' : '#fee2e2';
                  textBadge = isEscuro ? '#f87171' : '#b91c1c';
                } else {
                  corStatus = '#f59e0b';
                  bgBadge = isEscuro ? '#78350f' : '#fef3c7';
                  textBadge = isEscuro ? '#fbbf24' : '#b45309';
                }

                return (
                  <div key={reg.id_registro} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: `4px solid ${corStatus}`, backgroundColor: inputBg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <strong style={{ fontSize: '18px', color: textColor, fontWeight: '700' }}>{reg.nome_vacina}</strong>
                      <span style={{ backgroundColor: bgBadge, color: textBadge, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                        {reg.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: bgCard, padding: '16px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Data de Aplicação</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{dataApp}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Próxima Dose / Vencimento</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{dataProx}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span style={{ fontSize: '13px', color: textSecundario, display: 'flex', gap: '6px' }}>
                        <strong>Imunização contra:</strong> {reg.doencas_prevenidas}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}

export default function HistoricoVacinacao() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', fontFamily: '"Inter", sans-serif', textAlign: 'center', color: '#64748b' }}>Carregando dados da carteira...</div>}>
      <HistoricoConteudo />
    </Suspense>
  );
}