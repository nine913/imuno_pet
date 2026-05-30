"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VetVacinas() {
  const [usuario, setUsuario] = useState(null);
  const [vacinas, setVacinas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');

  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editDados, setEditDados] = useState({
    id_vacina: '', nome_vacina: '', doencas_prevenidas: '', fabricante: '', tipo_dose: '', intervalo_doses_dias: ''
  });
  const [mensagemEditar, setMensagemEditar] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [vacinaParaExcluir, setVacinaParaExcluir] = useState(null);

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
    realizarBusca('');
  }, [router]);

  const realizarBusca = async (termo = termoBusca) => {
    try {
      const url = `http://localhost:3000/vacinas?termo=${encodeURIComponent(termo)}`;
      const resposta = await fetch(url);
      if (resposta.ok) {
        setVacinas(await resposta.json());
      } else {
        setVacinas([]);
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  const abrirModalEditar = (vacina) => {
    const valorIntervalo = vacina.intervalo_doses_dias || vacina.intervalo_doses_dias || 0;
    setEditDados({
      id_vacina: vacina.id_vacina,
      nome_vacina: vacina.nome_vacina,
      doencas_prevenidas: vacina.doencas_prevenidas,
      fabricante: vacina.fabricante || '',
      tipo_dose: valorIntervalo > 0 ? 'intervalo' : 'unica',
      intervalo_doses_dias: valorIntervalo > 0 ? valorIntervalo : ''
    });
    setMensagemEditar({ texto: '', cor: '' });
    setModalEditarOpen(true);
  };

  const handleTipoDoseChange = (e) => {
    const value = e.target.value;
    setEditDados({
      ...editDados,
      tipo_dose: value,
      intervalo_doses_dias: value === 'intervalo' ? editDados.intervalo_doses_dias : ''
    });
  };

  const handleIntervaloChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setEditDados({ ...editDados, intervalo_doses_dias: v });
  };

  const submitEditar = async (e) => {
    e.preventDefault();
    const payload = {
      nome_vacina: editDados.nome_vacina,
      doencas_prevenidas: editDados.doencas_prevenidas,
      fabricante: editDados.fabricante,
      intervalo_doses_dias: editDados.tipo_dose === 'intervalo' ? editDados.intervalo_doses_dias : 0
    };

    try {
      const resposta = await fetch(`http://localhost:3000/editar-vacina/${editDados.id_vacina}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setMensagemEditar({ texto: dados.mensagem || 'Salvo com sucesso!', cor: 'green' });
        setTimeout(() => {
          setModalEditarOpen(false);
          realizarBusca();
        }, 1500);
      } else {
        setMensagemEditar({ texto: dados.erro, cor: 'red' });
      }
    } catch (erro) {
      setMensagemEditar({ texto: 'Erro ao salvar alterações.', cor: 'red' });
    }
  };

  const confirmarExclusao = async () => {
    if (!vacinaParaExcluir) return;
    try {
      const resposta = await fetch(`http://localhost:3000/deletar-vacina/${vacinaParaExcluir}`, {
        method: 'DELETE'
      });
      if (resposta.ok) {
        setModalExclusaoOpen(false);
        realizarBusca();
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Painel</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#0056b3' }}>Consultar Vacinas</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => router.push('/veterinario/cadastrar-vacina')}>
            + Cadastrar Nova Vacina
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="text" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && realizarBusca()} placeholder="Pesquisar por nome, doenças ou fabricante..." style={styles.input} />
          <button style={styles.btnBuscar} onClick={() => realizarBusca()}>Pesquisar</button>
        </div>

        <div>
          {vacinas.length === 0 ? <p>Nenhuma vacina encontrada.</p> : vacinas.map(v => {
            const valorIntervalo = v.intervalo_doses_dias || v.intervalo_doses_dias || 0;
            const textoIntervalo = valorIntervalo > 0 ? `${valorIntervalo} dias` : 'Dose Única';
            
            return (
              <div key={v.id_vacina} style={styles.card}>
                <div style={{ flex: 1 }}>
                  <strong>{v.nome_vacina}</strong><br/>
                  <span style={{ fontSize: '14px', color: '#333' }}>
                    <strong>Previne:</strong> {v.doencas_prevenidas}<br/>
                    <strong>Fabricante:</strong> {v.fabricante} | <strong>Intervalo:</strong> {textoIntervalo}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                  <button style={{ ...styles.btnAcao, backgroundColor: '#ffc107', color: '#333' }} onClick={() => abrirModalEditar(v)}>Editar Vacina</button>
                  <button style={{ ...styles.btnAcao, backgroundColor: '#dc3545' }} onClick={() => { setVacinaParaExcluir(v.id_vacina); setModalExclusaoOpen(true); }}>Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalEditarOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#0056b3', marginTop: 0 }}>Editar Vacina</h3>
            <form onSubmit={submitEditar}>
              <input type="text" value={editDados.nome_vacina} onChange={e => setEditDados({...editDados, nome_vacina: e.target.value})} placeholder="Nome da Vacina" required style={styles.input} />
              <textarea value={editDados.doencas_prevenidas} onChange={e => setEditDados({...editDados, doencas_prevenidas: e.target.value})} placeholder="Doenças Prevenidas" rows="3" required style={styles.input} />
              <input type="text" value={editDados.fabricante} onChange={e => setEditDados({...editDados, fabricante: e.target.value})} placeholder="Fabricante" style={styles.input} />
              
              <select value={editDados.tipo_dose} onChange={handleTipoDoseChange} required style={styles.input}>
                <option value="unica">Dose Única</option>
                <option value="intervalo">Múltiplas Doses (Com Intervalo)</option>
              </select>

              {editDados.tipo_dose === 'intervalo' && (
                <input type="number" value={editDados.intervalo_doses_dias} onChange={handleIntervaloChange} placeholder="Intervalo entre doses (em dias)" min="0" required style={styles.input} />
              )}
              
              <button type="submit" style={{ ...styles.btnAcao, backgroundColor: '#28a745', marginTop: '10px' }}>Salvar Alterações</button>
              <button type="button" onClick={() => setModalEditarOpen(false)} style={{ ...styles.btnVoltar, width: '100%', margin: '10px 0 0 0' }}>Cancelar</button>
            </form>
            {mensagemEditar.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemEditar.cor }}>{mensagemEditar.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p>Deseja excluir esta vacina? Isso apagará este registro de todos os animais vacinados com ela.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '800px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', width: '100%' },
  btnBuscar: { padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', margin: '10px 0' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' },
  btnAcao: { padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', width: '100%' },
  card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { background: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  modalContentSmall: { background: 'white', padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }
};