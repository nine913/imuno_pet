"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';
import LayoutPainel from '../../components/LayoutPainel';

export default function GovernoDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [filtros, setFiltros] = useState({ inicio: '', fim: '', especie: '', localidade: '' });
  const [kpis, setKpis] = useState({ aplicadas: 0, atrasadas: 0, pendentes: 0, localidades: 0 });
  const [dadosTabela, setDadosTabela] = useState([]);
  const [mostrarTodosTabela, setMostrarTodosTabela] = useState(false);
  
  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [chartDataEspecie, setChartDataEspecie] = useState([]);
  const [chartDataEvolucao, setChartDataEvolucao] = useState([]);
  const [chartDataTop, setChartDataTop] = useState([]);

  const canvasEspecieRef = useRef(null);
  const canvasEvolucaoRef = useRef(null);
  const canvasTopRef = useRef(null);

  const chartEspecieInstance = useRef(null);
  const chartEvolucaoInstance = useRef(null);
  const chartTopInstance = useRef(null);

  const router = useRouter();
  const limiteLinhas = 5;

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil.toUpperCase() !== 'GOVERNO') {
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

    const initialInicio = '2023-01-01';
    const initialFim = '2026-12-31';
    
    setFiltros(prev => ({ ...prev, inicio: initialInicio, fim: initialFim }));
    carregarDadosOrgao(initialInicio, initialFim, '', '', user.id_usuario);
  }, [router]);

  const carregarDadosOrgao = async (inicio, fim, especie, localidade, idUsuarioLog) => {
    const userId = idUsuarioLog || (usuario ? usuario.id_usuario : '');
    let url = `/governo/dados-epidemiologicos?id_usuario_log=${userId}&`;
    if (inicio) url += `inicio=${inicio}&`;
    if (fim) url += `fim=${fim}&`;
    if (especie) url += `especie=${especie}&`;
    if (localidade) url += `localidade=${localidade}`;

    try {
      const resposta = await apiFetch(url);
      if (resposta.ok) {
        const dados = await resposta.json();
        
        const riscoRegiao = dados.riscoRegiao || [];
        let totalAplicadas = 0;
        let totalAtrasadas = 0;
        let totalPendentes = 0;
        
        riscoRegiao.forEach(item => {
          totalAplicadas += parseInt(item.total_aplicadas) || 0;
          totalAtrasadas += parseInt(item.total_atrasadas) || 0;
          totalPendentes += parseInt(item.total_pendentes) || 0;
        });

        setKpis({
          aplicadas: totalAplicadas,
          atrasadas: totalAtrasadas,
          pendentes: totalPendentes,
          localidades: riscoRegiao.length
        });

        setDadosTabela(riscoRegiao);
        setMostrarTodosTabela(false);
        setChartDataEspecie(dados.coberturaEspecie || []);
        setChartDataEvolucao(dados.evolucaoTemporal || []);
        setChartDataTop(dados.topVacinas || []);
      }
    } catch (erro) {}
  };

  const handleFiltrar = () => {
    carregarDadosOrgao(filtros.inicio, filtros.fim, filtros.especie, filtros.localidade, usuario?.id_usuario);
  };

  useEffect(() => {
    const renderCharts = () => {
      const chartTextColor = tema === 'escuro' ? '#94a3b8' : '#64748b';
      const gridColor = tema === 'escuro' ? '#334155' : '#e2e8f0';

      if (chartEspecieInstance.current) chartEspecieInstance.current.destroy();
      if (canvasEspecieRef.current) {
        const ctx = canvasEspecieRef.current.getContext('2d');
        let labels = ['Sem dados'];
        let valores = [1];
        if (chartDataEspecie.length > 0) {
          labels = chartDataEspecie.map(item => item.especie);
          valores = chartDataEspecie.map(item => item.total_vacinados);
        }
        chartEspecieInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{
              data: valores,
              backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'],
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: { 
            responsive: true, 
            cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { color: chartTextColor, font: { family: "'Inter', sans-serif", size: 13 } } } } 
          }
        });
      }

      if (chartEvolucaoInstance.current) chartEvolucaoInstance.current.destroy();
      if (canvasEvolucaoRef.current) {
        const ctx = canvasEvolucaoRef.current.getContext('2d');
        let labels = ['Nenhum registro'];
        let valores = [0];
        if (chartDataEvolucao.length > 0) {
          labels = chartDataEvolucao.map(item => {
            if (!item.mes) return 'Desconhecido';
            const partes = item.mes.split('-');
            return partes.length > 1 ? `${partes[1]}/${partes[0]}` : item.mes;
          });
          valores = chartDataEvolucao.map(item => item.quantidade);
        }
        
        // Gradiente para a linha
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

        chartEvolucaoInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Doses Aplicadas',
              data: valores,
              borderColor: chartDataEvolucao.length > 0 ? '#38bdf8' : '#cbd5e1',
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#38bdf8',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }]
          },
          options: { 
            responsive: true, 
            scales: { 
              x: { grid: { display: false }, ticks: { color: chartTextColor, font: { family: "'Inter', sans-serif" } } },
              y: { grid: { color: gridColor }, beginAtZero: true, ticks: { stepSize: 1, color: chartTextColor, font: { family: "'Inter', sans-serif" } } } 
            },
            plugins: { legend: { display: false } }
          }
        });
      }

      if (chartTopInstance.current) chartTopInstance.current.destroy();
      if (canvasTopRef.current) {
        const ctx = canvasTopRef.current.getContext('2d');
        let labels = ['Sem dados'];
        let valores = [0];
        if (chartDataTop.length > 0) {
          labels = chartDataTop.map(item => item.nome_vacina);
          valores = chartDataTop.map(item => item.quantidade);
        }
        chartTopInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Aplicações',
              data: valores,
              backgroundColor: chartDataTop.length > 0 ? '#f97316' : '#cbd5e1',
              borderWidth: 0,
              borderRadius: 6,
              barPercentage: 0.6
            }]
          },
          options: { 
            responsive: true, 
            indexAxis: 'y', 
            scales: { 
              x: { grid: { color: gridColor }, beginAtZero: true, ticks: { stepSize: 1, color: chartTextColor, font: { family: "'Inter', sans-serif" } } },
              y: { grid: { display: false }, ticks: { color: chartTextColor, font: { family: "'Inter', sans-serif" } } } 
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    };

    if (usuario) {
      renderCharts();
    }
  }, [chartDataEspecie, chartDataEvolucao, chartDataTop, usuario, tema]);

  if (!usuario) return null;

  const linhasVisiveis = mostrarTodosTabela ? dadosTabela : dadosTabela.slice(0, limiteLinhas);

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#f8fafc';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#fca5a5' : '#ea580c');
  
  const sombraEmoji = isEscuro ? 'drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.4))' : 'none';

  return (
    <LayoutPainel>
      <style>{`
        .premium-input:focus {
          border-color: #f97316 !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1) !important;
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

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: headerColor, margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Monitoramento Epidemiológico</h2>
          <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Painel de controle de endemias e vacinação regional.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', backgroundColor: bgCard, padding: '24px', borderRadius: '16px', marginBottom: '32px', alignItems: 'flex-end', flexWrap: 'wrap', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: textSecundario, marginBottom: '6px', fontSize: '13px' }}>Data Início:</label>
            <input type="date" className="premium-input" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: textSecundario, marginBottom: '6px', fontSize: '13px' }}>Data Fim:</label>
            <input type="date" className="premium-input" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: textSecundario, marginBottom: '6px', fontSize: '13px' }}>Espécie:</label>
            <select className="premium-input" value={filtros.especie} onChange={e => setFiltros({...filtros, especie: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
              <option value="">Todas as Espécies</option>
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: textSecundario, marginBottom: '6px', fontSize: '13px' }}>Localidade (Bairro/Cidade):</label>
            <input type="text" className="premium-input" value={filtros.localidade} onChange={e => setFiltros({...filtros, localidade: e.target.value})} placeholder="Ex: Centro" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
          </div>
          <button className="premium-btn" style={{ padding: '0 24px', backgroundColor: '#ea580c', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', height: '45px', fontSize: '14px' }} onClick={handleFiltrar}>Filtrar Dados</button>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#1d4ed8' : '#3b82f6', border: `1px solid ${isEscuro ? '#1e3a8a' : '#60a5fa'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Total de Doses Aplicadas</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{kpis.aplicadas}</h1>
          </div>
          <div style={{ padding: '24px', borderRadius: '16px', color: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#b45309' : '#f59e0b', border: `1px solid ${isEscuro ? '#78350f' : '#fcd34d'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9, color: isEscuro ? '#fffbeb' : '#451a03' }}>Doses Pendentes</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: isEscuro ? '#fff' : '#0f172a' }}>{kpis.pendentes}</h1>
          </div>
          <div style={{ padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#b91c1c' : '#ef4444', border: `1px solid ${isEscuro ? '#7f1d1d' : '#fca5a5'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Doses em Atraso (Risco)</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{kpis.atrasadas}</h1>
          </div>
          <div style={{ padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#047857' : '#10b981', border: `1px solid ${isEscuro ? '#064e3b' : '#34d399'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Localidades Monitoradas</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{kpis.localidades}</h1>
          </div>
        </div>

        {/* Gráficos Linha 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Evolução Temporal de Imunização</h3>
            <canvas ref={canvasEvolucaoRef}></canvas>
          </div>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Cobertura por Espécie</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '300px' }}>
              <canvas ref={canvasEspecieRef}></canvas>
            </div>
          </div>
        </div>

        {/* Gráficos Linha 2 e Tabela */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Top 5 Vacinas Mais Aplicadas</h3>
            <canvas ref={canvasTopRef}></canvas>
          </div>
          
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Mapeamento de Risco por Localidade</h3>
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: `1px solid ${borderColor}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Bairro</th>
                    <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Cidade</th>
                    <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Aplicadas</th>
                    <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Atrasadas</th>
                    <th style={{ borderBottom: `2px solid ${borderColor}`, padding: '16px', textAlign: 'left', backgroundColor: isEscuro ? '#0f172a' : '#f8fafc', color: textSecundario, fontWeight: '700' }}>Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosTabela.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: textSecundario, fontWeight: '500' }}>Nenhum dado registrado para estes filtros.</td></tr>
                  ) : (
                    linhasVisiveis.map((item, idx) => {
                      const aplicadas = parseInt(item.total_aplicadas) || 0;
                      const atrasadas = parseInt(item.total_atrasadas) || 0;
                      const total = aplicadas + atrasadas;
                      
                      let nivelRisco = 'Baixo';
                      let corRiscoText = isEscuro ? '#34d399' : '#047857';
                      let corRiscoBg = isEscuro ? '#064e3b' : '#d1fae5';
                      
                      if (total > 0) {
                        const percentualAtraso = (atrasadas / total) * 100;
                        if (percentualAtraso >= 30) {
                          nivelRisco = 'Alto';
                          corRiscoText = isEscuro ? '#f87171' : '#b91c1c';
                          corRiscoBg = isEscuro ? '#7f1d1d' : '#fee2e2';
                        } else if (percentualAtraso >= 10) {
                          nivelRisco = 'Médio';
                          corRiscoText = isEscuro ? '#fbbf24' : '#b45309';
                          corRiscoBg = isEscuro ? '#78350f' : '#fef3c7';
                        }
                      }

                      const bgColor = idx % 2 === 0 ? 'transparent' : inputBg;

                      return (
                        <tr key={idx} style={{ backgroundColor: bgColor, color: textColor, borderBottom: `1px solid ${borderColor}` }}>
                          <td style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>{item.bairro}</td>
                          <td style={{ padding: '16px', textAlign: 'left', color: textSecundario }}>{item.cidade}</td>
                          <td style={{ padding: '16px', textAlign: 'left', fontWeight: '500' }}>{aplicadas}</td>
                          <td style={{ padding: '16px', textAlign: 'left', fontWeight: '500' }}>{atrasadas}</td>
                          <td style={{ padding: '16px', textAlign: 'left' }}>
                            <span style={{ backgroundColor: corRiscoBg, color: corRiscoText, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                              {nivelRisco}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {dadosTabela.length > limiteLinhas && (
              <button 
                className="premium-btn"
                onClick={() => setMostrarTodosTabela(!mostrarTodosTabela)} 
                style={{ marginTop: '20px', padding: '12px', width: '100%', backgroundColor: inputBg, border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', fontWeight: '600', color: textSecundario, fontSize: '14px' }}
              >
                {mostrarTodosTabela ? 'Ver Menos ▲' : `Ver Mais (${dadosTabela.length - limiteLinhas} ocultos) ▼`}
              </button>
            )}
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}