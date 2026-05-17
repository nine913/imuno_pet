const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = 'dashboard.html';
    }
}

const params = new URLSearchParams(window.location.search);
const idAnimalUrl = params.get('id');

if (!idAnimalUrl) {
    window.location.href = 'vet-buscar.html';
}

document.getElementById('telefone').addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    e.target.value = v;
});

document.getElementById('estado').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
});

async function carregarDadosEdicao() {
    try {
        const resposta = await fetch(`http://localhost:3000/detalhes-animal/${idAnimalUrl}`);
        if (!resposta.ok) throw new Error('Falha ao buscar dados');
        
        const dados = await resposta.json();
        
        document.getElementById('nome_animal').value = dados.nome_animal;
        document.getElementById('especie').value = dados.especie;
        document.getElementById('raca').value = dados.raca;
        document.getElementById('data_nascimento').value = dados.data_nascimento.split('T')[0];
        
        document.getElementById('id_tutor').value = dados.id_tutor;
        document.getElementById('nome_tutor_display').textContent = dados.nome_tutor;
        document.getElementById('telefone').value = dados.telefone;
        document.getElementById('estado').value = dados.estado;
        document.getElementById('cidade').value = dados.cidade;
        document.getElementById('bairro').value = dados.bairro;

    } catch (erro) {
        document.getElementById('mensagem').style.color = 'red';
        document.getElementById('mensagem').textContent = 'Erro ao carregar as informações.';
    }
}

carregarDadosEdicao();

document.getElementById('formEditar').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome_animal = document.getElementById('nome_animal').value;
    const especie = document.getElementById('especie').value;
    const raca = document.getElementById('raca').value;
    const data_nascimento = document.getElementById('data_nascimento').value;
    const id_tutor = document.getElementById('id_tutor').value;
    const telefone = document.getElementById('telefone').value;
    const estado = document.getElementById('estado').value;
    const cidade = document.getElementById('cidade').value;
    const bairro = document.getElementById('bairro').value;
    const divMensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch(`http://localhost:3000/editar-pet-tutor/${idAnimalUrl}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome_animal, especie, raca, data_nascimento, id_tutor, telefone, estado, cidade, bairro
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            setTimeout(() => {
                window.location.href = 'vet-buscar.html';
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