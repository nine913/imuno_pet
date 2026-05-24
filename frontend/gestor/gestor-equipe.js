async function listarVets() {
    const termo = document.getElementById('termoVet').value;
    const res = await fetch(`http://localhost:3000/gestor/veterinarios?termo=${termo}`);
    const dados = await res.json();
    const lista = document.getElementById('listaVets');
    lista.innerHTML = dados.map(v => `
        <div class="resultado-card">
            ${v.nome_completo} - CRMV: ${v.crmv}
            <button onclick="deletarVet(${v.id_veterinario})">Excluir</button>
        </div>
    `).join('');
}

async function cadastrarVet() {
    const nome = document.getElementById('novoNome').value;
    const crmv = document.getElementById('novoCrmv').value;
    await fetch('http://localhost:3000/gestor/cadastrar-vet', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ nome_completo: nome, crmv: crmv, id_clinica: 1 })
    });
    listarVets();
}

async function deletarVet(id) {
    await fetch(`http://localhost:3000/gestor/deletar-vet/${id}`, { method: 'DELETE' });
    listarVets();
}

document.getElementById('termoVet').addEventListener('input', listarVets);
window.onload = listarVets;