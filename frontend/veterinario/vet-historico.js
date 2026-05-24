const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = '../dashboard.html';
    }
}

const urlParams = new URLSearchParams(window.location.search);
const idAnimalAtual = urlParams.get('id');

let todasAsVacinas = [];
let idRegistroParaExcluir = null;

const modalEditar = document.getElementById('modalEditarRegistro');
const modalConfirmacao = document.getElementById('modalConfirmacao');
const formEditar = document.getElementById('formEditarRegistro');

async function carregarFiltroVacinas() {
    try {
        const resposta = await fetch('http://localhost:3000/vacinas');
        todasAsVacinas = await resposta.json();
        const selectVacinaModal = document.getElementById('selectVacina');
        if(selectVacinaModal) {
            selectVacinaModal.innerHTML = '<option value="">Selecione a vacina...</option>';
            todasAsVacinas.forEach(v => {
                const optionModal = document.createElement('option');
                optionModal.value = v.id_vacina;
                optionModal.textContent = v.nome_vacina;
                selectVacinaModal.appendChild(optionModal);
            });
        }
    } catch (erro) {}
}

async function carregarVeterinarios() {
    try {
        const resposta = await fetch('http://localhost:3000/veterinarios');
        if (resposta.ok) {
            const vets = await resposta.json();
            const selectVet = document.getElementById('selectVeterinario');
            if (selectVet) {
                selectVet.innerHTML = '<option value="">Selecione quem aplicou...</option>';
                vets.forEach(v => {
                    const option = document.createElement('option');
                    option.value = v.id_veterinario;
                    option.textContent = v.nome_completo;
                    selectVet.appendChild(option);
                });
            }
        }
    } catch (erro) {}
}

function calcularProximaDose() {
    const idVacina = document.getElementById('selectVacina').value;
    const dataApp = document.getElementById('data_aplicacao').value;
    const inputProxDose = document.getElementById('data_proxima_dose');

    if (idVacina && dataApp && inputProxDose) {
        const vacinaSelecionada = todasAsVacinas.find(v => v.id_vacina == idVacina);
        const intervalo = vacinaSelecionada ? (vacinaSelecionada.intervalo_doses_dias || vacinaSelecionada.intervalo_dose_dias || 0) : 0;

        if (intervalo > 0) {
            const partes = dataApp.split('-');
            const dataBaseObj = new Date(partes[0], partes[1] - 1, partes[2]);
            dataBaseObj.setDate(dataBaseObj.getDate() + parseInt(intervalo));

            const ano = dataBaseObj.getFullYear();
            const mes = String(dataBaseObj.getMonth() + 1).padStart(2, '0');
            const dia = String(dataBaseObj.getDate()).padStart(2, '0');
            
            inputProxDose.value = `${ano}-${mes}-${dia}`;
        }
    }
}

async function carregarHistorico() {
    if (!idAnimalAtual) return;
    
    const termo = document.getElementById('termoBusca') ? document.getElementById('termoBusca').value : '';
    const status = document.getElementById('filtroStatus') ? document.getElementById('filtroStatus').value : '';

    let url = `http://localhost:3000/historico-pet/${idAnimalAtual}?termo=${termo}&status=${status}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        renderizarHistorico(dados);
    } catch (erro) {}
}

function renderizarHistorico(historico) {
    const divResultados = document.getElementById('listaHistorico');
    if (!divResultados) return;
    divResultados.innerHTML = '';

    if (historico.length === 0) {
        divResultados.innerHTML = '<p>Nenhum registro encontrado.</p>';
        return;
    }

    historico.forEach(reg => {
        const card = document.createElement('div');
        card.className = 'resultado-card';
        
        const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
        const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
        const corStatus = reg.status === 'APLICADA' ? 'green' : (reg.status === 'ATRASADA' ? 'red' : 'orange');

        const regString = encodeURIComponent(JSON.stringify(reg));

        card.innerHTML = `
            <div>
                <h3>💉 ${reg.nome_vacina}</h3>
                <p><strong>Status:</strong> <span style="color: ${corStatus}; font-weight: bold;">${reg.status}</span></p>
                <p><strong>Aplicação:</strong> ${dataApp} | <strong>Próxima Dose:</strong> ${dataProx}</p>
            </div>
            <div style="display: flex; gap: 10px; flex-direction: column;">
                <button class="btn-vet" style="background-color: #ffc107; color: black; margin: 0;" onclick="abrirModalEditar('${regString}')">✏️ Editar</button>
                <button class="btn-vet" style="background-color: #dc3545; margin: 0;" onclick="excluirRegistro(${reg.id_registro})">🗑️ Excluir</button>
            </div>
        `;
        divResultados.appendChild(card);
    });
}

function abrirModalEditar(registroEncoded) {
    const reg = JSON.parse(decodeURIComponent(registroEncoded));
    
    document.getElementById('edit_id_registro').value = reg.id_registro;
    document.getElementById('selectVacina').value = reg.id_vacina || '';
    
    const selectStatus = document.getElementById('statusVacina');
    selectStatus.innerHTML = `
        <option value="APLICADA">Aplicada</option>
        <option value="PENDENTE">Agendada (Pendente)</option>
    `;
    
    if (reg.status === 'ATRASADA') {
        const opt = document.createElement('option');
        opt.value = 'ATRASADA';
        opt.textContent = 'Atrasada (Automático)';
        selectStatus.appendChild(opt);
    }
    
    selectStatus.value = reg.status;
    
    if (reg.data_aplicacao) {
        document.getElementById('data_aplicacao').value = reg.data_aplicacao.split('T')[0];
    } else {
        document.getElementById('data_aplicacao').value = '';
    }

    if (reg.data_proxima_dose) {
        document.getElementById('data_proxima_dose').value = reg.data_proxima_dose.split('T')[0];
    } else {
        document.getElementById('data_proxima_dose').value = '';
    }

    const selectVeterinario = document.getElementById('selectVeterinario');
    if (selectVeterinario && reg.id_veterinario) {
        selectVeterinario.value = reg.id_veterinario;
    } else if (selectVeterinario) {
        selectVeterinario.value = '';
    }

    const divMensagem = document.getElementById('mensagem');
    if(divMensagem) divMensagem.textContent = '';

    dispararLogicaVisualStatus();

    if (modalEditar) {
        modalEditar.style.display = 'block';
        modalEditar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function dispararLogicaVisualStatus() {
    const statusVal = document.getElementById('statusVacina').value;
    const inputDataAplicacao = document.getElementById('data_aplicacao');
    const inputProximaDose = document.getElementById('data_proxima_dose');
    const selectVeterinario = document.getElementById('selectVeterinario');
    const labelVeterinario = document.getElementById('labelVeterinario');
    const dataHojeStr = new Date().toISOString().split('T')[0];

    if (statusVal === 'PENDENTE' || statusVal === 'ATRASADA') {
        inputDataAplicacao.value = '';
        inputDataAplicacao.disabled = true;
        inputDataAplicacao.required = false;
        
        if (statusVal === 'PENDENTE') {
            inputProximaDose.setAttribute('min', dataHojeStr);
        } else {
            inputProximaDose.removeAttribute('min');
        }

        if (selectVeterinario && labelVeterinario) {
            selectVeterinario.style.display = 'none';
            labelVeterinario.style.display = 'none';
            selectVeterinario.required = false;
            selectVeterinario.value = '';
        }
    } else {
        inputDataAplicacao.disabled = false;
        inputDataAplicacao.required = true;
        
        inputProximaDose.setAttribute('min', inputDataAplicacao.value || '');

        if (selectVeterinario && labelVeterinario) {
            selectVeterinario.style.display = 'block';
            labelVeterinario.style.display = 'block';
            selectVeterinario.required = true;
        }
    }
}

const selectStatusVacina = document.getElementById('statusVacina');
if (selectStatusVacina) {
    selectStatusVacina.addEventListener('change', () => {
        dispararLogicaVisualStatus();
        calcularProximaDose();
    });
}

const inputDataAplicacao = document.getElementById('data_aplicacao');
if (inputDataAplicacao) {
    inputDataAplicacao.addEventListener('change', () => {
        calcularProximaDose();
        const inputProximaDose = document.getElementById('data_proxima_dose');
        if(inputProximaDose) {
            inputProximaDose.setAttribute('min', inputDataAplicacao.value);
        }
    });
}

const selectVacinaCalculo = document.getElementById('selectVacina');
if (selectVacinaCalculo) {
    selectVacinaCalculo.addEventListener('change', calcularProximaDose);
}

if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idRegistro = document.getElementById('edit_id_registro').value;
        const statusVal = document.getElementById('statusVacina').value;
        const idVetEl = document.getElementById('selectVeterinario');
        const dataAppStr = document.getElementById('data_aplicacao').value;
        const dataProxStr = document.getElementById('data_proxima_dose').value;
        const dataHojeStr = new Date().toISOString().split('T')[0];
        const divMensagem = document.getElementById('mensagem');

        if (statusVal === 'PENDENTE' && dataProxStr < dataHojeStr) {
            if (divMensagem) {
                divMensagem.style.color = 'red';
                divMensagem.textContent = 'A data de vencimento de uma vacina pendente não pode estar no passado.';
            }
            return;
        }

        if (dataAppStr && dataProxStr && dataProxStr < dataAppStr) {
            if (divMensagem) {
                divMensagem.style.color = 'red';
                divMensagem.textContent = 'A data da próxima dose/vencimento não pode ser anterior à data de aplicação.';
            }
            return;
        }
        
        const payload = {
            id_vacina: document.getElementById('selectVacina').value,
            data_aplicacao: dataAppStr || null,
            data_proxima_dose: dataProxStr || null,
            status: statusVal,
            id_veterinario: (statusVal === 'APLICADA' || statusVal === 'ATRASADA') && idVetEl ? idVetEl.value : null
        };

        try {
            const resposta = await fetch(`http://localhost:3000/editar-registro-vacina/${idRegistro}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resposta.ok) {
                fecharModais();
                carregarHistorico();
            } else {
                if (divMensagem) {
                    divMensagem.style.color = 'red';
                    divMensagem.textContent = 'Erro ao atualizar o registro.';
                }
            }
        } catch (erro) {
            if (divMensagem) {
                divMensagem.style.color = 'red';
                divMensagem.textContent = 'Erro de conexão com o servidor.';
            }
        }
    });
}

function fecharModais() {
    if(modalEditar) modalEditar.style.display = 'none';
    if(modalConfirmacao) modalConfirmacao.style.display = 'none';
}

function excluirRegistro(id) {
    idRegistroParaExcluir = id;
    if(modalConfirmacao) modalConfirmacao.style.display = 'flex';
}

const btnConfirmarExclusao = document.getElementById('btnConfirmarExclusao');
if (btnConfirmarExclusao) {
    btnConfirmarExclusao.addEventListener('click', async () => {
        if (!idRegistroParaExcluir) return;
        try {
            const res = await fetch(`http://localhost:3000/deletar-registro-vacina/${idRegistroParaExcluir}`, { method: 'DELETE' });
            if (res.ok) {
                fecharModais();
                carregarHistorico();
            }
        } catch(e) {}
    });
}

const btnBuscar = document.getElementById('btnBuscar');
if (btnBuscar) {
    btnBuscar.addEventListener('click', carregarHistorico);
}

window.addEventListener('DOMContentLoaded', async () => {
    const dataHoje = new Date().toISOString().split('T')[0];
    const inputAppDate = document.getElementById('data_aplicacao');
    if (inputAppDate) inputAppDate.setAttribute('max', dataHoje);
    
    await carregarFiltroVacinas();
    await carregarVeterinarios();
    carregarHistorico();
});