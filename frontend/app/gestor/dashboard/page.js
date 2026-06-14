"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';

export default function GestorDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [clinica, setClinica] = useState(null);
  const [filtros, setFiltros] = useState({ inicio: '', fim: '' });
  const [kpis, setKpis] = useState({ total_aplicadas: 0, total_atrasadas: 0, total_pendentes: 0, total_animais: 0 });
  const [chartDataEvolucao, setChartDataEvolucao] = useState([]);
  const [chartDataVacinas, setChartDataVacinas] = useState([]);
  const [chartDataVet, setChartDataVet] = useState([]);

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

    const initialInicio = '2023-01-01'; 
    const initialFim = '2026-12-31';
    setFiltros({ inicio: initialInicio, fim: initialFim });

    carregarClinica(user.id_clinica);
    carregarDadosGestor(initialInicio, initialFim, user.id_clinica);
  }, [router]);

  const carregarClinica = async (id_clinica) => {
    if (!id_clinica) return;
    try {
      const resposta = await fetch(`http://localhost:3000/admin/clinicas/${id_clinica}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setClinica(dados);
      }
    } catch (erro) {
      console.error("Erro ao carregar dados da clínica:", erro);
    }
  };

  const carregarDadosGestor = async (inicio, fim, idClinica) => {
    const targetClinica = idClinica || (usuario ? usuario.id_clinica : null);
    if (!targetClinica) return;

    let url = `http://localhost:3000/gestor/dados-dashboard?id_clinica=${targetClinica}&`;
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
    } catch (erro) {
      console.error("Erro ao carregar dashboard:", erro);
    }
  };

  const handleFiltrar = () => {
    carregarDadosGestor(filtros.inicio, filtros.fim, usuario?.id_clinica);
  };

  useEffect(() => {
    const renderCharts = () => {
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
          options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
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
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
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
          options: { responsive: true, indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });
      }
    };

    if (usuario) {
      renderCharts();
    }
  }, [chartDataEvolucao, chartDataVacinas, chartDataVet, usuario]);

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Painel</button>
        
        <h2 style={styles.h2}>Visão Estratégica da Clínica</h2>

       {clinica && (
          <div style={styles.clinicaCard}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>🏥 {clinica.nome_fantasia || 'Clínica Sem Nome'}</h3>
            <p style={{ margin: '5px 0', color: '#333' }}><strong>CNPJ:</strong> {clinica.cnpj || 'Não cadastrado'}</p>
            <p style={{ margin: '5px 0', color: '#333' }}>
              <strong>Endereço:</strong> {clinica.endereco ? `${clinica.endereco}, ` : ''}{clinica.bairro || ''} {clinica.cidade ? `- ${clinica.cidade}` : ''}{clinica.estado ? `/${clinica.estado}` : ''}
            </p>
            <p style={{ margin: '5px 0', color: '#333' }}><strong>Telefone:</strong> {clinica.telefone || 'Não cadastrado'}</p>
          </div>
        )}

        <div style={styles.filtrosBox}>
          <div style={styles.filtroItem}>
            <label style={styles.label}>Data Início:</label>
            <input type="date" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} style={styles.input} />
          </div>
          <div style={styles.filtroItem}>
            <label style={styles.label}>Data Fim:</label>
            <input type="date" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} style={styles.input} />
          </div>
          <button style={styles.btnFiltrar} onClick={handleFiltrar}>Filtrar Período</button>
        </div>
        
        <div style={styles.kpiGrid}>
          <div style={{ ...styles.kpiCard, backgroundColor: '#007bff' }}>
            <h3 style={styles.kpiTitle}>Total de Vacinas Aplicadas</h3>
            <h1 style={styles.kpiValue}>{kpis.total_aplicadas || 0}</h1>
          </div>
          <div style={{ ...styles.kpiCard, backgroundColor: '#ffc107', color: '#333' }}>
            <h3 style={{ ...styles.kpiTitle, color: '#333' }}>Doses Pendentes</h3>
            <h1 style={styles.kpiValue}>{kpis.total_pendentes || 0}</h1>
          </div>
          <div style={{ ...styles.kpiCard, backgroundColor: '#dc3545' }}>
            <h3 style={styles.kpiTitle}>Doses Atrasadas</h3>
            <h1 style={styles.kpiValue}>{kpis.total_atrasadas || 0}</h1>
          </div>
          <div style={{ ...styles.kpiCard, backgroundColor: '#28a745' }}>
            <h3 style={styles.kpiTitle}>Pacientes Atendidos</h3>
            <h1 style={styles.kpiValue}>{kpis.total_animais || 0}</h1>
          </div>
        </div>

        <div style={styles.layoutGrid}>
          <div style={{ ...styles.box, flex: 2 }}>
            <h3 style={styles.boxTitle}>Evolução de Atendimentos</h3>
            <canvas ref={canvasEvolucaoRef}></canvas>
          </div>
          <div style={styles.box}>
            <h3 style={styles.boxTitle}>Vacinas Mais Aplicadas</h3>
            <canvas ref={canvasVacinasRef}></canvas>
          </div>
        </div>

        <div style={styles.layoutGrid}>
          <div style={styles.box}>
            <h3 style={styles.boxTitle}>Desempenho da Equipe: Aplicações por Veterinário</h3>
            <canvas ref={canvasVetRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '1100px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#000000', marginTop: 0 },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' },
  clinicaCard: { backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '25px', borderLeft: '5px solid #0056b3' },
  filtrosBox: { display: 'flex', gap: '15px', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '25px', alignItems: 'flex-end', flexWrap: 'wrap' },
  filtroItem: { flex: 1, minWidth: '150px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '5px' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#333' },
  btnFiltrar: { padding: '9px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', height: '35px' },
  kpiGrid: { display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: '200px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  kpiTitle: { margin: 0, fontSize: '14px', textTransform: 'uppercase', color: 'white' },
  kpiValue: { margin: '10px 0 0 0', fontSize: '36px' },
  layoutGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' },
  box: { flex: 1, minWidth: '350px', backgroundColor: '#fdfdfd', border: '1px solid #e3e3e3', padding: '20px', borderRadius: '8px', boxSizing: 'border-box' },
  boxTitle: { margin: '0 0 15px 0', color: '#333' }
};