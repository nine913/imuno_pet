const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = '../dashboard.html';
    }
}

const params = new URLSearchParams(window.location.search);
const idAnimalUrl = params.get('id');

if (!idAnimalUrl) {
    window.location.href = 'vet-buscar.html';
}

let listaVacinasCatalogo = [];

async function carregarOpcoesVacinas() {
    try {
        const resposta = await fetch('http://localhost:3000/vacinas');
        listaVacinasCatalogo = await resposta.json();
        
        const selectVazio = document.getElementById('selectVacinaVazio');
        const selectEditar = document.getElementById('selectVacinaEditar');
        
        let htmlOpcoes = '<option value="" data-intervalo="0">Selecione uma vacina...</option>';
        listaVacinasCatalogo.forEach(v => {
            htmlOpcoes += `<option value="${v.id_vacina}" data-intervalo="${v.intervalo_doses_dias || 0}">${v.nome_vacina} (${v.doencas_prevenidas})</option>`;
        });
        
        selectVazio.innerHTML = htmlOpcoes;
        selectEditar.innerHTML = htmlOpcoes;
    } catch (erro) {
        console.error(erro);
    }
}

async function carregarDetalhesPet() {
    try {
        const resposta = await fetch(`http://localhost:3000/detalhes-animal/${idAnimalUrl}`);
        if (resposta.ok) {
            const dados = await resposta.json();
            document.getElementById('tituloPet').textContent = `Histórico de Vacinas: ${dados.nome_animal}`;
        }
    } catch (erro) {
        console.error(erro);
    }
}

async function carregarHistorico(termo = '') {
    const contenedor = document.getElementById('conteudoHistorico');
    const areaVazia = document.getElementById('areaCadastroVazio');
    const barraPesquisa = document.getElementById('barraPesquisaHistorico');
    contenedor.innerHTML = '<p>Carregando histórico...</p>';

    try {
        const resposta = await fetch(`http://localhost:3000/historico-pet/${idAnimalUrl}?termo=${termo}`);
        const historico = await resposta.json();

        contenedor.innerHTML = '';

        if (historico.length === 0 && termo === '') {
            contenedor.innerHTML = '';
            barraPesquisa.style.display = 'none';
            areaVazia.style.display = 'block';
            return;
        }

        barraPesquisa.style.display = 'flex';
        areaVazia.style.display = 'none';

        if (historico.length === 0) {
            contenedor.innerHTML = '<p>Nenhuma vacina encontrada para os termos pesquisados.</p>';
            return;
        }

        historico.forEach(reg => {
            const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            
            const item = document.createElement('div');
            item.className = 'historico-item';
            
            const regString = encodeURIComponent(JSON.stringify(reg));

            item.innerHTML = `
                <div>
                   <strong style="font-size: 18px; color: #0056b3;">${reg.nome_vacina}</strong> - <span style="font-weight: bold; color: ${reg.status === 'APLICADA' ? 'green' : (reg.status === 'ATRASADA' ? 'red' : 'orange')};">${reg.status}</span><br>
                    <span style="font-size: 14px; color: #555;">
                        <strong>Aplicação:</strong> ${dataApp} | <strong>Próxima dose:</strong> ${dataProx}<br>
                        <strong>Previne:</strong> ${reg.doencas_prevenidas}
                    </span>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="abrirModalEditar('${regString}')" style="background-color: #ffc107; color: #333; padding: 10px 15px;">Editar</button>
                    <button onclick="abrirModalConfirmacaoRegistro(${reg.id_registro})" style="background-color: #dc3545; color: white; padding: 10px 15px; width: auto; margin: 0;">Excluir</button>
                </div>
            `;
            contenedor.appendChild(item);
        });
    } catch (erro) {
        contenedor.innerHTML = '<p style="color: red;">Erro ao carregar o histórico.</p>';
    }
}

function calcularProximaDoseGenerico(idSelect, idAplicacao, idProxima) {
    const selectVacina = document.getElementById(idSelect);
    const inputAplicacao = document.getElementById(idAplicacao);
    const inputProximaDose = document.getElementById(idProxima);

    if (!selectVacina.value || !inputAplicacao.value) return;

    const opcaoSelecionada = selectVacina.options[selectVacina.selectedIndex];
    const intervaloDias = parseInt(opcaoSelecionada.getAttribute('data-intervalo'), 10);

    if (intervaloDias > 0) {
        const partesData = inputAplicacao.value.split('-');
        const data = new Date(partesData[0], partesData[1] - 1, partesData[2]);
        
        data.setDate(data.getDate() + intervaloDias);

        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        
        inputProximaDose.value = `${ano}-${mes}-${dia}`;
    } else {
        inputProximaDose.value = '';
    }
}

document.getElementById('selectVacinaVazio').addEventListener('change', () => calcularProximaDoseGenerico('selectVacinaVazio', 'data_aplicacao_vazio', 'data_proxima_dose_vazio'));
document.getElementById('data_aplicacao_vazio').addEventListener('change', () => calcularProximaDoseGenerico('selectVacinaVazio', 'data_aplicacao_vazio', 'data_proxima_dose_vazio'));

document.getElementById('selectVacinaEditar').addEventListener('change', () => calcularProximaDoseGenerico('selectVacinaEditar', 'data_aplicacao_editar', 'data_proxima_dose_editar'));
document.getElementById('data_aplicacao_editar').addEventListener('change', () => calcularProximaDoseGenerico('selectVacinaEditar', 'data_aplicacao_editar', 'data_proxima_dose_editar'));

document.getElementById('btnBuscarHistorico').addEventListener('click', () => {
    const termo = document.getElementById('termoBuscaHistorico').value;
    carregarHistorico(termo);
});

document.getElementById('formVacinaVazio').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_animal = idAnimalUrl;
    const id_vacina = document.getElementById('selectVacinaVazio').value;
    const status = document.getElementById('statusVacinaVazio').value;
    const data_aplicacao = document.getElementById('data_aplicacao_vazio').value;
    const data_proxima_dose = document.getElementById('data_proxima_dose_vazio').value;
    const divMensagem = document.getElementById('mensagemVazio');

    try {
        const resposta = await fetch('http://localhost:3000/registrar-vacina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_animal, id_vacina, status, data_aplicacao, data_proxima_dose })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            document.getElementById('formVacinaVazio').reset();
            setTimeout(() => {
                divMensagem.textContent = '';
                carregarHistorico();
            }, 1500);
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao salvar registro.';
    }
});

function abrirModalEditar(regString) {
    const reg = JSON.parse(decodeURIComponent(regString));
    
    document.getElementById('edit_id_registro').value = reg.id_registro;
    document.getElementById('selectVacinaEditar').value = reg.id_vacina;
    document.getElementById('statusVacinaEditar').value = reg.status;
    
    document.getElementById('data_aplicacao_editar').value = reg.data_aplicacao ? reg.data_aplicacao.split('T')[0] : '';
    document.getElementById('data_proxima_dose_editar').value = reg.data_proxima_dose ? reg.data_proxima_dose.split('T')[0] : '';
    
    document.getElementById('mensagemEditar').textContent = '';
    document.getElementById('modalEditarRegistro').style.display = 'flex';
}

function fecharModalEditar() {
    document.getElementById('modalEditarRegistro').style.display = 'none';
}

document.getElementById('formEditarRegistro').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_registro = document.getElementById('edit_id_registro').value;
    const id_vacina = document.getElementById('selectVacinaEditar').value;
    const status = document.getElementById('statusVacinaEditar').value;
    const data_aplicacao = document.getElementById('data_aplicacao_editar').value;
    const data_proxima_dose = document.getElementById('data_proxima_dose_editar').value;
    const divMensagem = document.getElementById('mensagemEditar');

    try {
        const resposta = await fetch(`http://localhost:3000/editar-registro-vacina/${id_registro}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_vacina, status, data_aplicacao, data_proxima_dose })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            setTimeout(() => {
                fecharModalEditar();
                const termo = document.getElementById('termoBuscaHistorico').value;
                carregarHistorico(termo);
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

let registroParaExcluir = null;

function abrirModalConfirmacaoRegistro(idRegistro) {
    registroParaExcluir = idRegistro;
    document.getElementById('modalConfirmacaoRegistro').style.display = 'flex';
}

function fecharModalConfirmacaoRegistro() {
    registroParaExcluir = null;
    document.getElementById('modalConfirmacaoRegistro').style.display = 'none';
}

document.getElementById('btnConfirmarExclusaoRegistro').addEventListener('click', async () => {
    if (!registroParaExcluir) return;

    try {
        const resposta = await fetch(`http://localhost:3000/deletar-registro-vacina/${registroParaExcluir}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            fecharModalConfirmacaoRegistro();
            carregarHistorico();
        } else {
            alert('Erro ao excluir o registro.');
        }
    } catch (erro) {
        alert('Erro ao conectar com o servidor.');
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    await carregarOpcoesVacinas();
    await carregarDetalhesPet();
    await carregarHistorico();
});