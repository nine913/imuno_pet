const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = 'dashboard.html';
    }
}

async function carregarVacinas() {
    try {
        const resposta = await fetch('http://localhost:3000/vacinas');
        const vacinas = await resposta.json();
        const select = document.getElementById('selectVacina');
        
        select.innerHTML = '<option value="" data-intervalo="0">Selecione a vacina...</option>';

        vacinas.forEach(v => {
            const option = document.createElement('option');
            option.value = v.id_vacina;
            option.textContent = `${v.nome_vacina} (${v.doencas_prevenidas})`;
            
            option.setAttribute('data-intervalo', v.intervalo_doses_dias || 0); 
            
            select.appendChild(option);
        });
    } catch (erro) {
        console.error(erro);
    }
}

async function realizarBusca() {
    const termo = document.getElementById('termoBusca').value;
    const vacina = document.getElementById('filtroVacina').value;
    const status = document.getElementById('filtroStatus').value;
    
    const divResultados = document.getElementById('listaResultados');
    document.getElementById('modalVacina').style.display = 'none';
    
    try {
        const url = `http://localhost:3000/buscar-animais?termo=${termo}&vacina=${vacina}&status=${status}`;
        const resposta = await fetch(url);
        const animais = await resposta.json();

        divResultados.innerHTML = '';

        if (animais.length === 0) {
            divResultados.innerHTML = '<p>Nenhum animal encontrado com esses critérios.</p>';
            return;
        }

        animais.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'resultado-card';
            card.innerHTML = `
                <div style="flex: 1;">
                    <strong>Pet:</strong> ${pet.nome_animal} (${pet.especie} - ${pet.raca})<br>
                    <span style="font-size: 14px; color: #555;"><strong>Tutor:</strong> ${pet.nome_tutor} | <strong>CPF:</strong> ${pet.cpf}</span>
                </div>
                <div style="display: flex; gap: 10px; flex-direction: column;">
                    <button onclick="abrirModalVacina(${pet.id_animal}, '${pet.nome_animal}')" style="background-color: #0056b3;">Registrar Vacina</button>
                    <button onclick="window.location.href='vet-historico.html?id=${pet.id_animal}'" style="background-color: #17a2b8; color: white;">Ver Histórico Completo</button>
                    <button onclick="window.location.href='vet-editar.html?id=${pet.id_animal}'" style="background-color: #ffc107; color: #333;">Editar Informações</button>
                    <button onclick="deletarAnimal(${pet.id_animal})" style="background-color: #dc3545; color: white;">Excluir Animal</button>
                </div>
            `;
            divResultados.appendChild(card);
        });
    } catch (erro) {
        divResultados.innerHTML = '<p style="color:red;">Erro na busca.</p>';
    }
}

document.getElementById('btnBuscar').addEventListener('click', realizarBusca);

window.addEventListener('DOMContentLoaded', () => {
    carregarVacinas();
    realizarBusca();
});

function abrirModalVacina(idAnimal, nomeAnimal) {
    document.getElementById('modalVacina').style.display = 'block';
    document.getElementById('id_animal_selecionado').value = idAnimal;
    document.getElementById('tituloPetSelecionado').textContent = `Registrar Vacina para: ${nomeAnimal}`;
    document.getElementById('mensagem').textContent = '';
    window.scrollTo(0, document.body.scrollHeight);
    
    carregarVacinas();
}

function calcularProximaDose() {
    const selectVacina = document.getElementById('selectVacina');
    const inputAplicacao = document.getElementById('data_aplicacao');
    const inputProximaDose = document.getElementById('data_proxima_dose');

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
    }
}

document.getElementById('selectVacina').addEventListener('change', calcularProximaDose);
document.getElementById('data_aplicacao').addEventListener('change', calcularProximaDose);

document.getElementById('formVacina').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_animal = document.getElementById('id_animal_selecionado').value;
    const id_vacina = document.getElementById('selectVacina').value;
    const status = document.getElementById('statusVacina').value;
    const data_aplicacao = document.getElementById('data_aplicacao').value;
    const data_proxima_dose = document.getElementById('data_proxima_dose').value;
    const divMensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch('http://localhost:3000/registrar-vacina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_animal, id_vacina, status, data_aplicacao, data_proxima_dose
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            document.getElementById('formVacina').reset();
            setTimeout(() => {
                document.getElementById('modalVacina').style.display = 'none';
            }, 2000);
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao salvar registro.';
    }
});

let animalParaExcluir = null;

function deletarAnimal(idAnimal) {
    animalParaExcluir = idAnimal;
    document.getElementById('modalConfirmacao').style.display = 'flex';
}

function fecharModalExclusao() {
    animalParaExcluir = null;
    document.getElementById('modalConfirmacao').style.display = 'none';
}

document.getElementById('btnConfirmarExclusao').addEventListener('click', async () => {
    if (!animalParaExcluir) return;

    try {
        const resposta = await fetch(`http://localhost:3000/deletar-animal/${animalParaExcluir}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            fecharModalExclusao();
            realizarBusca();
        } else {
            alert('Erro ao excluir animal.');
        }
    } catch (erro) {
        alert('Erro ao conectar com o servidor.');
    }
});