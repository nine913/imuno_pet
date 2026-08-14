"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function GestorRelatorios() {
  const [usuario, setUsuario] = useState(null);
  const [dadosRelatorio, setDadosRelatorio] = useState([]);
  const [vacinasLista, setVacinasLista] = useState([]);
  const [vetsLista, setVetsLista] = useState([]);
  const [especiesLista, setEspeciesLista] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    status: '',
    vacina: '',
    especie: '',
    bairro: '',
    aplicante: ''
  });

  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil.toUpperCase() !== 'GESTOR' && user.perfil.toUpperCase() !== 'GESTOR_CLINICA') {
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

    carregarListasFiltros(user.id_clinica);
    gerarRelatorio(user.id_clinica, user.id_usuario);
  }, [router]);

  const carregarListasFiltros = async (idClinica) => {
    try {
      const resVac = await apiFetch('/vacinas');
      if (resVac.ok) {
        setVacinasLista(await resVac.json());
      } else {
        const resVacAdmin = await apiFetch('/admin/vacinas?termo=');
        if (resVacAdmin.ok) {
            setVacinasLista(await resVacAdmin.json());
        }
      }
      
      const resVet = await apiFetch(`/gestor/veterinarios-lista?id_clinica=${idClinica}&termo=`);
      if (resVet.ok) {
        setVetsLista(await resVet.json());
      }

      const resEsp = await apiFetch('/admin/especies');
      if (resEsp.ok) {
        setEspeciesLista(await resEsp.json());
      }

    } catch (erro) {}
  };

  const gerarRelatorio = async (idClinicaOverride, idUserOverride) => {
    setCarregando(true);
    const idClinica = idClinicaOverride || (usuario ? usuario.id_clinica : null);
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');

    if (!idClinica) {
        setCarregando(false);
        return;
    }

    let url = `/gestor/relatorios-avancados?id_clinica=${idClinica}&id_usuario_log=${userId}&`;
    if (filtros.data_inicio) url += `inicio=${filtros.data_inicio}&`;
    if (filtros.data_fim) url += `fim=${filtros.data_fim}&`;
    if (filtros.vacina) url += `vacina=${filtros.vacina}&`;
    if (filtros.especie) url += `especie=${filtros.especie}&`;
    if (filtros.bairro) url += `bairro=${filtros.bairro}&`;
    if (filtros.status) url += `status=${filtros.status}&`;
    if (filtros.aplicante) url += `aplicante=${filtros.aplicante}`;

    try {
      const resposta = await apiFetch(url);
      if (resposta.ok) {
        setDadosRelatorio(await resposta.json());
      } else {
        setDadosRelatorio([]);
      }
    } catch (erro) {
      setDadosRelatorio([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleChangeFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const baixarPDF = async () => {
    const elemento = document.getElementById('area-relatorio');
    const opcoes = {
      margin: 10,
      filename: 'relatorio_estrategico_gestor.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opcoes).from(elemento).save();
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
        @media print {
          body { background-color: white !important; padding: 0; color: black !important; }
          .container { box-shadow: none; padding: 0; max-width: 100%; border: none; }
          .nao-imprimir { display: none !important; }
          table { font-size: 11px; border-collapse: collapse; width: 100%; color: black !important; }
          th, td { border: 1px solid #cbd5e1 !important; padding: 8px; text-align: left; }
          th { background-color: #f1f5f9 !important; color: black !important; font-weight: bold; }
          td { background-color: white !important; color: black !important; }
          .total-box { border: 2px solid #10b981; color: black !important; background-color: white !important; }
          .total-box h2 { color: black !important; }
          * { color: black !important; }
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div className="nao-imprimir" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: headerColor, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Relatórios Clínicos</h2>
            <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Filtre e exporte os dados de imunização da sua clínica.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="premium-btn" style={{ padding: '12px 20px', color: '#0f172a', border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', backgroundColor: bgCard, fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => window.print()}>
              <span style={{ filter: sombraEmoji }}>🖨️</span> Imprimir
            </button>
            <button className="premium-btn" style={{ padding: '12px 20px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#0f766e', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(15, 118, 110, 0.2)' }} onClick={baixarPDF}>
              <span style={{ fontSize: '16px', filter: sombraEmoji }}>📄</span> Exportar PDF
            </button>
          </div>
        </div>
        
        <div id="area-relatorio" style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', border: `1px solid ${borderColor}`, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
          <h2 className="nao-imprimir" style={{ color: headerColor, marginTop: 0, marginBottom: '24px', fontSize: '20px', display: 'none' }}>Relatório de Vacinação e Atendimentos</h2>
          
          <div className="nao-imprimir" style={{ display: 'flex', gap: '16px', backgroundColor: inputBg, padding: '24px', borderRadius: '12px', marginBottom: '24px', alignItems: 'flex-end', flexWrap: 'wrap', border: `1px solid ${borderColor}` }} data-html2canvas-ignore="true">
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: textSecundario, fontSize: '13px' }}>Data Início:</label>
              <input type="date" className="premium-input" value={filtros.data_inicio} onChange={e => handleChangeFiltro('data_inicio', e.target.value)} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: bgCard, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: textSecundario, fontSize: '13px' }}>Data Fim:</label>
              <input type="date" className="premium-input" value={filtros.data_fim} onChange={e => handleChangeFiltro('data_fim', e.target.value)} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: bgCard, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: textSecundario, fontSize: '13px' }}>Status:</label>
              <select className="premium-input" value={filtros.status} onChange={e => handleChangeFiltro('status', e.target.value)} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: bgCard, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                <option value="">Todos</option>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ATRASADA">Atrasada</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: textSecundario, fontSize: '13px' }}>Vacina:</label>
              <select className="premium-input" value={filtros.vacina} onChange={e => handleChangeFiltro('vacina', e.target.value)} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: bgCard, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                <option value="">Todas</option>
                {vacinasLista.map(v => (
                  <option key={v.id_vacina} value={v.id_vacina}>{v.nome_vacina}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: textSecundario, fontSize: '13px' }}>Espécie:</label>
              <select className="premium-input" value={filtros.especie} onChange={e => handleChangeFiltro('especie', e.target.value)} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: bgCard, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                <option value="">Todas</option>
                {especiesLista.map(e => (
                  <option key={e.id_especie} value={e.nome_especie}>{e.nome_especie}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: textSecundario, fontSize: '13px' }}>Localidade (Bairro):</label>
              <input type="text" className="premium-input" value={filtros.bairro} onChange={e => handleChangeFiltro('bairro', e.target.value)} placeholder="Ex: Centro" style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: bgCard, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: textSecundario, fontSize: '13px' }}>Veterinário:</label>
              <select className="premium-input" value={filtros.aplicante} onChange={e => handleChangeFiltro('aplicante', e.target.value)} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: bgCard, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                <option value="">Todos</option>
                {vetsLista.map(v => (
                  <option key={v.id_veterinario} value={v.id_veterinario}>{v.nome_completo}</option>
                ))}
              </select>
            </div>
            <button className="premium-btn" style={{ padding: '0 24px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', backgroundColor: '#2563eb', fontWeight: '600', height: '45px', fontSize: '14px' }} onClick={() => gerarRelatorio()}>
              Gerar Relatório
            </button>
          </div>

          <div className="total-box" style={{ backgroundColor: isEscuro ? '#064e3b' : '#d1fae5', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '24px', border: `1px solid ${isEscuro ? '#047857' : '#10b981'}` }}>
            <h2 style={{ margin: 0, color: isEscuro ? '#34d399' : '#047857', fontSize: '18px', fontWeight: '700' }}>{dadosRelatorio.length} Registros Encontrados</h2>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Data (App/Venc)</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Status</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Vacina</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Paciente</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Espécie</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Porte / Fase</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Tutor</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Telefone</th>
                  <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Aplicante (CRMV)</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: textSecundario, fontWeight: '500' }}>Carregando dados do relatório...</td></tr>
                ) : dadosRelatorio.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: textSecundario, fontWeight: '500' }}>Nenhum registro encontrado para os filtros selecionados.</td></tr>
                ) : (
                  dadosRelatorio.map((item, idx) => {
                    const dataBase = item.status === 'APLICADA' ? item.data_aplicacao : item.data_proxima_dose;
                    const dataExibicao = dataBase ? new Date(dataBase).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
                    
                    let corStatus, bgBadge;
                    if (item.status === 'APLICADA') {
                      corStatus = isEscuro ? '#34d399' : '#047857';
                      bgBadge = isEscuro ? '#064e3b' : '#d1fae5';
                    } else if (item.status === 'ATRASADA') {
                      corStatus = isEscuro ? '#fca5a5' : '#b91c1c';
                      bgBadge = isEscuro ? '#7f1d1d' : '#fee2e2';
                    } else {
                      corStatus = isEscuro ? '#fbbf24' : '#b45309';
                      bgBadge = isEscuro ? '#78350f' : '#fef3c7';
                    }

                    const bgColor = idx % 2 === 0 ? 'transparent' : inputBg;

                    return (
                      <tr key={idx} style={{ backgroundColor: bgColor, color: textColor, borderBottom: `1px solid ${borderColor}` }}>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '500' }}>{dataExibicao}</td>
                        <td style={{ padding: '16px', textAlign: 'left' }}>
                          <span style={{ backgroundColor: bgBadge, color: corStatus, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: headerColor }}>{item.nome_vacina}</td>
                        <td style={{ padding: '16px', textAlign: 'left' }}>
                          <strong style={{ display: 'block' }}>{item.nome_animal}</strong>
                          <span style={{ fontSize: '12px', color: textSecundario }}>{item.raca}</span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'left' }}>{item.especie}</td>
                        <td style={{ padding: '16px', textAlign: 'left' }}>
                          <span style={{ display: 'block' }}>{item.porte}</span>
                          <span style={{ fontSize: '12px', color: textSecundario }}>{item.fase_vida}</span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'left' }}>{item.nome_tutor}</td>
                        <td style={{ padding: '16px', textAlign: 'left' }}>{item.telefone}</td>
                        <td style={{ padding: '16px', textAlign: 'left' }}>
                          {item.nome_vet ? (
                            <>
                              <span style={{ display: 'block' }}>{item.nome_vet}</span>
                              <span style={{ fontSize: '12px', color: textSecundario }}>{item.crmv_vet}</span>
                            </>
                          ) : '-'}
                        </td>
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