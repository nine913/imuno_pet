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
      const chartTextColor = tema === 'escuro' ? '#94a3b8' : '#64748b';
      const gridColor = tema === 'escuro' ? '#334155' : '#e2e8f0';

      if (chartEvolucaoInstance.current) chartEvolucaoInstance.current.destroy();
      if (canvasEvolucaoRef.current) {
        const ctx = canvasEvolucaoRef.current.getContext('2d');
        const labels = chartDataEvolucao.length > 0 ? chartDataEvolucao.map(item => {
          if (!item.mes) return '';
          const partes = item.mes.split('-');
          return partes.length > 1 ? `${partes[1]}/${partes[0]}` : item.mes;
        }) : ['Sem dados'];
        const valores = chartDataEvolucao.length > 0 ? chartDataEvolucao.map(item => item.quantidade) : [0];

        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        chartEvolucaoInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Atendimentos',
              data: valores,
              borderColor: chartDataEvolucao.length > 0 ? '#10b981' : '#cbd5e1',
              backgroundColor: gradient,
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#10b981',
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

      if (chartVacinasInstance.current) chartVacinasInstance.current.destroy();
      if (canvasVacinasRef.current) {
        const ctx = canvasVacinasRef.current.getContext('2d');
        const labels = chartDataVacinas.length > 0 ? chartDataVacinas.map(item => item.nome_vacina) : ['Sem dados'];
        const valores = chartDataVacinas.length > 0 ? chartDataVacinas.map(item => item.quantidade) : [1];
        const colors = chartDataVacinas.length > 0 ? ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'] : ['#cbd5e1'];

        chartVacinasInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{ data: valores, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
          },
          options: { responsive: true, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: chartTextColor, font: { family: "'Inter', sans-serif", size: 13 } } } } }
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
              label: 'Aplicações',
              data: valores,
              backgroundColor: chartDataVet.length > 0 ? '#0ea5e9' : '#cbd5e1',
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
  }, [chartDataEvolucao, chartDataVacinas, chartDataVet, usuario, tema]);

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

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: headerColor, margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Visão Estratégica</h2>
          <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Acompanhe o desempenho e os atendimentos da sua clínica.</p>
        </div>

        {clinica && (
          <div style={{ backgroundColor: isEscuro ? '#1e3a8a' : '#eff6ff', padding: '24px', borderRadius: '16px', marginBottom: '32px', borderLeft: `6px solid ${isEscuro ? '#3b82f6' : '#2563eb'}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: isEscuro ? '#1e293b' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', filter: sombraEmoji, flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              🏥
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px 0', color: isEscuro ? '#bfdbfe' : '#1e40af', fontSize: '20px', fontWeight: '700' }}>{clinica.nome_fantasia || 'Clínica Sem Nome'}</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: isEscuro ? '#93c5fd' : '#1e3a8a' }}><strong>CNPJ:</strong> {clinica.cnpj || 'Não cadastrado'}</span>
                <span style={{ fontSize: '14px', color: isEscuro ? '#93c5fd' : '#1e3a8a' }}><strong>Telefone:</strong> {clinica.telefone || 'Não cadastrado'}</span>
                <span style={{ fontSize: '14px', color: isEscuro ? '#93c5fd' : '#1e3a8a', display: 'block', width: '100%' }}>
                  <strong>Endereço:</strong> {clinica.endereco ? `${clinica.endereco}, ` : ''}{clinica.bairro || ''} {clinica.cidade ? `- ${clinica.cidade}` : ''}{clinica.estado ? `/${clinica.estado}` : ''}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', backgroundColor: bgCard, padding: '24px', borderRadius: '16px', marginBottom: '32px', alignItems: 'flex-end', flexWrap: 'wrap', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: textSecundario, marginBottom: '6px', fontSize: '13px' }}>Data Início:</label>
            <input type="date" className="premium-input" value={filtros.inicio} onChange={e => setFiltros({...filtros, inicio: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: textSecundario, marginBottom: '6px', fontSize: '13px' }}>Data Fim:</label>
            <input type="date" className="premium-input" value={filtros.fim} onChange={e => setFiltros({...filtros, fim: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
          </div>
          <button className="premium-btn" style={{ padding: '0 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', height: '45px', fontSize: '14px' }} onClick={handleFiltrar}>Filtrar Período</button>
        </div>
        
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#1d4ed8' : '#3b82f6', border: `1px solid ${isEscuro ? '#1e3a8a' : '#60a5fa'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Total Aplicadas</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{kpis.total_aplicadas || 0}</h1>
          </div>
          <div style={{ padding: '24px', borderRadius: '16px', color: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#b45309' : '#f59e0b', border: `1px solid ${isEscuro ? '#78350f' : '#fcd34d'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9, color: isEscuro ? '#fffbeb' : '#451a03' }}>Doses Pendentes</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: isEscuro ? '#fff' : '#0f172a' }}>{kpis.total_pendentes || 0}</h1>
          </div>
          <div style={{ padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#b91c1c' : '#ef4444', border: `1px solid ${isEscuro ? '#7f1d1d' : '#fca5a5'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Doses Atrasadas</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{kpis.total_atrasadas || 0}</h1>
          </div>
          <div style={{ padding: '24px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: isEscuro ? '#047857' : '#10b981', border: `1px solid ${isEscuro ? '#064e3b' : '#34d399'}` }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', opacity: 0.9 }}>Pacientes Atendidos</h3>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>{kpis.total_animais || 0}</h1>
          </div>
        </div>

        {/* Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Evolução de Atendimentos</h3>
            <canvas ref={canvasEvolucaoRef}></canvas>
          </div>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Vacinas Mais Aplicadas</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '300px' }}>
              <canvas ref={canvasVacinasRef}></canvas>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
            <h3 style={{ margin: '0 0 20px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>Desempenho da Equipe: Aplicações por Veterinário</h3>
            <canvas ref={canvasVetRef}></canvas>
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}