const usuarioString = localStorage.getItem('usuarioImunoPet');

if (!usuarioString) {
    window.location.href = 'index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = 'dashboard.html';
    }
}

document.getElementById('intervalo_doses_dias').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, "");
});

document.getElementById('cadastroVacinaForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome_vacina = document.getElementById('nome_vacina').value;
    const doencas_prevenidas = document.getElementById('doencas_prevenidas').value;
    const fabricante = document.getElementById('fabricante').value;
    const intervalo_dose_dias = document.getElementById('intervalo_doses_dias').value;
    const divMensagem = document.getElementById('mensagemCadastro');

    try {
        const resposta = await fetch('http://localhost:3000/cadastrar-vacina', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome_vacina, doencas_prevenidas, fabricante, intervalo_dose_dias })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            divMensagem.style.color = 'green';
            divMensagem.textContent = dados.mensagem;
            document.getElementById('cadastroVacinaForm').reset();
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao conectar com o servidor.';
    }
});