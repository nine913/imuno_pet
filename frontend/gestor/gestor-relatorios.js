const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil.toUpperCase() !== 'GESTOR' && usuario.perfil.toUpperCase() !== 'GESTOR_CLINICA') {
        window.location.href = '../dashboard.html';
    }
}

async function carregarFiltros() {
    try {
        const resVac = await fetch('http://localhost:3000/vacinas');
        const vacinas = await resVac.json();
        const selectVac = document.getElementById('filtro_vacina');
        vacinas.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id_vacina;
            opt.textContent = v.nome_vacina;
            selectVac.appendChild(opt);
        });

        const resVet = await fetch('http://localhost:3000/veterinarios');
        const vets = await resVet.json();
        const selectVet = document.getElementById('filtro_veterinario');
        vets.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id_veterinario;
            opt.textContent = v.nome_completo;
            selectVet.appendChild(opt);
        });
    } catch (erro) {}
}

async function gerarRelatorio() {
    const inicio = document.getElementById('filtro_inicio').value;
    const fim = document.getElementById('filtro_fim').value;
    const vacina = document.getElementById('filtro_vacina').value;
    const especie = document.getElementById('filtro_especie').value;
    const bairro = document.getElementById('filtro_bairro').value;
    const status = document.getElementById('filtro_status').value;
    const aplicante = document.getElementById('filtro_veterinario').value;
    
    let url = 'http://localhost:3000/gestor/relatorios-avancados?';
    if (inicio) url += `inicio=${inicio}&`;
    if (fim) url += `fim=${fim}&`;
    if (vacina) url += `vacina=${vacina}&`;
    if (especie) url += `especie=${especie}&`;
    if (bairro) url += `bairro=${bairro}&`;
    if (status) url += `status=${status}&`;
    if (aplicante) url += `aplicante=${aplicante}`;

    const corpoTabela = document.getElementById('corpoTabela');
    const displayTotal = document.getElementById('totalResultados');

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        corpoTabela.innerHTML = '';
        displayTotal.textContent = `${dados.length} Registros Encontrados`;

        if (dados.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum registro encontrado.</td></tr>';
            return;
        }

        dados.forEach(item => {
            const dataBase = item.status === 'APLICADA' ? item.data_aplicacao : item.data_proxima_dose;
            const dataExibicao = dataBase ? new Date(dataBase).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
            const corStatus = item.status === 'APLICADA' ? 'green' : (item.status === 'ATRASADA' ? 'red' : 'orange');
            const infoVet = item.nome_vet ? `${item.nome_vet}<br><span style="font-size: 12px; color: #555;">${item.crmv_vet}</span>` : '-';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dataExibicao}</td>
                <td style="color: ${corStatus}; font-weight: bold;">${item.status}</td>
                <td><strong>${item.nome_vacina}</strong></td>
                <td>${item.nome_animal}<br><span style="font-size: 12px; color: #555;">${item.raca}</span></td>
                <td>${item.especie}</td>
                <td>${item.nome_tutor}</td>
                <td>${item.telefone}</td>
                <td>${infoVet}</td>
            `;
            corpoTabela.appendChild(tr);
        });
    } catch (erro) {
        corpoTabela.innerHTML = '<tr><td colspan="8" style="text-align: center; color: red;">Erro ao gerar relatório.</td></tr>';
    }
}

function baixarPDF() {
    const elemento = document.getElementById('area-relatorio');
    const opcoes = {
        margin:       10,
        filename:     'relatorio_estrategico_gestor.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opcoes).from(elemento).save();
}

document.getElementById('btnFiltrar').addEventListener('click', gerarRelatorio);

window.addEventListener('DOMContentLoaded', async () => {
    await carregarFiltros();
    gerarRelatorio();
});