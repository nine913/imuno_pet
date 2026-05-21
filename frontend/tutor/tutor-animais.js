const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
}

const usuario = JSON.parse(usuarioString);
let todosOsPets = [];

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

window.addEventListener('DOMContentLoaded', carregarMeusPets);