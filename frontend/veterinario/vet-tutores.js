const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = 'dashboard.html';
    }
}

document.getElementById('edit_telefone').addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    e.target.value = v;
});

document.getElementById('edit_estado').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
});

async function realizarBusca(termo = '') {
    const divResultados = document.getElementById('listaResultados');
    
    try {
        const resposta = await fetch(`http://localhost:3000/listar-tutores?termo=${termo}`);
        const tutores = await resposta.json();

        divResultados.innerHTML = '';

        if (tutores.length === 0) {
            divResultados.innerHTML = '<p>Nenhum tutor encontrado.</p>';
            return;
        }

        tutores.forEach(tutor => {
            const card = document.createElement('div');
            card.className = 'resultado-card';
            
            const tutorDadosString = encodeURIComponent(JSON.stringify(tutor));

            card.innerHTML = `
                <div style="flex: 1;">
                    <strong>${tutor.nome_completo}</strong><br>
                    <span style="font-size: 14px; color: #555;">
                        <strong>CPF:</strong> ${tutor.cpf} | <strong>Email:</strong> ${tutor.email}<br>
                        <strong>Telefone:</strong> ${tutor.telefone}<br>
                        <strong>Endereço:</strong> ${tutor.bairro}, ${tutor.cidade} - ${tutor.estado}
                    </span>
                </div>
                <div style="display: flex; gap: 10px; flex-direction: column;">
                    <button onclick="abrirModalEditar('${tutorDadosString}')" style="background-color: #ffc107; color: #333;">Editar Tutor</button>
                    <button onclick="abrirModalExclusao(${tutor.id_tutor})" style="background-color: #dc3545; color: white;">Excluir</button>
                </div>
            `;
            divResultados.appendChild(card);
        });
    } catch (erro) {
        divResultados.innerHTML = '<p style="color:red;">Erro na busca.</p>';
    }
}

document.getElementById('btnBuscar').addEventListener('click', () => {
    const termo = document.getElementById('termoBusca').value;
    realizarBusca(termo);
});

window.addEventListener('DOMContentLoaded', () => {
    realizarBusca();
});

function abrirModalEditar(tutorDadosString) {
    const tutor = JSON.parse(decodeURIComponent(tutorDadosString));
    
    document.getElementById('edit_id_tutor').value = tutor.id_tutor;
    document.getElementById('edit_nome').value = tutor.nome_completo;
    document.getElementById('edit_telefone').value = tutor.telefone;
    document.getElementById('edit_estado').value = tutor.estado;
    document.getElementById('edit_cidade').value = tutor.cidade;
    document.getElementById('edit_bairro').value = tutor.bairro;
    
    document.getElementById('mensagemEditar').textContent = '';
    document.getElementById('modalEditar').style.display = 'flex';
}

function fecharModalEditar() {
    document.getElementById('modalEditar').style.display = 'none';
}

document.getElementById('formEditarTutor').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_tutor = document.getElementById('edit_id_tutor').value;
    const nome_completo = document.getElementById('edit_nome').value;
    const telefone = document.getElementById('edit_telefone').value;
    const estado = document.getElementById('edit_estado').value;
    const cidade = document.getElementById('edit_cidade').value;
    const bairro = document.getElementById('edit_bairro').value;
    
    const divMensagem = document.getElementById('mensagemEditar');

    try {
        const resposta = await fetch(`http://localhost:3000/editar-tutor-dados/${id_tutor}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_completo, telefone, estado, cidade, bairro })
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

let tutorParaExcluir = null;

function abrirModalExclusao(idTutor) {
    tutorParaExcluir = idTutor;
    document.getElementById('modalConfirmacao').style.display = 'flex';
}

function fecharModalExclusao() {
    tutorParaExcluir = null;
    document.getElementById('modalConfirmacao').style.display = 'none';
}

document.getElementById('btnConfirmarExclusao').addEventListener('click', async () => {
    if (!tutorParaExcluir) return;

    try {
        const resposta = await fetch(`http://localhost:3000/deletar-tutor/${tutorParaExcluir}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            fecharModalExclusao();
            const termo = document.getElementById('termoBusca').value;
            realizarBusca(termo);
        } else {
            alert('Erro ao excluir tutor.');
        }
    } catch (erro) {
        alert('Erro ao conectar com o servidor.');
    }
});