const usuarioString = localStorage.getItem('usuarioImunoPet');

if (!usuarioString) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = 'dashboard.html';
    }
}

document.getElementById('cpf').addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = v;
});

document.getElementById('telefone').addEventListener('input', function (e) {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    e.target.value = v;
});

document.getElementById('estado').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
});

document.getElementById('cadastroForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome_completo = document.getElementById('nome_completo').value;
    const cpf = document.getElementById('cpf').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('emailCad').value;
    const senha = document.getElementById('senhaCad').value;
    const estado = document.getElementById('estado').value;
    const cidade = document.getElementById('cidade').value;
    const bairro = document.getElementById('bairro').value;
    const divMensagem = document.getElementById('mensagemCadastro');

    try {
        const resposta = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome_completo, cpf, telefone, email, senha, estado, cidade, bairro
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = 'Tutor cadastrado com sucesso!';
            document.getElementById('cadastroForm').reset();
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao conectar com o servidor.';
    }
});