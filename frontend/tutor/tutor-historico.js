const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
}

const params = new URLSearchParams(window.location.search);
const idAnimalUrl = params.get('id');

if (!idAnimalUrl) {
    window.location.href = 'tutor-animais.html';
}

async function carregarHistoricoTutor(termo = '') {
    const contenedor = document.getElementById('conteudoHistorico');
    contenedor.innerHTML = '<p>Carregando histórico médico...</p>';
    
    try {
        const resposta = await fetch(`http://localhost:3000/historico-pet/${idAnimalUrl}?termo=${termo}`);
        const historico = await resposta.json();
        
        contenedor.innerHTML = '';
        
        if (historico.length === 0) {
            contenedor.innerHTML = '<p>Nenhum registro de vacina encontrado com esses critérios.</p>';
            return;
        }
        
        historico.forEach(reg => {
            const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            const corStatus = reg.status === 'APLICADA' ? 'green' : 'orange';
            
            const item = document.createElement('div');
            item.className = 'historico-item';
            item.innerHTML = `
                <div>
                    <strong style="font-size: 18px; color: #0056b3;">${reg.nome_vacina}</strong> - <span style="font-weight: bold; color: ${corStatus};">${reg.status}</span><br>
                    <span style="font-size: 14px; color: #555;">
                        <strong>Data de Aplicação:</strong> ${dataApp} | <strong>Próxima Dose:</strong> ${dataProx}<br>
                        <strong>Imunização contra:</strong> ${reg.doencas_prevenidas}
                    </span>
                </div>
            `;
            contenedor.appendChild(item);
        });
    } catch (erro) {
        contenedor.innerHTML = '<p style="color: red;">Erro ao carregar a carteira de vacinação.</p>';
    }
}

document.getElementById('btnBuscarHistorico').addEventListener('click', () => {
    const termo = document.getElementById('termoBuscaHistorico').value;
    carregarHistoricoTutor(termo);
});

window.addEventListener('DOMContentLoaded', () => carregarHistoricoTutor(''));