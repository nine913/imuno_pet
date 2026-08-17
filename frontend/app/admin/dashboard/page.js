"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';
import LayoutPainel from '../../components/LayoutPainel';

export default function AdminDashboard() {
  const [usuario, setUsuario] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [chartDataPerfil, setChartDataPerfil] = useState([]);
  const [chartDataStatus, setChartDataStatus] = useState([]);
  const [chartDataEvolucao, setChartDataEvolucao] = useState([]);
  const [chartDataRanking, setChartDataRanking] = useState([]);

  const canvasPerfilRef = useRef(null);
  const canvasStatusRef = useRef(null);
  const canvasEvolucaoRef = useRef(null);
  const canvasRankingRef = useRef(null);

  const chartPerfilInstance = useRef(null);
  const chartStatusInstance = useRef(null);
  const chartEvolucaoInstance = useRef(null);
  const chartRankingInstance = useRef(null);

  const router = useRouter();

  const carregarEstatisticas = async () => {
    try {
      const resposta = await apiFetch('/admin/estatisticas');
      if (resposta.ok) {
        const dados = await resposta.json();
        setEstatisticas(dados);
        setChartDataPerfil(dados.usuariosPorPerfil || []);
        setChartDataStatus(dados.statusVacinacao || []);
        setChartDataEvolucao(dados.evolucaoMensal || []);
        setChartDataRanking(dados.rankingClinicas || []);
      }
    } catch (erro) {}
  };

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil.toUpperCase() !== 'ADMINISTRADOR') {
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

    carregarEstatisticas();
  }, [router]);

  useEffect(() => {
    const renderCharts = () => {
      const chartTextColor = tema === 'escuro' ? '#94a3b8' : '#64748b';
      const gridColor = tema === 'escuro' ? '#334155' : '#e2e8f0';

      if (chartPerfilInstance.current) chartPerfilInstance.current.destroy();
      if (canvasPerfilRef.current) {
        const ctx = canvasPerfilRef.current.getContext('2d');
        const labels = chartDataPerfil.length > 0 ? chartDataPerfil.map(item => item.perfil.replace('_', ' ')) : ['Sem dados'];
        const valores = chartDataPerfil.length > 0 ? chartDataPerfil.map(item => item.quantidade) : [1];
        const colors = chartDataPerfil.length > 0 ? ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'] : ['#cbd5e1'];

        chartPerfilInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data: valores, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
          options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: chartTextColor, font: { family: "'Inter', sans-serif", size: 13 } } } } }
        });
      }

      if (chartStatusInstance.current) chartStatusInstance.current.destroy();
      if (canvasStatusRef.current) {
        const ctx = canvasStatusRef.current.getContext('2d');
        const coresPorStatus = { APLICADA: '#10b981', PENDENTE: '#f59e0b', ATRASADA: '#ef4444', CANCELADA: '#94a3b8' };
        const labels = chartDataStatus.length > 0 ? chartDataStatus.map(item => item.status) : ['Sem dados'];
        const valores = chartDataStatus.length > 0 ? chartDataStatus.map(item => item.quantidade) : [1];
        const colors = chartDataStatus.length > 0 ? chartDataStatus.map(item => coresPorStatus[item.status] || '#94a3b8') : ['#cbd5e1'];

        chartStatusInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: { labels, datasets: [{ data: valores, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }] },
          options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: chartTextColor, font: { family: "'Inter', sans-serif", size: 13 } } } } }
        });
      }

      if (chartEvolucaoInstance.current) chartEvolucaoInstance.current.destroy();
      if (canvasEvolucaoRef.current) {
        const ctx = canvasEvolucaoRef.current.getContext('2d');
        const labels = chartDataEvolucao.length > 0 ? chartDataEvolucao.map(item => {
          if (!item.mes) return '';
          const partes = item.mes.split('-');
          return partes.length > 1 ? `${partes[1]}/${partes[0]}` : item.mes;
        }) : ['Sem dados'];
        const valores = chartDataEvolucao.length > 0 ? chartDataEvolucao.map(item => item.quantidade) : [0];

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

        chartEvolucaoInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Doses Aplicadas',
              data: valores,
              borderColor: chartDataEvolucao.length > 0 ? '#2563eb' : '#cbd5e1',
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#2563eb',
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
              y: { grid: { color: gridColor }, beginAtZero: true, ticks: { color: chartTextColor, font: { family: "'Inter', sans-serif" } } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }

      if (chartRankingInstance.current) chartRankingInstance.current.destroy();
      if (canvasRankingRef.current) {
        const ctx = canvasRankingRef.current.getContext('2d');
        const labels = chartDataRanking.length > 0 ? chartDataRanking.map(item => item.nome_fantasia) : ['Sem dados'];
        const valores = chartDataRanking.length > 0 ? chartDataRanking.map(item => item.quantidade) : [0];

        chartRankingInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Doses Aplicadas',
              data: valores,
              backgroundColor: chartDataRanking.length > 0 ? '#8b5cf6' : '#cbd5e1',
              borderWidth: 0,
              borderRadius: 6,
              barPercentage: 0.6
            }]
          },
          options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
              x: { grid: { color: gridColor }, beginAtZero: true, ticks: { color: chartTextColor, font: { family: "'Inter', sans-serif" } } },
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
  }, [chartDataPerfil, chartDataStatus, chartDataEvolucao, chartDataRanking, usuario, tema]);

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: headerColor, margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Estatísticas do Sistema</h2>
          <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Visão geral de todas as clínicas, usuários e vacinações do ImunoPet.</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '20px', borderRadius: '16px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#1d4ed8' : '#3b82f6' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Clínicas</h3>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800' }}>{estatisticas?.total_clinicas ?? 0}</h1>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>{estatisticas?.total_clinicas_ativas ?? 0} ativas</span>
          </div>
          <div style={{ padding: '20px', borderRadius: '16px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#047857' : '#10b981' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Usuários</h3>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800' }}>{estatisticas?.total_usuarios ?? 0}</h1>
          </div>
          <div style={{ padding: '20px', borderRadius: '16px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#b45309' : '#f59e0b' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9, color: isEscuro ? '#fffbeb' : '#451a03' }}>Tutores</h3>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: isEscuro ? '#fff' : '#0f172a' }}>{estatisticas?.total_tutores ?? 0}</h1>
          </div>
          <div style={{ padding: '20px', borderRadius: '16px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#7e22ce' : '#8b5cf6' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Animais</h3>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800' }}>{estatisticas?.total_animais ?? 0}</h1>
          </div>
          <div style={{ padding: '20px', borderRadius: '16px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#be185d' : '#ec4899' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Vacinas no Catálogo</h3>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800' }}>{estatisticas?.total_vacinas ?? 0}</h1>
          </div>
          <div style={{ padding: '20px', borderRadius: '16px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#0e7490' : '#06b6d4' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Registros de Vacinação</h3>
            <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800' }}>{estatisticas?.total_registros_vacinacao ?? 0}</h1>
          </div>
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Evolução de Doses Aplicadas (Sistema)</h3>
            <canvas ref={canvasEvolucaoRef}></canvas>
          </div>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Usuários por Perfil</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '300px' }}>
              <canvas ref={canvasPerfilRef}></canvas>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Ranking de Clínicas por Volume de Atendimentos</h3>
            <canvas ref={canvasRankingRef}></canvas>
          </div>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Status das Vacinações</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '300px' }}>
              <canvas ref={canvasStatusRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}
