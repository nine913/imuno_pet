const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    const perfil = usuario.perfil.toUpperCase();
    if (perfil !== 'GOVERNO') {
        window.location.href = '../dashboard.html';
    }
}

let instanciaChartEspecie = null;
let instanciaChartEvolucao = null;
let instanciaChartTop = null;

async function carregarDadosOrgao() {
    const inicio = document.getElementById('filtro_inicio').value;
    const fim = document.getElementById('filtro_fim').value;
    const especie = document.getElementById('filtro_especie').value;
    const localidade = document.getElementById('filtro_localidade').value;

    let url = 'http://localhost:3000/governo/dados-epidemiologicos?';
    if (inicio) url += `inicio=${inicio}&`;
    if (fim) url += `fim=${fim}&`;
    if (especie) url += `especie=${especie}&`;
    if (localidade) url += `localidade=${localidade}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        renderizarKPIs(dados.riscoRegiao || []);
        renderizarGraficoEspecie(dados.coberturaEspecie || []);
        renderizarGraficoEvolucao(dados.evolucaoTemporal || []);
        renderizarGraficoTopVacinas(dados.topVacinas || []);
        renderizarTabelaRisco(dados.riscoRegiao || []);
    } catch (erro) {
    }
}

function renderizarKPIs(dadosRisco) {
    let totalAplicadas = 0;
    let totalAtrasadas = 0;
    let totalPendentes = 0;
    let totalLocalidades = dadosRisco.length;

    dadosRisco.forEach(item => {
        totalAplicadas += parseInt(item.total_aplicadas) || 0;
        totalAtrasadas += parseInt(item.total_atrasadas) || 0;
        totalPendentes += parseInt(item.total_pendentes) || 0;
    });

    const elAplicadas = document.getElementById('kpiAplicadas');
    const elAtrasadas = document.getElementById('kpiAtrasadas');
    const elPendentes = document.getElementById('kpiPendentes');
    const elLocalidades = document.getElementById('kpiLocalidades');

    if(elAplicadas) elAplicadas.textContent = totalAplicadas;
    if(elAtrasadas) elAtrasadas.textContent = totalAtrasadas;
    if(elPendentes) elPendentes.textContent = totalPendentes;
    if(elLocalidades) elLocalidades.textContent = totalLocalidades;
}

function renderizarGraficoEspecie(dadosEspecie) {
    const canvas = document.getElementById('chartEspecie');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (instanciaChartEspecie) {
        instanciaChartEspecie.destroy();
    }

    if (!dadosEspecie || dadosEspecie.length === 0) {
        dadosEspecie = [{ especie: 'Sem dados', total_vacinados: 1 }];
    }

    const labels = dadosEspecie.map(item => item.especie);
    const valores = dadosEspecie.map(item => item.total_vacinados);

    instanciaChartEspecie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: ['#fd7e14', '#007bff', '#28a745', '#6f42c1', '#e83e8c'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderizarGraficoEvolucao(dadosEvolucao) {
    const canvas = document.getElementById('chartEvolucao');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (instanciaChartEvolucao) {
        instanciaChartEvolucao.destroy();
    }

    if (!dadosEvolucao || dadosEvolucao.length === 0) {
        instanciaChartEvolucao = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Nenhum registro'],
                datasets: [{ label: 'Doses Aplicadas', data: [0], borderColor: '#ccc' }]
            }
        });
        return;
    }

    const labels = dadosEvolucao.map(item => {
        if (!item.mes) return 'Desconhecido';
        const partes = item.mes.split('-');
        if (partes.length < 2) return item.mes;
        return `${partes[1]}/${partes[0]}`;
    });
    
    const valores = dadosEvolucao.map(item => item.quantidade);

    instanciaChartEvolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doses Aplicadas',
                data: valores,
                borderColor: '#17a2b8',
                backgroundColor: 'rgba(23, 162, 184, 0.1)',
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

function renderizarGraficoTopVacinas(dadosTop) {
    const canvas = document.getElementById('chartTopVacinas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (instanciaChartTop) {
        instanciaChartTop.destroy();
    }

    if (!dadosTop || dadosTop.length === 0) {
        dadosTop = [{ nome_vacina: 'Sem dados', quantidade: 0 }];
    }

    const labels = dadosTop.map(item => item.nome_vacina);
    const valores = dadosTop.map(item => item.quantidade);

    instanciaChartTop = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Aplicações',
                data: valores,
                backgroundColor: '#fd7e14',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

function renderizarTabelaRisco(dadosRisco) {
    const corpoTabela = document.getElementById('corpoTabelaRisco');
    if (!corpoTabela) return;
    
    corpoTabela.innerHTML = '';

    if (!dadosRisco || dadosRisco.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum dado registrado para estes filtros.</td></tr>';
        return;
    }

    dadosRisco.forEach(item => {
        let nivelRisco = 'Baixo';
        let classeRisco = 'risco-baixo';
        
        const aplicadas = parseInt(item.total_aplicadas) || 0;
        const atrasadas = parseInt(item.total_atrasadas) || 0;
        const total = aplicadas + atrasadas;

        if (total > 0) {
            const percentualAtraso = (atrasadas / total) * 100;
            if (percentualAtraso >= 30) {
                nivelRisco = 'Alto';
                classeRisco = 'risco-alto';
            } else if (percentualAtraso >= 10) {
                nivelRisco = 'Médio';
                classeRisco = 'risco-medio';
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.bairro}</td>
            <td>${item.cidade}</td>
            <td>${aplicadas}</td>
            <td>${atrasadas}</td>
            <td class="${classeRisco}">${nivelRisco}</td>
        `;
        corpoTabela.appendChild(tr);
    });
}

const btnFiltrarOrgao = document.getElementById('btnFiltrarOrgao');
if (btnFiltrarOrgao) btnFiltrarOrgao.addEventListener('click', carregarDadosOrgao);

window.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    
    const filtroInicio = document.getElementById('filtro_inicio');
    const filtroFim = document.getElementById('filtro_fim');
    
    if (filtroInicio) filtroInicio.value = trintaDiasAtras.toISOString().split('T')[0];
    if (filtroFim) filtroFim.value = hoje.toISOString().split('T')[0];

    carregarDadosOrgao();
});