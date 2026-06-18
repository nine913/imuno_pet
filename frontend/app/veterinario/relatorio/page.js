"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VetRelatorio() {
  const [usuario, setUsuario] = useState(null);
  const [dadosRelatorio, setDadosRelatorio] = useState([]);
  const [especiesLista, setEspeciesLista] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [filtros, setFiltros] = useState({
    data_inicio: '',
    data_fim: '',
    status: '',
    especie: ''
  });

  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);
    carregarEspecies();
    gerarRelatorio(user.id_clinica, user.id_usuario); 
  }, [router]);

  const carregarEspecies = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/admin/especies');
      if (resposta.ok) {
        setEspeciesLista(await resposta.json());
      }
    } catch (erro) {
      console.error('Erro ao carregar espécies', erro);
    }
  };

  const gerarRelatorio = async (idClinicaOverride, idUserOverride) => {
    setCarregando(true);
    const idClinica = idClinicaOverride || (usuario ? usuario.id_clinica : null);
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');
    
    if (!idClinica) {
      setCarregando(false);
      return;
    }

    let url = `http://localhost:3000/relatorio-vacinas?id_clinica=${idClinica}&id_usuario_log=${userId}&`;
    if (filtros.data_inicio) url += `inicio=${filtros.data_inicio}&`;
    if (filtros.data_fim) url += `fim=${filtros.data_fim}&`;
    if (filtros.status) url += `status=${filtros.status}&`;
    if (filtros.especie) url += `especie=${filtros.especie}`;

    try {
      const resposta = await fetch(url);
      if (resposta.ok) {
        setDadosRelatorio(await resposta.json());
      } else {
        setDadosRelatorio([]);
      }
    } catch (erro) {
      console.error(erro);
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
      filename: 'relatorio_imunopet.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opcoes).from(elemento).save();
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <style>{`
        @media print {
          body { background-color: white; padding: 0; }
          .container { box-shadow: none; padding: 0; max-width: 100%; border: none; }
          .nao-imprimir { display: none !important; }
          table { font-size: 11px; border-collapse: collapse; width: 100%; color: black !important; }
          th, td { border: 1px solid black; padding: 4px; text-align: left; }
          th { background-color: #f2f2f2; color: black !important; }
          .total-box { border: 2px solid #28a745; color: black !important; background-color: white !important; }
          .total-box h2 { color: black !important; }
        }
      `}</style>
      
      <div className="container" style={styles.container}>
        <div className="nao-imprimir" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button style={{ ...styles.button, backgroundColor: '#6c757d' }} onClick={() => router.push('/dashboard')}>
            Voltar ao Painel
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={{ ...styles.button, backgroundColor: '#6c757d', fontWeight: 'bold' }} onClick={() => window.print()}>
              🖨️ Imprimir
            </button>
            <button style={{ ...styles.button, backgroundColor: '#17a2b8', fontWeight: 'bold' }} onClick={baixarPDF}>
              📄 Exportar PDF
            </button>
          </div>
        </div>
        
        <div id="area-relatorio">
          <h2 style={{ color: '#000000', marginTop: 0 }}>Relatório Clínico de Vacinação</h2>
          
          <div className="nao-imprimir" style={styles.filtrosBox} data-html2canvas-ignore="true">
            <div style={styles.filtroItem}>
              <label style={styles.label}>Data Inicial:</label>
              <input type="date" value={filtros.data_inicio} onChange={e => handleChangeFiltro('data_inicio', e.target.value)} style={styles.input} />
            </div>
            <div style={styles.filtroItem}>
              <label style={styles.label}>Data Final:</label>
              <input type="date" value={filtros.data_fim} onChange={e => handleChangeFiltro('data_fim', e.target.value)} style={styles.input} />
            </div>
            <div style={styles.filtroItem}>
              <label style={styles.label}>Status:</label>
              <select value={filtros.status} onChange={e => handleChangeFiltro('status', e.target.value)} style={styles.input}>
                <option value="">Todos</option>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ATRASADA">Atrasada</option>
              </select>
            </div>
            <div style={styles.filtroItem}>
              <label style={styles.label}>Espécie:</label>
              <select value={filtros.especie} onChange={e => handleChangeFiltro('especie', e.target.value)} style={styles.input}>
                <option value="">Todas</option>
                {especiesLista.map(e => (
                  <option key={e.id_especie} value={e.nome_especie}>{e.nome_especie}</option>
                ))}
              </select>
            </div>
            <button style={{ ...styles.button, backgroundColor: '#0056b3', height: '38px', marginBottom: '1px' }} onClick={() => gerarRelatorio()}>
              Gerar Relatório
            </button>
          </div>

          <div className="total-box" style={{ backgroundColor: '#28a745', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, color: 'white' }}>{dadosRelatorio.length} Registros Encontrados</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.tabela}>
              <thead>
                <tr>
                  <th style={styles.th}>Data (App/Venc)</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Vacina</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Espécie</th>
                  <th style={styles.th}>Porte / Fase</th>
                  <th style={styles.th}>Tutor</th>
                  <th style={styles.th}>Telefone</th>
                  <th style={styles.th}>Aplicante (CRMV)</th>
                </tr>
              </thead>
              <tbody>
                {carregando ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '10px', color: '#333' }}>Carregando dados...</td></tr>
                ) : dadosRelatorio.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '10px', color: '#333' }}>Nenhum registro encontrado.</td></tr>
                ) : (
                  dadosRelatorio.map((item, idx) => {
                    const dataBase = item.status === 'APLICADA' ? item.data_aplicacao : item.data_proxima_dose;
                    const dataExibicao = dataBase ? new Date(dataBase).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
                    const corStatus = item.status === 'APLICADA' ? 'green' : (item.status === 'ATRASADA' ? 'red' : 'orange');
                    const bgColor = idx % 2 === 0 ? '#fff' : '#f2f2f2';

                    return (
                      <tr key={idx} style={{ backgroundColor: bgColor, color: '#333' }}>
                        <td style={styles.td}>{dataExibicao}</td>
                        <td style={{ ...styles.td, color: corStatus, fontWeight: 'bold' }}>{item.status}</td>
                        <td style={styles.td}><strong>{item.nome_vacina}</strong></td>
                        <td style={styles.td}>{item.nome_animal} <br/><span style={{fontSize: '11px', color: '#666'}}>{item.raca}</span></td>
                        <td style={styles.td}>{item.especie}</td>
                        <td style={styles.td}>{item.porte} <br/><span style={{fontSize: '11px', color: '#666'}}>{item.fase_vida}</span></td>
                        <td style={styles.td}>{item.nome_tutor}</td>
                        <td style={styles.td}>{item.telefone}</td>
                        <td style={styles.td}>
                          {item.nome_vet ? (
                            <>
                              {item.nome_vet}<br/>
                              <span style={{ fontSize: '11px', color: '#555' }}>{item.crmv_vet}</span>
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
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '1200px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' },
  button: { padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  filtrosBox: { display: 'flex', gap: '15px', backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' },
  filtroItem: { flex: 1, minWidth: '150px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#333' },
  input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', width: '100%', color: '#333' },
  tabela: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '13px' },
  th: { border: '1px solid #ddd', padding: '10px', textAlign: 'left', backgroundColor: '#0056b3', color: 'white' },
  td: { border: '1px solid #ddd', padding: '10px', textAlign: 'left' }
};