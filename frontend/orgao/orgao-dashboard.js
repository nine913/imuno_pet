const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    const perfil = usuario.perfil.toUpperCase();
    if (perfil !== 'GOVERNO' && perfil !== 'ORGAO_GOVERNAMENTAL') {
        window.location.href = '../dashboard.html';
    }
}

async function carregarDadosOrgao() {
    try {
        const resposta = await fetch('http://localhost:3000/orgao/dados-epidemiologicos');
        const dados = await resposta.json();
        
        renderizarGraficoEspecie(dados.coberturaEspecie);
        renderizarTabelaRisco(dados.riscoRegiao);
    } catch (erro) {
        console.error(erro);
    }
}

function renderizarGraficoEspecie(dadosEspecie) {
    const ctx = document.getElementById('chartEspecie').getContext('2d');
    
    const labels = dadosEspecie.map(item => item.especie);
    const valores = dadosEspecie.map(item => item.total_vacinados);

    new Chart(ctx, {
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

function renderizarTabelaRisco(dadosRisco) {
    const corpoTabela = document.getElementById('corpoTabelaRisco');
    corpoTabela.innerHTML = '';

    if (dadosRisco.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nenhum dado registrado nas localidades.</td></tr>';
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

window.addEventListener('DOMContentLoaded', carregarDadosOrgao);