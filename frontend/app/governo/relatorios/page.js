"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function GovernoRelatorios() {
  const [usuario, setUsuario] = useState(null);
  const [dadosRelatorio, setDadosRelatorio] = useState([]);
  const [vacinasLista, setVacinasLista] = useState([]);
  const [especiesLista, setEspeciesLista] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    status: '',
    vacina: '',
    especie: '',
    bairro: ''
  });

  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil.toUpperCase() !== 'GOVERNO') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }

    carregarFiltrosAPI();
    gerarRelatorio(user.id_usuario);
  }, [router]);

  const carregarFiltrosAPI = async () => {
    try {
      const respostaVac = await fetch('http://localhost:3000/vacinas');
      if (respostaVac.ok) {
        setVacinasLista(await respostaVac.json());
      }
      
      const respostaEsp = await fetch('http://localhost:3000/admin/especies');
      if (respostaEsp.ok) {
        setEspeciesLista(await respostaEsp.json());
      }
    } catch (erro) {}
  };

  const gerarRelatorio = async (idUserOverride) => {
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');
    setCarregando(true);
    let url = `http://localhost:3000/governo/relatorios-avancados?id_usuario_log=${userId}&`;
    if (filtros.data_inicio) url += `inicio=${filtros.data_inicio}&`;
    if (filtros.data_fim) url += `fim=${filtros.data_fim}&`;
    if (filtros.vacina) url += `vacina=${filtros.vacina}&`;
    if (filtros.especie) url += `especie=${filtros.especie}&`;
    if (filtros.bairro) url += `bairro=${filtros.bairro}&`;
    if (filtros.status) url += `status=${filtros.status}`;

    try {
      const resposta = await fetch(url);
      if (resposta.ok) {
        setDadosRelatorio(await resposta.json());
      } else {
        setDadosRelatorio([]);
      }
    } catch (erro) {
      setDadosRelatorio([]);
    } finally {
      setCarregando(false);
    }
  };

  const handleChangeFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const baixarPDF = async () => {
    const elemento = document.getElementById('area-relatorio');
    const opcoes = {
      margin: 10,
      filename: 'relatorio_governamental_imunopet.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opcoes).from(elemento).save();
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#ffb3b8' : '#fd7e14');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor }}>
        <style>{`
          @media print {
            body { background-color: white !important; padding: 0; color: black !important; }
            .container { box-shadow: none; padding: 0; max-width: 100%; border: none; }
            .nao-imprimir { display: none !important; }
            table { font-size: 11px; border-collapse: collapse; width: 100%; color: black !important; }
            th, td { border: 1px solid black !important; padding: 4px; text-align: left; }
            th { background-color: #f2f2f2 !important; color: black !important; }
            td { background-color: white !important; color: black !important; }
            .total-box { border: 2px solid #28a745; color: black !important; background-color: white !important; }
            .total-box h2 { color: black !important; }
            * { color: black !important; }
          }
        `}</style>

        <div className="nao-imprimir" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '10px' }}>
          <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#6c757d', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
          <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#17a2b8', fontWeight: 'bold', fontSize: 'inherit' }} onClick={baixarPDF}>
            📄 Exportar PDF
          </button>
        </div>
        
        <div id="area-relatorio" style={{ backgroundColor: bgCard, padding: '30px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
          <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Relatório Governamental de Vacinação Animal</h2>
          
          <div className="nao-imprimir" style={{ display: 'flex', gap: '15px', backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap', border: `1px solid ${borderColor}` }} data-html2canvas-ignore="true">
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: textSecundario }}>Data Início:</label>
              <input type="date" value={filtros.data_inicio} onChange={e => handleChangeFiltro('data_inicio', e.target.value)} style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: textSecundario }}>Data Fim:</label>
              <input type="date" value={filtros.data_fim} onChange={e => handleChangeFiltro('data_fim', e.target.value)} style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: textSecundario }}>Status:</label>
              <select value={filtros.status} onChange={e => handleChangeFiltro('status', e.target.value)} style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                <option value="">Todos</option>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ATRASADA">Atrasada</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: textSecundario }}>Vacina:</label>
              <select value={filtros.vacina} onChange={e => handleChangeFiltro('vacina', e.target.value)} style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                <option value="">Todas</option>
                {vacinasLista.map(v => (
                  <option key={v.id_vacina} value={v.id_vacina}>{v.nome_vacina}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: textSecundario }}>Espécie:</label>
              <select value={filtros.especie} onChange={e => handleChangeFiltro('especie', e.target.value)} style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                <option value="">Todas</option>
                {especiesLista.map(e => (
                  <option key={e.id_especie} value={e.nome_especie}>{e.nome_especie}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: textSecundario }}>Localidade (Bairro):</label>
              <input type="text" value={filtros.bairro} onChange={e => handleChangeFiltro('bairro', e.target.value)} placeholder="Ex: Centro" style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
            </div>
            <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#0056b3', fontWeight: 'bold', height: '42px', fontSize: 'inherit' }} onClick={() => gerarRelatorio()}>
              Gerar Relatório
            </button>
          </div>

          <div className="total-box" style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'white' }}>{dadosRelatorio.length} Registros Encontrados</h2>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Data (App/Venc)</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Status</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Vacina</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Paciente</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Espécie</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Raça</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Tutor</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Telefone</th>
                <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#b34700' : '#fd7e14', color: 'white' }}>Localidade</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '15px', color: textSecundario, border: `1px solid ${borderColor}` }}>Carregando dados...</td></tr>
              ) : dadosRelatorio.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '15px', color: textSecundario, border: `1px solid ${borderColor}` }}>Nenhum registro encontrado com esses filtros.</td></tr>
              ) : (
                dadosRelatorio.map((item, idx) => {
                  const dataBase = item.status === 'APLICADA' ? item.data_aplicacao : item.data_proxima_dose;
                  const dataExibicao = dataBase ? new Date(dataBase).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
                  const corStatus = item.status === 'APLICADA' ? '#28a745' : (item.status === 'ATRASADA' ? '#dc3545' : '#fd7e14');
                  const bgColor = idx % 2 === 0 ? (isEscuro ? '#1e1e1e' : '#ffffff') : (isEscuro ? '#2d2d2d' : '#f2f2f2');

                  return (
                    <tr key={idx} style={{ backgroundColor: bgColor, color: textColor }}>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{dataExibicao}</td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', color: corStatus, fontWeight: 'bold' }}>{item.status}</td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}><strong>{item.nome_vacina}</strong></td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.nome_animal}</td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.especie}</td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.raca}</td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.nome_tutor}</td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.telefone}</td>
                      <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.bairro}, {item.cidade}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutPainel>
  );
}