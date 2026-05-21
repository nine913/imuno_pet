const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = '../dashboard.html';
    }
}

async function gerarRelatorio() {
    const dataInicio = document.getElementById('data_inicio').value;
    const dataFim = document.getElementById('data_fim').value;
    const status = document.getElementById('filtro_status').value;
    const especie = document.getElementById('filtro_especie').value;
    
    let url = 'http://localhost:3000/relatorio-vacinas?';
    if (dataInicio) url += `inicio=${dataInicio}&`;
    if (dataFim) url += `fim=${dataFim}&`;
    if (status) url += `status=${status}&`;
    if (especie) url += `especie=${especie}`;

    const corpoTabela = document.getElementById('corpoTabela');
    const displayTotal = document.getElementById('totalGeral');

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        corpoTabela.innerHTML = '';

        if (dados.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum registro encontrado com esses filtros.</td></tr>';
            displayTotal.textContent = '0';
            return;
        }

        displayTotal.textContent = dados.length;

        dados.forEach(item => {
            const dataApp = item.data_aplicacao ? new Date(item.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
            const dataProx = item.data_proxima_dose ? new Date(item.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
            
            const corStatus = item.status === 'APLICADA' ? 'green' : 'orange';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataApp}</td>
                <td>${dataProx}</td>
                <td><strong>${item.nome_vacina}</strong></td>
                <td>${item.nome_animal}</td>
                <td>${item.especie}</td>
                <td>${item.nome_tutor}</td>
                <td>${item.telefone}</td>
                <td style="color: ${corStatus}; font-weight: bold;">${item.status}</td>
            `;
            corpoTabela.appendChild(tr);
        });

    } catch (erro) {
        corpoTabela.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Erro ao gerar o relatório.</td></tr>';
    }
}

document.getElementById('btnGerarRelatorio').addEventListener('click', gerarRelatorio);

window.addEventListener('DOMContentLoaded', gerarRelatorio);

function baixarPDF() {
    const elemento = document.getElementById('area-relatorio');
    
    const opcoes = {
        margin:       10,
        filename:     'relatorio_imunopet.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opcoes).from(elemento).save();
}