const usuarioString = localStorage.getItem('usuarioImunoPet');

if (!usuarioString) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = 'dashboard.html';
    }
}

const selectTipoDose = document.getElementById('tipo_dose');
const inputIntervalo = document.getElementById('intervalo_doses_dias');

selectTipoDose.addEventListener('change', function() {
    if (this.value === 'intervalo') {
        inputIntervalo.style.display = 'block';
        inputIntervalo.required = true;
    } else {
        inputIntervalo.style.display = 'none';
        inputIntervalo.required = false;
        inputIntervalo.value = '';
    }
});

inputIntervalo.addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, "");
});

async function carregarListaVacinas() {
    const divResultados = document.getElementById('listaVacinas');
    try {
        const resposta = await fetch('http://localhost:3000/vacinas');
        const vacinas = await resposta.json();
        
        divResultados.innerHTML = '';

        if (vacinas.length === 0) {
            divResultados.innerHTML = '<p>Nenhuma vacina cadastrada.</p>';
            return;
        }

        vacinas.forEach(v => {
            const card = document.createElement('div');
            card.className = 'resultado-card';
            
            const vacinaString = encodeURIComponent(JSON.stringify(v));
            const textoIntervalo = v.intervalo_doses_dias > 0 ? `${v.intervalo_doses_dias} dias` : 'Dose Única';

            card.innerHTML = `
                <div style="flex: 1;">
                    <strong>${v.nome_vacina}</strong><br>
                    <span style="font-size: 14px; color: #555;">
                        <strong>Previne:</strong> ${v.doencas_prevenidas}<br>
                        <strong>Fabricante:</strong> ${v.fabricante} | <strong>Intervalo:</strong> ${textoIntervalo}
                    </span>
                </div>
                <div style="display: flex; gap: 10px; flex-direction: column;">
                    <button onclick="editarVacina('${vacinaString}')" style="background-color: #ffc107; color: #333;">Editar</button>
                    <button onclick="abrirModalExclusao(${v.id_vacina})" style="background-color: #dc3545; color: white;">Excluir</button>
                </div>
            `;
            divResultados.appendChild(card);
        });
    } catch (erro) {
        divResultados.innerHTML = '<p style="color:red;">Erro ao carregar a lista.</p>';
    }
}

window.addEventListener('DOMContentLoaded', carregarListaVacinas);

function editarVacina(vacinaDados) {
    const vacina = JSON.parse(decodeURIComponent(vacinaDados));
    
    document.getElementById('id_vacina').value = vacina.id_vacina;
    document.getElementById('nome_vacina').value = vacina.nome_vacina;
    document.getElementById('doencas_prevenidas').value = vacina.doencas_prevenidas;
    document.getElementById('fabricante').value = vacina.fabricante;

    if (vacina.intervalo_doses_dias > 0) {
        selectTipoDose.value = 'intervalo';
        inputIntervalo.style.display = 'block';
        inputIntervalo.required = true;
        inputIntervalo.value = vacina.intervalo_doses_dias;
    } else {
        selectTipoDose.value = 'unica';
        inputIntervalo.style.display = 'none';
        inputIntervalo.required = false;
        inputIntervalo.value = '';
    }

    document.getElementById('tituloFormulario').textContent = 'Editar Vacina';
    document.getElementById('btnSalvar').textContent = 'Atualizar Vacina';
    document.getElementById('btnCancelarEdicao').style.display = 'inline-block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    document.getElementById('formVacina').reset();
    document.getElementById('id_vacina').value = '';
    document.getElementById('tituloFormulario').textContent = 'Cadastrar Nova Vacina';
    document.getElementById('btnSalvar').textContent = 'Salvar Vacina';
    document.getElementById('btnCancelarEdicao').style.display = 'none';
    
    inputIntervalo.style.display = 'none';
    inputIntervalo.required = false;
}

document.getElementById('formVacina').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_vacina = document.getElementById('id_vacina').value;
    const nome_vacina = document.getElementById('nome_vacina').value;
    const doencas_prevenidas = document.getElementById('doencas_prevenidas').value;
    const fabricante = document.getElementById('fabricante').value;
    const tipo_dose = document.getElementById('tipo_dose').value;
    
    let intervalo_doses_dias = 0;
    if (tipo_dose === 'intervalo') {
        intervalo_doses_dias = document.getElementById('intervalo_doses_dias').value;
    }

    const divMensagem = document.getElementById('mensagemFormulario');
    
    const url = id_vacina ? `http://localhost:3000/editar-vacina/${id_vacina}` : 'http://localhost:3000/cadastrar-vacina';
    const metodo = id_vacina ? 'PUT' : 'POST';

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            cancelarEdicao();
            carregarListaVacinas();
            
            setTimeout(() => {
                divMensagem.textContent = '';
            }, 3000);
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao conectar com o servidor.';
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
            carregarListaVacinas();
            
            if (document.getElementById('id_vacina').value == vacinaParaExcluir) {
                cancelarEdicao();
            }
        } else {
            alert('Erro ao excluir vacina.');
        }
    } catch (erro) {
        alert('Erro ao conectar com o servidor.');
    }
});