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

async function carregarDetalhesPet() {
    try {
        const resposta = await fetch(`http://localhost:3000/detalhes-animal/${idAnimalUrl}`);
        if (resposta.ok) {
            const dados = await resposta.json();
            document.getElementById('tituloPet').textContent = `Histórico de Vacinas: ${dados.nome_animal}`;
        }
    } catch (erro) {
        console.error(erro);
    }
}

async function carregarHistorico(termo = '') {
    const contenedor = document.getElementById('conteudoHistorico');
    contenedor.innerHTML = '<p>Carregando histórico...</p>';

    try {
        const resposta = await fetch(`http://localhost:3000/historico-pet/${idAnimalUrl}?termo=${termo}`);
        const historico = await resposta.json();

        contenedor.innerHTML = '';

        if (historico.length === 0) {
            contenedor.innerHTML = '<p>Nenhuma vacina encontrada para este animal.</p>';
            return;
        }

        historico.forEach(reg => {
            const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            
            const item = document.createElement('div');
            item.className = 'historico-item';
            
            item.innerHTML = `
                <div>
                    <strong style="font-size: 18px; color: #0056b3;">${reg.nome_vacina}</strong> - <span style="font-weight: bold; color: ${reg.status === 'APLICADA' ? 'green' : 'orange'};">${reg.status}</span><br>
                    <span style="font-size: 14px; color: #555;">
                        <strong>Aplicação:</strong> ${dataApp} | <strong>Próxima dose:</strong> ${dataProx}<br>
                        <strong>Previne:</strong> ${reg.doencas_prevenidas}
                    </span>
                </div>
                <button onclick="abrirModalConfirmacaoRegistro(${reg.id_registro})" style="background-color: #dc3545; color: white; padding: 10px 15px; width: auto; margin: 0;">Excluir Registro</button>
            `;
            contenedor.appendChild(item);
        });
    } catch (erro) {
        contenedor.innerHTML = '<p style="color: red;">Erro ao carregar o histórico.</p>';
    }
}

document.getElementById('btnBuscarHistorico').addEventListener('click', () => {
    const termo = document.getElementById('termoBuscaHistorico').value;
    carregarHistorico(termo);
});

window.addEventListener('DOMContentLoaded', () => {
    carregarDetalhesPet();
    carregarHistorico();
});

let registroParaExcluir = null;

function abrirModalConfirmacaoRegistro(idRegistro) {
    registroParaExcluir = idRegistro;
    document.getElementById('modalConfirmacaoRegistro').style.display = 'flex';
}

function fecharModalConfirmacaoRegistro() {
    registroParaExcluir = null;
    document.getElementById('modalConfirmacaoRegistro').style.display = 'none';
}

document.getElementById('btnConfirmarExclusaoRegistro').addEventListener('click', async () => {
    if (!registroParaExcluir) return;

    try {
        const resposta = await fetch(`http://localhost:3000/deletar-registro-vacina/${registroParaExcluir}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            fecharModalConfirmacaoRegistro();
            const termo = document.getElementById('termoBuscaHistorico').value;
            carregarHistorico(termo);
        } else {
            alert('Erro ao excluir o registro.');
        }
    } catch (erro) {
        alert('Erro ao conectar com o servidor.');
    }
});