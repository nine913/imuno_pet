const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil.toUpperCase() !== 'GESTOR' && usuario.perfil.toUpperCase() !== 'GESTOR_CLINICA') {
        window.location.href = '../dashboard.html';
    }
}

let chartEvolucaoGestor = null;
let chartTopVacinasGestor = null;

async function carregarDadosGestor() {
    const inicio = document.getElementById('filtro_inicio').value;
    const fim = document.getElementById('filtro_fim').value;

    let url = 'http://localhost:3000/gestor/dados-dashboard?';
    if (inicio) url += `inicio=${inicio}&`;
    if (fim) url += `fim=${fim}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        renderizarKPIsGestor(dados.kpis || {});
        renderizarEvolucaoGestor(dados.atendimentosMes || []);
        renderizarTopVacinasGestor(dados.vacinasAplicadas || []);
    } catch (erro) {
    }
}

function renderizarKPIsGestor(kpis) {
    const elAplicadas = document.getElementById('kpiAplicadas');
    const elAtrasadas = document.getElementById('kpiAtrasadas');
    const elPendentes = document.getElementById('kpiPendentes');
    const elAnimais = document.getElementById('kpiAnimais');

    if(elAplicadas) elAplicadas.textContent = kpis.total_aplicadas || 0;
    if(elAtrasadas) elAtrasadas.textContent = kpis.total_atrasadas || 0;
    if(elPendentes) elPendentes.textContent = kpis.total_pendentes || 0;
    if(elAnimais) elAnimais.textContent = kpis.total_animais || 0;
}

function renderizarEvolucaoGestor(dados) {
    const canvas = document.getElementById('chartEvolucaoGestor');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (chartEvolucaoGestor) {
        chartEvolucaoGestor.destroy();
    }

    if (!dados || dados.length === 0) {
        chartEvolucaoGestor = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sem dados'],
                datasets: [{ label: 'Atendimentos', data: [0], borderColor: '#ccc' }]
            }
        });
        return;
    }

    const labels = dados.map(item => {
        if (!item.mes) return '';
        const partes = item.mes.split('-');
        return partes.length > 1 ? `${partes[1]}/${partes[0]}` : item.mes;
    });
    const valores = dados.map(item => item.quantidade);

    chartEvolucaoGestor = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Atendimentos Realizados',
                data: valores,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                fill: true,
                tension: 0.2,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function renderizarTopVacinasGestor(dados) {
    const canvas = document.getElementById('chartTopVacinasGestor');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (chartTopVacinasGestor) {
        chartTopVacinasGestor.destroy();
    }

    if (!dados || dados.length === 0) {
        chartTopVacinasGestor = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Sem dados'],
                datasets: [{ data: [1], backgroundColor: ['#ccc'] }]
            }
        });
        return;
    }

    const labels = dados.map(item => item.nome_vacina);
    const valores = dados.map(item => item.quantidade);

    chartTopVacinasGestor = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: ['#007bff', '#dc3545', '#ffc107', '#28a745', '#6f42c1'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

const btnFiltrarGestor = document.getElementById('btnFiltrarGestor');
if (btnFiltrarGestor) btnFiltrarGestor.addEventListener('click', carregarDadosGestor);

window.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    const filtroInicio = document.getElementById('filtro_inicio');
    const filtroFim = document.getElementById('filtro_fim');
    
    if (filtroInicio) filtroInicio.value = trintaDiasAtras.toISOString().split('T')[0];
    if (filtroFim) filtroFim.value = hoje.toISOString().split('T')[0];

    carregarDadosGestor();
});