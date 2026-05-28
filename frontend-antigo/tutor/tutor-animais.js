const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
}

const usuario = JSON.parse(usuarioString);
let todosOsPets = [];

async function carregarAlertas() {
    const divAlertas = document.getElementById('areaAlertas');
    try {
        const resposta = await fetch(`http://localhost:3000/tutor/alertas/${usuario.id_usuario}`);
        const alertas = await resposta.json();
        
        divAlertas.innerHTML = '';
        
        alertas.forEach(alerta => {
            const dataLim = new Date(alerta.data_proxima_dose);
            const hoje = new Date();
            
            dataLim.setHours(0,0,0,0);
            hoje.setHours(0,0,0,0);
            
            const diffTime = dataLim - hoje;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const dataFormatada = new Date(alerta.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            
            const alertBox = document.createElement('div');
            
            if (alerta.status === 'ATRASADA') {
                alertBox.style = 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin-bottom: 15px; font-size: 14px;';
                alertBox.innerHTML = `🚨 <strong>Atenção Inadimplência:</strong> A vacina <strong>${alerta.nome_vacina}</strong> do seu pet <strong>${alerta.nome_animal}</strong> está vencida desde <strong>${dataFormatada}</strong>. Regularize a imunização o quanto antes!`;
                divAlertas.appendChild(alertBox);
            } else if (diffDays <= 30 && diffDays >= 0) {
                alertBox.style = 'background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; padding: 15px; border-radius: 6px; margin-bottom: 15px; font-size: 14px;';
                alertBox.innerHTML = `📅 <strong>Lembrete de Vacina:</strong> A dose da vacina <strong>${alerta.nome_vacina}</strong> para o seu pet <strong>${alerta.nome_animal}</strong> está chegando! Vencimento em <strong>${dataFormatada}</strong> (Faltam ${diffDays} dias).`;
                divAlertas.appendChild(alertBox);
            }
        });
    } catch (erro) {
        console.error(erro);
    }
}

async function carregarMeusPets() {
    try {
        const resposta = await fetch(`http://localhost:3000/tutor/animais/${usuario.id_usuario}`);
        todosOsPets = await resposta.json();
        renderizarPets(todosOsPets);
    } catch (erro) {
        document.getElementById('listaPets').innerHTML = '<p style="color: red;">Erro ao carregar a lista de animais.</p>';
    }
}

function renderizarPets(lista) {
    const divLista = document.getElementById('listaPets');
    divLista.innerHTML = '';
    
    if (lista.length === 0) {
        divLista.innerHTML = '<p>Nenhum animal encontrado.</p>';
        return;
    }
    
    lista.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        card.innerHTML = `
            <div>
                <strong style="font-size: 20px; color: #0056b3;">🐾 ${pet.nome}</strong><br>
                <span style="font-size: 15px; color: #555;">Espécie: ${pet.especie} | Raça: ${pet.raca}</span>
            </div>
            <button class="btn-historico" onclick="window.location.href='tutor-historico.html?id=${pet.id_animal}'">📋 Carteira de Vacinação</button>
        `;
        divLista.appendChild(card);
    });
}

document.getElementById('btnBuscarPet').addEventListener('click', () => {
    const termo = document.getElementById('termoBuscaPet').value.toLowerCase();
    const petsFiltrados = todosOsPets.filter(pet => 
        pet.nome.toLowerCase().includes(termo) || 
        pet.raca.toLowerCase().includes(termo)
    );
    renderizarPets(petsFiltrados);
});

window.addEventListener('DOMContentLoaded', async () => {
    await carregarAlertas();
    await carregarMeusPets();
});