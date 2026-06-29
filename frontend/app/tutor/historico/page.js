"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

function HistoricoConteudo() {
  const [usuario, setUsuario] = useState(null);
  const [nomeAnimal, setNomeAnimal] = useState('Carregando...');
  const [historico, setHistorico] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);
  
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

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
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

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor }}>
        <style>{`
          @media print {
            body { background-color: white !important; padding: 0; color: black !important; }
            .container { box-shadow: none; padding: 0; max-width: 100%; border: none; }
            .nao-imprimir { display: none !important; }
            .cabecalho-carteira { display: block !important; }
            * { color: black !important; }
          }
        `}</style>

        <div className="nao-imprimir" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 'inherit', backgroundColor: '#6c757d', fontWeight: 'bold' }} onClick={() => router.push('/tutor/animais')}>
            Voltar aos Meus Pets
          </button>
          <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 'inherit', backgroundColor: '#17a2b8', fontWeight: 'bold' }} onClick={baixarCarteirinhaPDF}>
            📄 Baixar Carteira Digital
          </button>
        </div>
        
        <div id="area-carteira" style={{ padding: '30px', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: bgCard }}>
          <div className="cabecalho-carteira" id="cabecalhoImpresso" style={{ display: 'none', textAlign: 'center', borderBottom: '2px solid #0056b3', paddingBottom: '15px', marginBottom: '20px' }}>
            <h1 style={{ color: '#0056b3', margin: 0 }}>ImunoPet Brasil</h1>
            <h2 id="tituloPetImpresso">Paciente: {nomeAnimal}</h2>
          </div>

          <h2 className="nao-imprimir" style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Carteira de Vacinação: {nomeAnimal}</h2>
          
          <div className="nao-imprimir" style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }} data-html2canvas-ignore="true">
            <input 
              type="text" 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Pesquisar por nome da vacina..." 
              style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit', flex: 2, minWidth: '200px' }} 
            />
            <select 
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit', flex: 1, minWidth: '150px' }}
            >
              <option value="">Todos os Status</option>
              <option value="APLICADA">Aplicada</option>
              <option value="PENDENTE">Pendente</option>
              <option value="ATRASADA">Atrasada</option>
            </select>
            <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 'inherit', backgroundColor: '#0056b3', fontWeight: 'bold', height: 'auto' }} onClick={handleBuscar}>
              Pesquisar
            </button>
          </div>

          <div id="conteudoHistorico">
            {carregando ? (
              <p style={{ color: textSecundario }}>Carregando histórico médico...</p>
            ) : erro ? (
              <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{erro}</p>
            ) : historico.length === 0 ? (
              <p style={{ color: textSecundario }}>Nenhum registro de vacina encontrado com esses critérios.</p>
            ) : (
              historico.map(reg => {
                const dataApp = reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
                const dataProx = reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
                const corStatus = reg.status === 'APLICADA' ? '#28a745' : (reg.status === 'ATRASADA' ? '#dc3545' : '#fd7e14');

                return (
                  <div key={reg.id_registro} style={{ borderBottom: `1px solid ${borderColor}`, padding: '15px 0' }}>
                    <div>
                      <strong style={{ fontSize: '1.1em', color: headerColor }}>{reg.nome_vacina}</strong> - <span style={{ fontWeight: 'bold', color: corStatus }}>{reg.status}</span><br />
                      <span style={{ fontSize: '0.9em', color: textSecundario, display: 'inline-block', marginTop: '5px' }}>
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
    </LayoutPainel>
  );
}

export default function HistoricoVacinacao() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>Carregando dados da carteira...</div>}>
      <HistoricoConteudo />
    </Suspense>
  );
}