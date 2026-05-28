const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil.toUpperCase() !== 'GESTOR' && usuario.perfil.toUpperCase() !== 'GESTOR_CLINICA') {
        window.location.href = '../dashboard.html';
    }
}

let idParaExcluir = null;
const modalForm = document.getElementById('modalForm');
const modalConfirmacao = document.getElementById('modalConfirmacao');
const formVet = document.getElementById('formVet');

async function buscarEquipe() {
    const termo = document.getElementById('termoBusca').value;
    try {
        const resposta = await fetch(`http://localhost:3000/gestor/veterinarios-lista?termo=${termo}`);
        const dados = await resposta.json();
        renderizarEquipe(dados);
    } catch (erro) {
        document.getElementById('listaResultados').innerHTML = '<p style="color: red;">Erro ao buscar equipe.</p>';
    }
}

function renderizarEquipe(lista) {
    const divResultados = document.getElementById('listaResultados');
    divResultados.innerHTML = '';

    if (lista.length === 0) {
        divResultados.innerHTML = '<p>Nenhum veterinário encontrado.</p>';
        return;
    }

    lista.forEach(vet => {
        const card = document.createElement('div');
        card.className = 'resultado-card';
        
        const vetEncoded = encodeURIComponent(JSON.stringify(vet));

        card.innerHTML = `
            <div>
                <h3 style="margin-top:0; color:#007bff;">🩺 ${vet.nome_completo}</h3>
                <p><strong>CRMV:</strong> ${vet.crmv} | <strong>E-mail:</strong> ${vet.email}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <button class="btn-vet" style="background-color: #ffc107; color: black;" onclick="abrirModalEdicao('${vetEncoded}')">✏️ Editar</button>
                <button class="btn-vet" style="background-color: #dc3545;" onclick="confirmarExclusao(${vet.id_veterinario})">🗑️ Excluir</button>
            </div>
        `;
        divResultados.appendChild(card);
    });
}

function fecharModais() {
    if(modalForm) modalForm.style.display = 'none';
    if(modalConfirmacao) modalConfirmacao.style.display = 'none';
    idParaExcluir = null;
}

function abrirModalCadastro() {
    fecharModais();
    if(formVet) formVet.reset();
    document.getElementById('vet_id_veterinario').value = '';
    document.getElementById('vet_id_usuario').value = '';
    document.getElementById('tituloModal').textContent = 'Cadastrar Novo Veterinário';
    
    document.getElementById('areaSenha').style.display = 'block';
    document.getElementById('vet_senha').required = true;

    const divMensagem = document.getElementById('mensagem');
    if (divMensagem) divMensagem.textContent = '';

    if(modalForm) {
        modalForm.style.display = 'block';
        modalForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function abrirModalEdicao(vetEncoded) {
    fecharModais();
    const vet = JSON.parse(decodeURIComponent(vetEncoded));
    
    document.getElementById('vet_id_veterinario').value = vet.id_veterinario;
    document.getElementById('vet_id_usuario').value = vet.id_usuario;
    document.getElementById('vet_nome').value = vet.nome_completo;
    document.getElementById('vet_crmv').value = vet.crmv;
    document.getElementById('vet_email').value = vet.email;
    
    document.getElementById('tituloModal').textContent = '✏️ Editar Veterinário';
    document.getElementById('areaSenha').style.display = 'none';
    document.getElementById('vet_senha').required = false;

    const divMensagem = document.getElementById('mensagem');
    if (divMensagem) divMensagem.textContent = '';

    if(modalForm) {
        modalForm.style.display = 'block';
        modalForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

if (formVet) {
    formVet.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const idVet = document.getElementById('vet_id_veterinario').value;
        const isEdicao = idVet !== '';
        const divMensagem = document.getElementById('mensagem');
        
        const payload = {
            nome_completo: document.getElementById('vet_nome').value,
            crmv: document.getElementById('vet_crmv').value,
            email: document.getElementById('vet_email').value
        };

        let url = 'http://localhost:3000/gestor/cadastrar-vet';
        let metodo = 'POST';

        if (isEdicao) {
            payload.id_usuario = document.getElementById('vet_id_usuario').value;
            url = `http://localhost:3000/gestor/editar-vet/${idVet}`;
            metodo = 'PUT';
        } else {
            payload.senha = document.getElementById('vet_senha').value;
        }

        try {
            const resposta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                if (divMensagem) {
                    divMensagem.style.color = 'green';
                    divMensagem.textContent = dados.mensagem;
                }
                setTimeout(() => {
                    fecharModais();
                    buscarEquipe();
                }, 1500);
            } else {
                if (divMensagem) {
                    divMensagem.style.color = 'red';
                    divMensagem.textContent = dados.erro || 'Erro ao processar.';
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

function confirmarExclusao(id) {
    idParaExcluir = id;
    if(modalConfirmacao) modalConfirmacao.style.display = 'flex';
}

const btnConfirma = document.getElementById('btnConfirmarExclusao');
if (btnConfirma) {
    btnConfirma.addEventListener('click', async () => {
        if (!idParaExcluir) return;
        
        try {
            const resposta = await fetch(`http://localhost:3000/gestor/deletar-vet/${idParaExcluir}`, {
                method: 'DELETE'
            });
            const dados = await resposta.json();
            
            if (resposta.ok) {
                fecharModais();
                buscarEquipe();
            } else {
                alert(dados.erro || 'Erro ao excluir.');
                fecharModais();
            }
        } catch (erro) {
            alert('Erro de conexão.');
            fecharModais();
        }
    });
}

const btnBusca = document.getElementById('btnBuscar');
if (btnBusca) {
    btnBusca.addEventListener('click', buscarEquipe);
}

window.addEventListener('DOMContentLoaded', buscarEquipe);