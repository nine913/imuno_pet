const usuarioString = localStorage.getItem('usuarioImunoPet');

if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = '../dashboard.html';
    }
}

async function carregarTutores() {
    try {
        const resposta = await fetch('http://localhost:3000/tutores');
        const tutores = await resposta.json();
        const select = document.getElementById('id_tutor_selecionado');
        
        tutores.forEach(tutor => {
            const option = document.createElement('option');
            option.value = tutor.id_usuario;
            option.textContent = `${tutor.nome_completo} (CPF: ${tutor.cpf})`;
            select.appendChild(option);
        });
    } catch (erro) {
        console.error(erro);
    }
}

document.getElementById('cadastroPetForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_usuario = document.getElementById('id_tutor_selecionado').value;
    const nome = document.getElementById('nome').value;
    const especie = document.getElementById('especie').value;
    const raca = document.getElementById('raca').value;
    const data_nascimento = document.getElementById('data_nascimento').value;
    const divMensagem = document.getElementById('mensagemCadastro');

    try {
        const resposta = await fetch('http://localhost:3000/cadastrar-pet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario, nome, especie, raca, data_nascimento
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            document.getElementById('cadastroPetForm').reset();
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao conectar com o servidor.';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const dataHoje = new Date().toISOString().split('T')[0];
    const campoNascimento = document.getElementById('data_nascimento');
    
    if (campoNascimento) {
        campoNascimento.setAttribute('max', dataHoje);
    }
    
    carregarTutores();
});