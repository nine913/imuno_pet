"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HistoricoConteudo() {
  const [usuario, setUsuario] = useState(null);
  const [nomeAnimal, setNomeAnimal] = useState('Carregando...');
  const [historico, setHistorico] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const idAnimalUrl = searchParams.get('id');

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    setUsuario(user);

    if (!idAnimalUrl) {
      router.push('/tutor/animais');
      return;
    }

    carregarDetalhesPet(user.id_usuario);
    carregarHistoricoTutor(user.id_usuario, '', '');
  }, [idAnimalUrl, router]);

  const carregarDetalhesPet = async (userId) => {
    const id = userId || usuario?.id_usuario;
    try {
      const resposta = await fetch(`http://localhost:3000/detalhes-animal/${idAnimalUrl}?id_usuario_log=${id}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setNomeAnimal(dados.nome_animal);
      }
    } catch (erro) {}
  };

  const carregarHistoricoTutor = async (idUserOverride, termo = termoBusca, status = statusFiltro) => {
    setCarregando(true);
    setErro('');
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');
    try {
      const resposta = await fetch(`http://localhost:3000/historico-pet/${idAnimalUrl}?termo=${termo}&status=${status}&id_usuario_log=${userId}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setHistorico(dados);
      } else {
        setErro('Nenhum registro de vacina encontrado com esses critérios.');
      }
    } catch (erro) {
      setErro('Erro ao carregar a carteira de vacinação.');
    } finally {
      setCarregando(false);
    }
  };

  const handleBuscar = () => {
    carregarHistoricoTutor(usuario.id_usuario, termoBusca, statusFiltro);
  };

  const baixarCarteirinhaPDF = async () => {
    const elemento = document.getElementById('area-carteira');
    const cabecalho = document.getElementById('cabecalhoImpresso');
    
    cabecalho.style.display = 'block';
    
    const opcoes = {
      margin: 15,
      filename: `carteira_${nomeAnimal}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const html2pdf = (await import('html2pdf.js')).default;

    html2pdf().set(opcoes).from(elemento).save().then(() => {
      cabecalho.style.display = 'none';
    });
  };

  if (!usuario) return <h2 style={{ padding: '20px' }}>Carregando...</h2>;

  return (
    <div style={styles.body}>
      <style>{`
        @media print {
          body { background-color: white; padding: 0; }
          .container { box-shadow: none; padding: 0; max-width: 100%; border: none; }
          .nao-imprimir { display: none !important; }
          .cabecalho-carteira { display: block !important; }
        }
      `}</style>

      <div className="container" style={styles.container}>
        <div className="nao-imprimir" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button style={{ ...styles.button, ...styles.btnVoltar }} onClick={() => router.push('/tutor/animais')}>
            Voltar aos Meus Pets
          </button>
          <button style={{ ...styles.button, ...styles.btnPdf }} onClick={baixarCarteirinhaPDF}>
            📄 Baixar Carteira Digital
          </button>
        </div>
        
        <div id="area-carteira">
          <div className="cabecalho-carteira" id="cabecalhoImpresso" style={{ display: 'none', textAlign: 'center', borderBottom: '2px solid #0056b3', paddingBottom: '15px', marginBottom: '20px' }}>
            <h1 style={{ color: '#0056b3', margin: 0 }}>ImunoPet Brasil</h1>
            <h2 id="tituloPetImpresso">Paciente: {nomeAnimal}</h2>
          </div>

          <h2 className="nao-imprimir" style={styles.h2}>Carteira de Vacinação: {nomeAnimal}</h2>
          
          <div className="nao-imprimir" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }} data-html2canvas-ignore="true">
            <input 
              type="text" 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Pesquisar por nome da vacina..." 
              style={{ ...styles.input, flex: 2, minWidth: '200px' }} 
            />
            <select 
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={{ ...styles.input, flex: 1, minWidth: '150px' }}
            >
              <option value="">Todos os Status</option>
              <option value="APLICADA">Aplicada</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATRASADA">Atrasada</option>
            </select>
            <button style={{ ...styles.button, ...styles.btnPrimario, marginTop: '10px', height: '40px' }} onClick={handleBuscar}>
              Pesquisar
            </button>
          </div>

          <div id="conteudoHistorico">
            {carregando ? (
              <p>Carregando histórico médico...</p>
            ) : erro ? (
              <p style={{ color: 'red' }}>{erro}</p>
            ) : historico.length === 0 ? (
              <p>Nenhum registro de vacina encontrado com esses critérios.</p>
            ) : (
              historico.map(reg => {
                const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
                const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
                const corStatus = reg.status === 'APLICADA' ? 'green' : (reg.status === 'ATRASADA' ? 'red' : 'orange');

                return (
                  <div key={reg.id_registro} style={styles.historicoItem}>
                    <div>
                      <strong style={{ fontSize: '18px', color: '#0056b3' }}>{reg.nome_vacina}</strong> - <span style={{ fontWeight: 'bold', color: corStatus }}>{reg.status}</span><br />
                      <span style={{ fontSize: '14px', color: '#333' }}>
                        <strong>Data de Aplicação:</strong> {dataApp} | <strong>Próxima Dose:</strong> {dataProx}<br />
                        <strong>Imunização contra:</strong> {reg.doencas_prevenidas}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoricoVacinacao() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', fontFamily: 'Arial' }}>Carregando dados da carteira...</div>}>
      <HistoricoConteudo />
    </Suspense>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '800px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#0056b3', marginTop: 0 },
  input: { padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  button: { padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  btnPrimario: { backgroundColor: '#0056b3' },
  btnVoltar: { backgroundColor: '#6c757d', margin: 0 },
  btnPdf: { backgroundColor: '#17a2b8', fontWeight: 'bold', margin: 0 },
  historicoItem: { borderBottom: '1px solid #eee', padding: '15px 0' }
};