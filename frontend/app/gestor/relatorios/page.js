"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function GestorRelatorios() {
  const [usuario, setUsuario] = useState(null);
  const [dadosRelatorio, setDadosRelatorio] = useState([]);
  const [vacinasLista, setVacinasLista] = useState([]);
  const [vetsLista, setVetsLista] = useState([]);
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
    bairro: '',
    aplicante: ''
  });

  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil.toUpperCase() !== 'GESTOR' && user.perfil.toUpperCase() !== 'GESTOR_CLINICA') {
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

    carregarListasFiltros(user.id_clinica);
    gerarRelatorio(user.id_clinica, user.id_usuario);
  }, [router]);

  const carregarListasFiltros = async (idClinica) => {
    try {
      const resVac = await fetch('http://localhost:3000/vacinas');
      if (resVac.ok) {
        setVacinasLista(await resVac.json());
      } else {
        const resVacAdmin = await fetch('http://localhost:3000/admin/vacinas?termo=');
        if (resVacAdmin.ok) {
            setVacinasLista(await resVacAdmin.json());
        }
      }
      
      const resVet = await fetch(`http://localhost:3000/gestor/veterinarios-lista?id_clinica=${idClinica}&termo=`);
      if (resVet.ok) {
        setVetsLista(await resVet.json());
      }

      const resEsp = await fetch('http://localhost:3000/admin/especies');
      if (resEsp.ok) {
        setEspeciesLista(await resEsp.json());
      }

    } catch (erro) {}
  };

  const gerarRelatorio = async (idClinicaOverride, idUserOverride) => {
    setCarregando(true);
    const idClinica = idClinicaOverride || (usuario ? usuario.id_clinica : null);
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');

    if (!idClinica) {
        setCarregando(false);
        return;
    }

    let url = `http://localhost:3000/gestor/relatorios-avancados?id_clinica=${idClinica}&id_usuario_log=${userId}&`;
    if (filtros.data_inicio) url += `inicio=${filtros.data_inicio}&`;
    if (filtros.data_fim) url += `fim=${filtros.data_fim}&`;
    if (filtros.vacina) url += `vacina=${filtros.vacina}&`;
    if (filtros.especie) url += `especie=${filtros.especie}&`;
    if (filtros.bairro) url += `bairro=${filtros.bairro}&`;
    if (filtros.status) url += `status=${filtros.status}&`;
    if (filtros.aplicante) url += `aplicante=${filtros.aplicante}`;

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
      filename: 'relatorio_estrategico_gestor.pdf',
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
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

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
          <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Relatório de Vacinação e Atendimentos da Clínica</h2>
          
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
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: textSecundario }}>Veterinário:</label>
              <select value={filtros.aplicante} onChange={e => handleChangeFiltro('aplicante', e.target.value)} style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                <option value="">Todos</option>
                {vetsLista.map(v => (
                  <option key={v.id_veterinario} value={v.id_veterinario}>{v.nome_completo}</option>
                ))}
              </select>
            </div>
            <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#0056b3', fontWeight: 'bold', height: '42px', fontSize: 'inherit' }} onClick={() => gerarRelatorio()}>
              Gerar Relatório
            </button>
          </div>

          <div className="total-box" style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'white' }}>{dadosRelatorio.length} Registros Encontrados</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Data (App/Venc)</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Status</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Vacina</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Paciente</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Espécie</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Porte / Fase</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Tutor</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Telefone</th>
                  <th style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left', backgroundColor: isEscuro ? '#003366' : '#0056b3', color: 'white' }}>Aplicante (CRMV)</th>
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
                        <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.nome_animal} <br/><span style={{fontSize: '0.85em', color: textSecundario}}>{item.raca}</span></td>
                        <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.especie}</td>
                        <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.porte} <br/><span style={{fontSize: '0.85em', color: textSecundario}}>{item.fase_vida}</span></td>
                        <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.nome_tutor}</td>
                        <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>{item.telefone}</td>
                        <td style={{ border: `1px solid ${borderColor}`, padding: '10px', textAlign: 'left' }}>
                          {item.nome_vet ? (
                            <>
                              {item.nome_vet}<br/>
                              <span style={{ fontSize: '0.85em', color: textSecundario }}>{item.crmv_vet}</span>
                            </>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}