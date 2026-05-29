const usuarioString = localStorage.getItem('usuarioImunoPet');
if (!usuarioString) {
    window.location.href = '../index.html';
}

const params = new URLSearchParams(window.location.search);
const idAnimalUrl = params.get('id');

if (!idAnimalUrl) {
    window.location.href = 'tutor-animais.html';
}

async function carregarDetalhesPet() {
    try {
        const resposta = await fetch(`http://localhost:3000/detalhes-animal/${idAnimalUrl}`);
        if (resposta.ok) {
            const dados = await resposta.json();
            document.getElementById('tituloPet').textContent = `Carteira de Vacinação: ${dados.nome_animal}`;
            document.getElementById('tituloPetImpresso').textContent = `Paciente: ${dados.nome_animal}`;
        }
    } catch (erro) {
    }
}

async function carregarHistoricoTutor() {
    const termo = document.getElementById('termoBuscaHistorico').value;
    const status = document.getElementById('filtroStatusHistorico').value;
    const contenedor = document.getElementById('conteudoHistorico');
    contenedor.innerHTML = '<p>Carregando histórico médico...</p>';
    
    try {
        const resposta = await fetch(`http://localhost:3000/historico-pet/${idAnimalUrl}?termo=${termo}&status=${status}`);
        const historico = await resposta.json();
        
        contenedor.innerHTML = '';
        
        if (historico.length === 0) {
            contenedor.innerHTML = '<p>Nenhum registro de vacina encontrado com esses critérios.</p>';
            return;
        }
        
        historico.forEach(reg => {
            const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            const corStatus = reg.status === 'APLICADA' ? 'green' : (reg.status === 'ATRASADA' ? 'red' : 'orange');
            
            const item = document.createElement('div');
            item.className = 'historico-item';
            item.innerHTML = `
                <div>
                    <strong style="font-size: 18px; color: #0056b3;">${reg.nome_vacina}</strong> - <span style="font-weight: bold; color: ${corStatus};">${reg.status}</span><br>
                    <span style="font-size: 14px; color: #333;">
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

function baixarCarteirinhaPDF() {
    const elemento = document.getElementById('area-carteira');
    const cabecalho = document.getElementById('cabecalhoImpresso');
    
    cabecalho.style.display = 'block';
    
    const opcoes = {
        margin:       15,
        filename:     'carteira_vacinacao_imunopet.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opcoes).from(elemento).save().then(() => {
        cabecalho.style.display = 'none';
    });
}

document.getElementById('btnBuscarHistorico').addEventListener('click', carregarHistoricoTutor);

window.addEventListener('DOMContentLoaded', async () => {
    await carregarDetalhesPet();
    await carregarHistoricoTutor();
});