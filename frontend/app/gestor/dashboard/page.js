"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';
import LayoutPainel from '../../components/LayoutPainel';

export default function GestorDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [clinica, setClinica] = useState(null);
  const [filtros, setFiltros] = useState({ inicio: '', fim: '' });
  const [kpis, setKpis] = useState({ total_aplicadas: 0, total_atrasadas: 0, total_pendentes: 0, total_animais: 0 });
  const [chartDataEvolucao, setChartDataEvolucao] = useState([]);
  const [chartDataVacinas, setChartDataVacinas] = useState([]);
  const [chartDataVet, setChartDataVet] = useState([]);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const canvasEvolucaoRef = useRef(null);
  const canvasVacinasRef = useRef(null);
  const canvasVetRef = useRef(null);
  
  const chartEvolucaoInstance = useRef(null);
  const chartVacinasInstance = useRef(null);
  const chartVetInstance = useRef(null);

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

    const initialInicio = '2023-01-01'; 
    const initialFim = '2026-12-31';
    setFiltros({ inicio: initialInicio, fim: initialFim });

    carregarClinica(user.id_clinica);
    carregarDadosGestor(initialInicio, initialFim, user.id_clinica, user.id_usuario);
  }, [router]);

  const carregarClinica = async (id_clinica) => {
    if (!id_clinica) return;
    try {
      const resposta = await fetch(`http://localhost:3000/admin/clinicas/${id_clinica}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setClinica(dados);
      }
    } catch (erro) {}
  };

  const carregarDadosGestor = async (inicio, fim, idClinica, idUserOverride) => {
    const targetClinica = idClinica || (usuario ? usuario.id_clinica : null);
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');
    if (!targetClinica) return;

    let url = `http://localhost:3000/gestor/dados-dashboard?id_clinica=${targetClinica}&id_usuario_log=${userId}&`;
    if (inicio) url += `inicio=${inicio}&`;
    if (fim) url += `fim=${fim}`;

    try {
      const resposta = await fetch(url);
      if (resposta.ok) {
        const dados = await resposta.json();
        setKpis(dados.kpis || { total_aplicadas: 0, total_atrasadas: 0, total_pendentes: 0, total_animais: 0 });
        setChartDataEvolucao(dados.atendimentosMes || []);
        setChartDataVacinas(dados.vacinasAplicadas || []);
        setChartDataVet(dados.aplicacoesVet || []);
      }
    } catch (erro) {}
  };

  const handleFiltrar = () => {
    carregarDadosGestor(filtros.inicio, filtros.fim, usuario?.id_clinica, usuario?.id_usuario);
  };

  useEffect(() => {
    const renderCharts = () => {
      const chartTextColor = tema === 'escuro' ? '#cccccc' : '#666666';

      if (chartEvolucaoInstance.current) chartEvolucaoInstance.current.destroy();
      if (canvasEvolucaoRef.current) {
        const ctx = canvasEvolucaoRef.current.getContext('2d');
        const labels = chartDataEvolucao.length > 0 ? chartDataEvolucao.map(item => {
          if (!item.mes) return '';
          const partes = item.mes.split('-');
          return partes.length > 1 ? `${partes[1]}/${partes[0]}` : item.mes;
        }) : ['Sem dados'];
        const valores = chartDataEvolucao.length > 0 ? chartDataEvolucao.map(item => item.quantidade) : [0];

        chartEvolucaoInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Atendimentos Realizados',
              data: valores,
              borderColor: chartDataEvolucao.length > 0 ? '#28a745' : '#ccc',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
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

      if (chartVacinasInstance.current) chartVacinasInstance.current.destroy();
      if (canvasVacinasRef.current) {
        const ctx = canvasVacinasRef.current.getContext('2d');
        const labels = chartDataVacinas.length > 0 ? chartDataVacinas.map(item => item.nome_vacina) : ['Sem dados'];
        const valores = chartDataVacinas.length > 0 ? chartDataVacinas.map(item => item.quantidade) : [1];
        const colors = chartDataVacinas.length > 0 ? ['#007bff', '#dc3545', '#ffc107', '#28a745', '#6f42c1'] : ['#ccc'];

        chartVacinasInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{ data: valores, backgroundColor: colors, borderWidth: 1 }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: chartTextColor } } } }
        });
      }

      if (chartVetInstance.current) chartVetInstance.current.destroy();
      if (canvasVetRef.current) {
        const ctx = canvasVetRef.current.getContext('2d');
        const labels = chartDataVet.length > 0 ? chartDataVet.map(item => item.nome_completo) : ['Sem dados'];
        const valores = chartDataVet.length > 0 ? chartDataVet.map(item => item.quantidade) : [0];

        chartVetInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Total de Aplicações',
              data: valores,
              backgroundColor: chartDataVet.length > 0 ? '#17a2b8' : '#ccc',
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
  }, [chartDataEvolucao, chartDataVacinas, chartDataVet, usuario, tema]);

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', color: textColor }}>
        <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Visão Estratégica da Clínica</h2>

       {clinica && (
          <div style={{ backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: `5px solid ${headerColor}` }}>
            <h3 style={{ margin: '0 0 10px 0', color: headerColor }}>🏥 {clinica.nome_fantasia || 'Clínica Sem Nome'}</h3>
            <p style={{ margin: '5px 0', color: textSecundario }}><strong>CNPJ:</strong> {clinica.cnpj || 'Não cadastrado'}</p>
            <p style={{ margin: '5px 0', color: textSecundario }}>
              <strong>Endereço:</strong> {clinica.endereco ? `${clinica.endereco}, ` : ''}{clinica.bairro || ''} {clinica.cidade ? `- ${clinica.cidade}` : ''}{clinica.estado ? `/${clinica.estado}` : ''}
            </p>
            <p style={{ margin: '5px 0', color: textSecundario }}><strong>Telefone:</strong> {clinica.telefone || 'Não cadastrado'}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '15px', backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '25px', alignItems: 'flex-end', flexWrap: 'wrap', border: `1px solid ${borderColor}` }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Data Início:</label>
            <input type="date" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Data Fim:</label>
            <input type="date" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} style={{ width: '100%', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
          </div>
          <button style={{ padding: '9px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: 'auto', fontSize: 'inherit' }} onClick={handleFiltrar}>Filtrar Período</button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#007bff' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: 'white' }}>Total de Vacinas Aplicadas</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.total_aplicadas || 0}</h1>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#ffc107', color: '#333' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: '#333' }}>Doses Pendentes</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.total_pendentes || 0}</h1>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#dc3545' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: 'white' }}>Doses Atrasadas</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.total_atrasadas || 0}</h1>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#28a745' }}>
            <h3 style={{ margin: 0, textTransform: 'uppercase', color: 'white' }}>Pacientes Atendidos</h3>
            <h1 style={{ margin: '10px 0 0 0', fontSize: '2em' }}>{kpis.total_animais || 0}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: 2, minWidth: '350px', backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', color: textSecundario }}>Evolução de Atendimentos</h3>
            <canvas ref={canvasEvolucaoRef}></canvas>
          </div>
          <div style={{ flex: 1, minWidth: '350px', backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', color: textSecundario }}>Vacinas Mais Aplicadas</h3>
            <canvas ref={canvasVacinasRef}></canvas>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: 1, minWidth: '350px', backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 15px 0', color: textSecundario }}>Desempenho da Equipe: Aplicações por Veterinário</h3>
            <canvas ref={canvasVetRef}></canvas>
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}