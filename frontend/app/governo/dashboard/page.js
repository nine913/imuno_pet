"use client";

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
    let url = `http://localhost:3000/governo/dados-epidemiologicos?id_usuario_log=${userId}&`;
    if (inicio) url += `inicio=${inicio}&`;
    if (fim) url += `fim=${fim}&`;
    if (especie) url += `especie=${especie}&`;
    if (localidade) url += `localidade=${localidade}`;

    try {
      const resposta = await fetch(url);
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
      const chartTextColor = tema === 'escuro' ? '#cccccc' : '#666666';

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
              backgroundColor: ['#fd7e14', '#007bff', '#28a745', '#6f42c1', '#e83e8c'],
              borderWidth: 1
            }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } } }
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
        chartEvolucaoInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Doses Aplicadas',
              data: valores,
              borderColor: chartDataEvolucao.length > 0 ? '#17a2b8' : '#ccc',
              backgroundColor: 'rgba(23, 162, 184, 0.1)',
              fill: true,
              tension: 0.2,
              borderWidth: 3
            }]
          },
          options: { 
            responsive: true, 
            scales: { 
              x: { ticks: { color: chartTextColor } },
              y: { beginAtZero: true, ticks: { stepSize: 1, color: chartTextColor } } 
            },
            plugins: { legend: { labels: { color: chartTextColor } } }
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
              backgroundColor: chartDataTop.length > 0 ? '#fd7e14' : '#ccc',
              borderWidth: 0,
              borderRadius: 4
            }]
          },
          options: { 
            responsive: true, 
            indexAxis: 'y', 
            scales: { 
              x: { beginAtZero: true, ticks: { stepSize: 1, color: chartTextColor } },
              y: { ticks: { color: chartTextColor } } 
            },
            plugins: { legend: { labels: { color: chartTextColor } } }
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
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#ffb3b8' : '#fd7e14');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor }}>
        <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Monitoramento Epidemiológico e Controle de Endemias</h2>
        
        <div style={{ display: 'flex', gap: '15px', backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '25px', alignItems: 'flex-end', flexWrap: 'wrap', border: `1px solid ${borderColor}` }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Data Início:</label>
            <input type="date" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Data Fim:</label>
            <input type="date" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Espécie:</label>
            <select value={filtros.especie} onChange={e => setFiltros({...filtros, especie: e.target.value})} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
              <option value="">Todas as Espécies</option>
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Localidade (Bairro/Cidade):</label>
            <input type="text" value={filtros.localidade} onChange={e => setFiltros({...filtros, localidade: e.target.value})} placeholder="Ex: Centro" style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
          </div>
          <button style={{ padding: '9px 20px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: 'auto', fontSize: 'inherit' }} onClick={handleFiltrar}>Filtrar</button>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#007bff' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: 'white' }}>Total de Doses Aplicadas</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.aplicadas}</h1>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#ffc107', color: '#333' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: '#333' }}>Doses Pendentes</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.pendentes}</h1>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#dc3545' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: 'white' }}>Doses em Atraso (Risco)</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.atrasadas}</h1>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#28a745' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: 'white' }}>Localidades Monitoradas</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.localidades}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: 2, minWidth: '350px', backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', color: textSecundario }}>Evolução Temporal de Imunização</h3>
            <canvas ref={canvasEvolucaoRef}></canvas>
          </div>
          <div style={{ flex: 1, minWidth: '350px', backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', color: textSecundario }}>Cobertura por Espécie</h3>
            <canvas ref={canvasEspecieRef}></canvas>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: 1, minWidth: '350px', backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', color: textSecundario }}>Top 5 Vacinas Mais Aplicadas</h3>
            <canvas ref={canvasTopRef}></canvas>
          </div>
          <div style={{ flex: 2, minWidth: '350px', backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', color: textSecundario }}>Mapeamento de Risco por Localidade</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr>
                    <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Bairro</th>
                    <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Cidade</th>
                    <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Doses Aplicadas</th>
                    <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Doses Atrasadas</th>
                    <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Nível de Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosTabela.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px', color: textSecundario, border: `1px solid ${borderColor}` }}>Nenhum dado registrado para estes filtros.</td></tr>
                  ) : (
                    linhasVisiveis.map((item, idx) => {
                      const aplicadas = parseInt(item.total_aplicadas) || 0;
                      const atrasadas = parseInt(item.total_atrasadas) || 0;
                      const total = aplicadas + atrasadas;
                      
                      let nivelRisco = 'Baixo';
                      let corRisco = '#28a745';
                      
                      if (total > 0) {
                        const percentualAtraso = (atrasadas / total) * 100;
                        if (percentualAtraso >= 30) {
                          nivelRisco = 'Alto';
                          corRisco = '#dc3545';
                        } else if (percentualAtraso >= 10) {
                          nivelRisco = 'Médio';
                          corRisco = '#fd7e14';
                        }
                      }

                      const bgColor = idx % 2 === 0 ? (isEscuro ? '#1e1e1e' : '#ffffff') : (isEscuro ? '#2d2d2d' : '#f2f2f2');

                      return (
                        <tr key={idx} style={{ backgroundColor: bgColor, color: textColor }}>
                          <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.bairro}</td>
                          <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.cidade}</td>
                          <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{aplicadas}</td>
                          <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{atrasadas}</td>
                          <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', color: corRisco, fontWeight: 'bold' }}>{nivelRisco}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            {dadosTabela.length > limiteLinhas && (
              <button 
                onClick={() => setMostrarTodosTabela(!mostrarTodosTabela)} 
                style={{ marginTop: '15px', padding: '10px', width: '100%', backgroundColor: isEscuro ? '#444' : '#f8f9fa', border: `1px solid ${borderColor}`, borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: textColor, fontSize: 'inherit', transition: 'background-color 0.2s' }}
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