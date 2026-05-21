const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil.toUpperCase() !== 'GESTOR' && usuario.perfil.toUpperCase() !== 'GESTOR_CLINICA') {
        window.location.href = '../dashboard.html';
    }
}

let instanciaChartTop = null;
let instanciaChartEvolucao = null;

async function carregarDashboard() {
    const inicio = document.getElementById('dash_inicio').value;
    const fim = document.getElementById('dash_fim').value;
    
    let url = 'http://localhost:3000/gestor/metricas-detalhadas?';
    if (inicio) url += `inicio=${inicio}&`;
    if (fim) url += `fim=${fim}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        document.getElementById('metricaAnimais').textContent = dados.total_animais;
        document.getElementById('metricaAplicadas').textContent = dados.total_aplicadas;
        document.getElementById('metricaAtrasadas').textContent = dados.total_atrasadas;

        renderizarGraficoTop(dados.topVacinas);
        renderizarGraficoEvolucao(dados.evolucaoMensal);
    } catch (erro) {
        console.error(erro);
    }
}

function renderizarGraficoTop(dadosVacinas) {
    const ctx = document.getElementById('chartTopVacinas').getContext('2d');
    
    if (instanciaChartTop) {
        instanciaChartTop.destroy();
    }

    const labels = dadosVacinas.map(item => item.nome_vacina);
    const valores = dadosVacinas.map(item => item.quantidade);

    instanciaChartTop = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doses Aplicadas',
                data: valores,
                backgroundColor: '#36968b',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderizarGraficoEvolucao(dadosEvolucao) {
    const ctx = document.getElementById('chartEvolucaoMensal').getContext('2d');
    
    if (instanciaChartEvolucao) {
        instanciaChartEvolucao.destroy();
    }

    const labels = dadosEvolucao.map(item => {
        const partes = item.mes.split('-');
        return `${partes[1]}/${partes[0]}`;
    });
    const valores = dadosEvolucao.map(item => item.quantidade);

    instanciaChartEvolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Volume de Atendimentos',
                data: valores,
                borderColor: '#20c997',
                backgroundColor: 'rgba(32, 201, 151, 0.1)',
                fill: true,
                tension: 0.2,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

document.getElementById('btnFiltrarDashboard').addEventListener('click', carregarDashboard);

window.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    document.getElementById('dash_inicio').value = trintaDiasAtras.toISOString().split('T')[0];
    document.getElementById('dash_fim').value = hoje.toISOString().split('T')[0];
    
    carregarDashboard();
});