"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';

export default function GovernoDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [filtros, setFiltros] = useState({ inicio: '', fim: '', especie: '', localidade: '' });
  const [kpis, setKpis] = useState({ aplicadas: 0, atrasadas: 0, pendentes: 0, localidades: 0 });
  const [dadosTabela, setDadosTabela] = useState([]);
  const [mostrarTodosTabela, setMostrarTodosTabela] = useState(false);
  
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
    } catch (erro) {
      console.error(erro);
    }
  };

  const handleFiltrar = () => {
    carregarDadosOrgao(filtros.inicio, filtros.fim, filtros.especie, filtros.localidade, usuario?.id_usuario);
  };

  useEffect(() => {
    const renderCharts = () => {
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
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
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
          options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
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
          options: { responsive: true, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
      }
    };

    if (usuario) {
      renderCharts();
    }
  }, [chartDataEspecie, chartDataEvolucao, chartDataTop, usuario]);

  if (!usuario) return null;

  const linhasVisiveis = mostrarTodosTabela ? dadosTabela : dadosTabela.slice(0, limiteLinhas);

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Painel</button>
        
        <h2 style={styles.h2}>Monitoramento Epidemiológico e Controle de Endemias</h2>
        
        <div style={styles.filtrosBox}>
          <div style={styles.filtroItem}>
            <label style={styles.label}>Data Início:</label>
            <input type="date" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} style={styles.input} />
          </div>
          <div style={styles.filtroItem}>
            <label style={styles.label}>Data Fim:</label>
            <input type="date" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} style={styles.input} />
          </div>
          <div style={styles.filtroItem}>
            <label style={styles.label}>Espécie:</label>
            <select value={filtros.especie} onChange={e => setFiltros({...filtros, especie: e.target.value})} style={styles.input}>
              <option value="">Todas as Espécies</option>
              <option value="Cachorro">Cachorro</option>
              <option value="Gato">Gato</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div style={styles.filtroItem}>
            <label style={styles.label}>Localidade (Bairro/Cidade):</label>
            <input type="text" value={filtros.localidade} onChange={e => setFiltros({...filtros, localidade: e.target.value})} placeholder="Ex: Centro" style={styles.input} />
          </div>
          <button style={styles.btnFiltrar} onClick={handleFiltrar}>Filtrar</button>
        </div>

        <div style={styles.kpiGrid}>
          <div style={{ ...styles.kpiCard, backgroundColor: '#007bff' }}>
            <h3 style={styles.kpiTitle}>Total de Doses Aplicadas</h3>
            <h1 style={styles.kpiValue}>{kpis.aplicadas}</h1>
          </div>
          <div style={{ ...styles.kpiCard, backgroundColor: '#ffc107', color: '#333' }}>
            <h3 style={{ ...styles.kpiTitle, color: '#333' }}>Doses Pendentes (Agendadas)</h3>
            <h1 style={styles.kpiValue}>{kpis.pendentes}</h1>
          </div>
          <div style={{ ...styles.kpiCard, backgroundColor: '#dc3545' }}>
            <h3 style={styles.kpiTitle}>Doses em Atraso (Risco)</h3>
            <h1 style={styles.kpiValue}>{kpis.atrasadas}</h1>
          </div>
          <div style={{ ...styles.kpiCard, backgroundColor: '#28a745' }}>
            <h3 style={styles.kpiTitle}>Localidades Monitoradas</h3>
            <h1 style={styles.kpiValue}>{kpis.localidades}</h1>
          </div>
        </div>

        <div style={styles.layoutGrid}>
          <div style={{ ...styles.box, flex: 2 }}>
            <h3 style={styles.boxTitle}>Evolução Temporal de Imunização</h3>
            <canvas ref={canvasEvolucaoRef}></canvas>
          </div>
          <div style={styles.box}>
            <h3 style={styles.boxTitle}>Cobertura por Espécie</h3>
            <canvas ref={canvasEspecieRef}></canvas>
          </div>
        </div>

        <div style={styles.layoutGrid}>
          <div style={styles.box}>
            <h3 style={styles.boxTitle}>Top 5 Vacinas Mais Aplicadas</h3>
            <canvas ref={canvasTopRef}></canvas>
          </div>
          <div style={{ ...styles.box, flex: 2 }}>
            <h3 style={styles.boxTitle}>Mapeamento de Risco por Localidade</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.tabela}>
                <thead>
                  <tr>
                    <th style={styles.th}>Bairro</th>
                    <th style={styles.th}>Cidade</th>
                    <th style={styles.th}>Doses Aplicadas</th>
                    <th style={styles.th}>Doses Atrasadas</th>
                    <th style={styles.th}>Nível de Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosTabela.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px', color: '#333' }}>Nenhum dado registrado para estes filtros.</td></tr>
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

                      const bgColor = idx % 2 === 0 ? '#fff' : '#f2f2f2';

                      return (
                        <tr key={idx} style={{ backgroundColor: bgColor, color: '#333' }}>
                          <td style={styles.td}>{item.bairro}</td>
                          <td style={styles.td}>{item.cidade}</td>
                          <td style={styles.td}>{aplicadas}</td>
                          <td style={styles.td}>{atrasadas}</td>
                          <td style={{ ...styles.td, color: corRisco, fontWeight: 'bold' }}>{nivelRisco}</td>
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
                style={styles.btnMostrarTudo}
              >
                {mostrarTodosTabela ? 'Ver Menos ▲' : `Ver Mais (${dadosTabela.length - limiteLinhas} ocultos) ▼`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '1200px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#000000', marginTop: 0, marginBottom: '20px' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' },
  filtrosBox: { display: 'flex', gap: '15px', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '25px', alignItems: 'flex-end', flexWrap: 'wrap' },
  filtroItem: { flex: 1, minWidth: '150px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#333' },
  btnFiltrar: { padding: '9px 20px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '35px' },
  kpiGrid: { display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  kpiTitle: { margin: 0, fontSize: '14px', textTransform: 'uppercase', color: 'white' },
  kpiValue: { margin: '10px 0 0 0', fontSize: '36px' },
  layoutGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' },
  box: { flex: 1, minWidth: '350px', backgroundColor: '#fdfdfd', border: '1px solid #e3e3e3', padding: '20px', borderRadius: '8px', boxSizing: 'border-box' },
  boxTitle: { margin: '0 0 15px 0', color: '#333' },
  tabela: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' },
  th: { border: '1px solid #ddd', padding: '10px', textAlign: 'left', backgroundColor: '#fd7e14', color: 'white' },
  td: { border: '1px solid #ddd', padding: '10px', textAlign: 'left' },
  btnMostrarTudo: { marginTop: '15px', padding: '10px', width: '100%', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#495057', fontSize: '14px', transition: 'background-color 0.2s' }
};