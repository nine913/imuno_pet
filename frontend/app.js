document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const divMensagem = document.getElementById('mensagem');

    try {
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            const usuarioImunoPet = {
                id_usuario: dados.id_usuario,
                perfil: dados.perfil,
                id_clinica: dados.id_clinica,
                id_especifico: dados.id_especifico,
                nome: dados.nome
            };
            
            localStorage.setItem('usuarioImunoPet', JSON.stringify(usuarioImunoPet));
            window.location.href = 'dashboard.html';
        } else {
            divMensagem.style.color = 'red';
            divMensagem.textContent = dados.erro;
        }
    } catch (erro) {
        divMensagem.style.color = 'red';
        divMensagem.textContent = 'Erro ao conectar com o servidor.';
    }
});