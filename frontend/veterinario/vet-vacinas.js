const usuarioString = localStorage.getItem('usuarioImunoPet');

if (!usuarioString) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = 'dashboard.html';
    }
}

const editSelectTipoDose = document.getElementById('edit_tipo_dose');
const editInputIntervalo = document.getElementById('edit_intervalo_dose_dias');

editSelectTipoDose.addEventListener('change', function() {
    if (this.value === 'intervalo') {
        editInputIntervalo.style.display = 'block';
        editInputIntervalo.required = true;
    } else {
        editInputIntervalo.style.display = 'none';
        editInputIntervalo.required = false;
        editInputIntervalo.value = '';
    }
});

editInputIntervalo.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, "");
});

async function realizarBusca(termo = '') {
    const divResultados = document.getElementById('listaVacinas');
    try {
        const resposta = await fetch(`http://localhost:3000/vacinas?termo=${termo}`);
        const vacinas = await resposta.json();
        
        divResultados.innerHTML = '';

        if (vacinas.length === 0) {
            divResultados.innerHTML = '<p>Nenhuma vacina encontrada.</p>';
            return;
        }

        vacinas.forEach(v => {
            const card = document.createElement('div');
            card.className = 'resultado-card';
            
            const vacinaString = encodeURIComponent(JSON.stringify(v));
            const textoIntervalo = v.intervalo_dose_dias > 0 ? `${v.intervalo_dose_dias} dias` : 'Dose Única';

            card.innerHTML = `
                <div style="flex: 1;">
                    <strong>${v.nome_vacina}</strong><br>
                    <span style="font-size: 14px; color: #555;">
                        <strong>Previne:</strong> ${v.doencas_prevenidas}<br>
                        <strong>Fabricante:</strong> ${v.fabricante} | <strong>Intervalo:</strong> ${textoIntervalo}
                    </span>
                </div>
                <div style="display: flex; gap: 10px; flex-direction: column;">
                    <button onclick="abrirModalEditar('${vacinaString}')" style="background-color: #ffc107; color: #333;">Editar Vacina</button>
                    <button onclick="abrirModalExclusao(${v.id_vacina})" style="background-color: #dc3545; color: white;">Excluir</button>
                </div>
            `;
            divResultados.appendChild(card);
        });
    } catch (erro) {
        divResultados.innerHTML = '<p style="color:red;">Erro ao buscar vacinas.</p>';
    }
}

document.getElementById('btnBuscar').addEventListener('click', () => {
    const termo = document.getElementById('termoBusca').value;
    realizarBusca(termo);
});

window.addEventListener('DOMContentLoaded', () => {
    realizarBusca();
});

function abrirModalEditar(vacinaDados) {
    const vacina = JSON.parse(decodeURIComponent(vacinaDados));
    
    document.getElementById('edit_id_vacina').value = vacina.id_vacina;
    document.getElementById('edit_nome_vacina').value = vacina.nome_vacina;
    document.getElementById('edit_doencas_prevenidas').value = vacina.doencas_prevenidas;
    document.getElementById('edit_fabricante').value = vacina.fabricante;

    if (vacina.intervalo_dose_dias > 0) {
        editSelectTipoDose.value = 'intervalo';
        editInputIntervalo.style.display = 'block';
        editInputIntervalo.required = true;
        editInputIntervalo.value = vacina.intervalo_dose_dias;
    } else {
        editSelectTipoDose.value = 'unica';
        editInputIntervalo.style.display = 'none';
        editInputIntervalo.required = false;
        editInputIntervalo.value = '';
    }

    document.getElementById('mensagemEditar').textContent = '';
    document.getElementById('modalEditar').style.display = 'flex';
}

function fecharModalEditar() {
    document.getElementById('modalEditar').style.display = 'none';
}

document.getElementById('formEditarVacina').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_vacina = document.getElementById('edit_id_vacina').value;
    const nome_vacina = document.getElementById('edit_nome_vacina').value;
    const doencas_prevenidas = document.getElementById('edit_doencas_prevenidas').value;
    const fabricante = document.getElementById('edit_fabricante').value;
    const tipo_dose = document.getElementById('edit_tipo_dose').value;
    
    let intervalo_dose_dias = 0;
    if (tipo_dose === 'intervalo') {
        intervalo_dose_dias = document.getElementById('edit_intervalo_dose_dias').value;
    }

    const divMensagem = document.getElementById('mensagemEditar');

    try {
        const resposta = await fetch(`http://localhost:3000/editar-vacina/${id_vacina}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_vacina, doencas_prevenidas, fabricante, intervalo_dose_dias })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            setTimeout(() => {
                fecharModalEditar();
                const termo = document.getElementById('termoBusca').value;
                realizarBusca(termo);
            }, 1500);
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao salvar alterações.';
    }
});

let vacinaParaExcluir = null;

function abrirModalExclusao(idVacina) {
    vacinaParaExcluir = idVacina;
    document.getElementById('modalConfirmacao').style.display = 'flex';
}

function fecharModalExclusao() {
    vacinaParaExcluir = null;
    document.getElementById('modalConfirmacao').style.display = 'none';
}

document.getElementById('btnConfirmarExclusao').addEventListener('click', async () => {
    if (!vacinaParaExcluir) return;

    try {
        const resposta = await fetch(`http://localhost:3000/deletar-vacina/${vacinaParaExcluir}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            fecharModalExclusao();
            const termo = document.getElementById('termoBusca').value;
            realizarBusca(termo);
        } else {
            alert('Erro ao excluir vacina.');
        }
    } catch (erro) {
        alert('Erro ao conectar com o servidor.');
    }
});