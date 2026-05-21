const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
} else {
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil !== 'VETERINARIO') {
        window.location.href = '../dashboard.html';
    }
}

async function carregarAtrasados() {
    const divLista = document.getElementById('listaAtrasados');
    try {
        const resposta = await fetch('http://localhost:3000/animais-atrasados');
        const dados = await resposta.json();
        
        divLista.innerHTML = '';
        
        if (dados.length === 0) {
            divLista.innerHTML = '<p style="color: green; font-weight: bold; font-size: 18px;">Nenhuma vacina atrasada no sistema!</p>';
            return;
        }
        
        dados.forEach(item => {
            const dataVenc = new Date(item.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const card = document.createElement('div');
            card.className = 'atrasado-card';
            
            const telLimpo = item.telefone.replace(/\D/g, '');
            const mensagemWhats = `Olá, ${item.nome_tutor}. Notamos no sistema ImunoPet que a vacina ${item.nome_vacina} do(a) ${item.nome_animal} venceu em ${dataVenc}. Gostaria de agendar a nova dose?`;
            const linkWhats = `https://wa.me/55${telLimpo}?text=${encodeURIComponent(mensagemWhats)}`;

            card.innerHTML = `
                <div>
                    <strong style="font-size: 18px;">🐾 ${item.nome_animal} (${item.especie})</strong><br>
                    <span>Vacina: <strong>${item.nome_vacina}</strong> (Venceu em: ${dataVenc})</span><br>
                    <span style="font-size: 13px; color: #555;">Tutor: ${item.nome_tutor} | Contato: ${item.telefone}</span>
                </div>
                <a href="${linkWhats}" target="_blank" class="btn-contato">📱 Entrar em Contato</a>
            `;
            divLista.appendChild(card);
        });
    } catch (erro) {
        divLista.innerHTML = '<p>Erro ao carregar os registros de atrasos.</p>';
    }
}

window.addEventListener('DOMContentLoaded', carregarAtrasados);