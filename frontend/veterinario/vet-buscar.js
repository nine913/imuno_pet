const usuarioString = localStorage.getItem('usuarioImunoPet');

if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = '../dashboard.html';
    }
}

let todosOsAnimais = [];
let todasAsVacinas = [];
let idAnimalParaExcluir = null;

const modalEditar = document.getElementById('modalEditar');
const modalVacina = document.getElementById('modalVacina');
const modalConfirmacao = document.getElementById('modalConfirmacao');

const formEditar = document.getElementById('formEditarAnimal');
const formVacina = document.getElementById('formVacina');

async function carregarFiltroVacinas() {
    try {
        const resposta = await fetch('http://localhost:3000/vacinas');
        todasAsVacinas = await resposta.json();
        const selectVacinaModal = document.getElementById('selectVacina');
        
        todasAsVacinas.forEach(v => {
            if(selectVacinaModal) {
                const optionModal = document.createElement('option');
                optionModal.value = v.id_vacina;
                optionModal.textContent = v.nome_vacina;
                selectVacinaModal.appendChild(optionModal);
            }
        });
    } catch (erro) {
    }
}

async function carregarVeterinarios() {
    try {
        const resposta = await fetch('http://localhost:3000/veterinarios');
        
        if (!resposta.ok) {
            alert("Erro na rota de veterinários no servidor.");
            return;
        }

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
    } catch (erro) {
        alert("Erro de conexão ao tentar carregar a lista de veterinários.");
    }
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

async function buscarAnimais() {
    const termo = document.getElementById('termoBusca').value;
    const vacina = document.getElementById('filtroVacina').value;
    const status = document.getElementById('filtroStatus').value;

    let url = `http://localhost:3000/buscar-animais?termo=${termo}&vacina=${vacina}&status=${status}`;

    try {
        const resposta = await fetch(url);
        todosOsAnimais = await resposta.json();
        renderizarAnimais(todosOsAnimais);
    } catch (erro) {
        document.getElementById('listaResultados').innerHTML = '<p style="color: red;">Erro ao buscar animais.</p>';
    }
}

function renderizarAnimais(animais) {
    const divResultados = document.getElementById('listaResultados');
    if (!divResultados) return;
    
    divResultados.innerHTML = '';

    if (animais.length === 0) {
        divResultados.innerHTML = '<p>Nenhum animal encontrado com estes critérios.</p>';
        return;
    }

    animais.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'resultado-card';
        card.innerHTML = `
            <div>
                <h3>🐾 ${animal.nome_animal} (${animal.especie} - ${animal.raca})</h3>
                <p><strong>Tutor:</strong> ${animal.nome_tutor} | <strong>CPF:</strong> ${animal.cpf}</p>
            </div>
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 5px;">
                <button class="btn-vet" style="margin: 0;" onclick="abrirModalEditar(${animal.id_animal})">✏️ Editar</button>
                <button class="btn-vet" style="background-color: #17a2b8; margin: 0;" onclick="window.location.href='vet-historico.html?id=${animal.id_animal}'">📋 Histórico</button>
                <button class="btn-vet" style="background-color: #ffc107; color: black; margin: 0;" onclick="abrirModalVacina(${animal.id_animal}, '${animal.nome_animal}')">💉 Registrar Vacina</button>
                <button class="btn-vet" style="background-color: #dc3545; margin: 0;" onclick="excluirAnimal(${animal.id_animal})">🗑️ Excluir</button>
            </div>
        `;
        divResultados.appendChild(card);
    });
}

function fecharModais() {
    if(modalEditar) modalEditar.style.display = 'none';
    if(modalVacina) modalVacina.style.display = 'none';
    if(modalConfirmacao) modalConfirmacao.style.display = 'none';
}

function fecharModalExclusao() {
    if(modalConfirmacao) modalConfirmacao.style.display = 'none';
    idAnimalParaExcluir = null;
}

async function abrirModalEditar(idAnimal) {
    fecharModais();
    try {
        const resposta = await fetch(`http://localhost:3000/detalhes-animal/${idAnimal}`);
        const dados = await resposta.json();

        document.getElementById('edit_id_animal').value = dados.id_animal;
        document.getElementById('edit_id_tutor').value = dados.id_tutor;
        document.getElementById('edit_nome_animal').value = dados.nome_animal;
        document.getElementById('edit_especie').value = dados.especie;
        document.getElementById('edit_raca').value = dados.raca;
        document.getElementById('edit_telefone').value = dados.telefone;
        document.getElementById('edit_estado').value = dados.estado;
        document.getElementById('edit_cidade').value = dados.cidade;
        document.getElementById('edit_bairro').value = dados.bairro;

        const dataNascEl = document.getElementById('edit_data_nascimento');
        if (dados.data_nascimento) {
            dataNascEl.value = dados.data_nascimento.split('T')[0];
        }

        if (modalEditar) {
            modalEditar.style.display = 'block';
            modalEditar.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } catch (erro) {
    }
}

if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idAnimal = document.getElementById('edit_id_animal').value;
        const payload = {
            id_tutor: document.getElementById('edit_id_tutor').value,
            nome_animal: document.getElementById('edit_nome_animal').value,
            especie: document.getElementById('edit_especie').value,
            raca: document.getElementById('edit_raca').value,
            data_nascimento: document.getElementById('edit_data_nascimento').value,
            telefone: document.getElementById('edit_telefone').value,
            estado: document.getElementById('edit_estado').value,
            cidade: document.getElementById('edit_cidade').value,
            bairro: document.getElementById('edit_bairro').value
        };

        try {
            const resposta = await fetch(`http://localhost:3000/editar-pet-tutor/${idAnimal}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resposta.ok) {
                fecharModais();
                buscarAnimais();
            }
        } catch (erro) {
        }
    });
}

function abrirModalVacina(idAnimal, nomeAnimal) {
    fecharModais();
    document.getElementById('vacina_id_animal').value = idAnimal;
    document.getElementById('tituloPetSelecionado').textContent = `💉 Registrar Vacina para: ${nomeAnimal}`;
    
    formVacina.reset();
    
    const inputDataAplicacao = document.getElementById('data_aplicacao');
    const selectVeterinario = document.getElementById('selectVeterinario');
    const labelVeterinario = document.getElementById('labelVeterinario');
    const statusVacina = document.getElementById('statusVacina');
    
    inputDataAplicacao.disabled = false;
    inputDataAplicacao.required = true;
    
    if (selectVeterinario && labelVeterinario) {
        selectVeterinario.style.display = 'block';
        labelVeterinario.style.display = 'block';
        selectVeterinario.required = true;
    }
    
    if (statusVacina) {
        statusVacina.value = 'APLICADA';
    }
    
    const divMensagem = document.getElementById('mensagem');
    if (divMensagem) divMensagem.textContent = '';
    
    if (modalVacina) {
        modalVacina.style.display = 'block';
        modalVacina.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

if (formVacina) {
    formVacina.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const dataAppEl = document.getElementById('data_aplicacao').value;
        const dataProxEl = document.getElementById('data_proxima_dose').value;
        const idVetEl = document.getElementById('selectVeterinario');
        const statusVal = document.getElementById('statusVacina').value;
        const divMensagem = document.getElementById('mensagem');

        const payload = {
            id_animal: document.getElementById('vacina_id_animal').value,
            id_vacina: document.getElementById('selectVacina').value,
            data_aplicacao: dataAppEl ? dataAppEl : null,
            data_proxima_dose: dataProxEl ? dataProxEl : null,
            status: statusVal,
            id_veterinario: statusVal === 'APLICADA' ? idVetEl.value : null
        };

        try {
            const resposta = await fetch('http://localhost:3000/registrar-vacina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resposta.ok) {
                if (divMensagem) {
                    divMensagem.style.color = 'green';
                    divMensagem.textContent = 'Registro salvo com sucesso!';
                }
                setTimeout(() => {
                    fecharModais();
                    buscarAnimais();
                }, 1500);
            } else {
                if (divMensagem) {
                    divMensagem.style.color = 'red';
                    divMensagem.textContent = 'Erro ao registrar a vacina.';
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

function excluirAnimal(idAnimal) {
    idAnimalParaExcluir = idAnimal;
    modalConfirmacao.style.display = 'flex'; 
}

async function confirmarExclusao() {
    if (!idAnimalParaExcluir) return;

    try {
        const resposta = await fetch(`http://localhost:3000/deletar-animal/${idAnimalParaExcluir}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            fecharModalExclusao();
            buscarAnimais();
        }
    } catch (erro) {
    }
}

const btnConfirmar = document.getElementById('btnConfirmarExclusao');
if (btnConfirmar) {
    btnConfirmar.addEventListener('click', confirmarExclusao);
}

const btnBuscar = document.getElementById('btnBuscar');
if (btnBuscar) {
    btnBuscar.addEventListener('click', buscarAnimais);
}

const selectStatusVacina = document.getElementById('statusVacina');
const inputDataAplicacao = document.getElementById('data_aplicacao');
const selectVacinaCalculo = document.getElementById('selectVacina');
const selectVeterinario = document.getElementById('selectVeterinario');
const labelVeterinario = document.getElementById('labelVeterinario');

if (selectStatusVacina && inputDataAplicacao) {
    selectStatusVacina.addEventListener('change', (evento) => {
        if (evento.target.value === 'PENDENTE') {
            inputDataAplicacao.value = '';
            inputDataAplicacao.disabled = true;
            inputDataAplicacao.required = false;
            
            if (selectVeterinario && labelVeterinario) {
                selectVeterinario.style.display = 'none';
                labelVeterinario.style.display = 'none';
                selectVeterinario.required = false;
                selectVeterinario.value = '';
            }
        } else {
            inputDataAplicacao.disabled = false;
            inputDataAplicacao.required = true;
            
            if (selectVeterinario && labelVeterinario) {
                selectVeterinario.style.display = 'block';
                labelVeterinario.style.display = 'block';
                selectVeterinario.required = true;
            }
            calcularProximaDose();
        }
    });
}

if (inputDataAplicacao) {
    inputDataAplicacao.addEventListener('change', calcularProximaDose);
}

if (selectVacinaCalculo) {
    selectVacinaCalculo.addEventListener('change', calcularProximaDose);
}

window.addEventListener('DOMContentLoaded', async () => {
    const dataHoje = new Date().toISOString().split('T')[0];

    const campoNascimento = document.getElementById('edit_data_nascimento');
    if (campoNascimento) {
        campoNascimento.setAttribute('max', dataHoje);
    }

    if (inputDataAplicacao) {
        inputDataAplicacao.setAttribute('max', dataHoje);
    }

    const inputProximaDose = document.getElementById('data_proxima_dose');
    if (inputProximaDose) {
        inputProximaDose.setAttribute('min', dataHoje);
    }

    await carregarFiltroVacinas();
    await carregarVeterinarios();
    buscarAnimais();
});