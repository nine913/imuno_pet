"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HistoricoConteudo() {
  const [usuario, setUsuario] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [vacinasBase, setVacinasBase] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  
  const [modalEditar, setModalEditar] = useState(false);
  const [editDados, setEditDados] = useState({ id_registro: '', id_vacina: '', status: 'APLICADA', data_aplicacao: '', data_proxima_dose: '' });
  const [msgEditar, setMsgEditar] = useState({ texto: '', cor: '' });

  const [modalExcluir, setModalExcluir] = useState(false);
  const [idExcluir, setIdExcluir] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const idAnimal = searchParams.get('id');

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
    carregarVacinas();
    buscarHistorico();
  }, [idAnimal, router]);

  const carregarVacinas = async () => {
    try {
      const res = await fetch('http://localhost:3000/vacinas');
      if (res.ok) setVacinasBase(await res.json());
    } catch (e) { console.error(e); }
  };

  const buscarHistorico = async () => {
    if (!idAnimal) return;
    try {
      const res = await fetch(`http://localhost:3000/historico-pet/${idAnimal}?termo=${termoBusca}&status=${statusFiltro}`);
      if (res.ok) setHistorico(await res.json());
      else setHistorico([]);
    } catch (e) { console.error(e); }
  };

  const calcularProxima = (idVac, dataApp) => {
    if (!idVac || !dataApp) return '';
    const vacina = vacinasBase.find(v => String(v.id_vacina) === String(idVac));
    const intervalo = vacina ? parseInt(vacina.intervalo_doses_dias || vacina.intervalo_dose_dias || 0) : 0;
    if (intervalo > 0) {
      const data = new Date(dataApp);
      data.setDate(data.getDate() + intervalo);
      return data.toISOString().split('T')[0];
    }
    return '';
  };

  const abrirEditar = (reg) => {
    setEditDados({
      id_registro: reg.id_registro,
      id_vacina: reg.id_vacina,
      status: reg.status,
      data_aplicacao: reg.data_aplicacao ? reg.data_aplicacao.split('T')[0] : '',
      data_proxima_dose: reg.data_proxima_dose ? reg.data_proxima_dose.split('T')[0] : ''
    });
    setMsgEditar({ texto: '', cor: '' });
    setModalEditar(true);
  };

  const submitEditar = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/editar-registro-vacina/${editDados.id_registro}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editDados, id_usuario: usuario.id_usuario })
      });
      if (res.ok) {
        setMsgEditar({ texto: 'Atualizado com sucesso!', cor: 'green' });
        setTimeout(() => { setModalEditar(false); buscarHistorico(); }, 1500);
      } else {
        setMsgEditar({ texto: 'Erro ao atualizar.', cor: 'red' });
      }
    } catch (e) { setMsgEditar({ texto: 'Erro de conexão.', cor: 'red' }); }
  };

  const confirmarExcluir = async () => {
    try {
      const res = await fetch(`http://localhost:3000/deletar-registro-vacina/${idExcluir}`, { method: 'DELETE' });
      if (res.ok) { setModalExcluir(false); buscarHistorico(); }
    } catch (e) { console.error(e); }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/veterinario/buscar')}>Voltar para Busca</button>
        <h2>Histórico de Vacinação do Paciente</h2>
        
        <div style={styles.filterBar}>
          <input type="text" value={termoBusca} onChange={e => setTermoBusca(e.target.value)} placeholder="Buscar por nome da vacina..." style={styles.input} />
          <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={styles.input}>
            <option value="">Status da Vacina: Todos</option>
            <option value="APLICADA">Aplicada</option>
            <option value="PENDENTE">Pendente (Agendada)</option>
            <option value="ATRASADA">Atrasada</option>
          </select>
          <button style={styles.btnPesquisar} onClick={buscarHistorico}>Pesquisar</button>
        </div>

        <div>
          {historico.map(reg => (
            <div key={reg.id_registro} style={styles.card}>
              <div>
                <h3>💉 {reg.nome_vacina}</h3>
                <p><strong>Status:</strong> <span style={{ color: reg.status === 'APLICADA' ? 'green' : 'red', fontWeight: 'bold' }}>{reg.status}</span></p>
                <p><strong>Aplicação:</strong> {reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString() : '-'} | <strong>Próxima:</strong> {reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString() : '-'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button style={{...styles.btnAcao, backgroundColor: '#ffc107'}} onClick={() => abrirEditar(reg)}>✏️ Editar</button>
                <button style={{...styles.btnAcao, backgroundColor: '#dc3545'}} onClick={() => { setIdExcluir(reg.id_registro); setModalExcluir(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalEditar && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>✏️ Editar Registro</h3>
            <form onSubmit={submitEditar}>
              <select value={editDados.id_vacina} onChange={e => setEditDados({...editDados, id_vacina: e.target.value})} style={styles.input}>
                {vacinasBase.map(v => <option key={v.id_vacina} value={v.id_vacina}>{v.nome_vacina}</option>)}
              </select>
              <select value={editDados.status} onChange={e => setEditDados({...editDados, status: e.target.value})} style={styles.input}>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDENTE">Pendente</option>
              </select>
              <input type="date" value={editDados.data_aplicacao} onChange={e => {
                const novaApp = e.target.value;
                setEditDados({...editDados, data_aplicacao: novaApp, data_proxima_dose: calcularProxima(editDados.id_vacina, novaApp)});
              }} style={styles.input} />
              <input type="date" value={editDados.data_proxima_dose} onChange={e => setEditDados({...editDados, data_proxima_dose: e.target.value})} style={styles.input} />
              <button type="submit" style={styles.btnAcao}>Salvar Alterações</button>
              <button type="button" onClick={() => setModalEditar(false)} style={{...styles.btnVoltar, width: '100%'}}>Cancelar</button>
            </form>
            {msgEditar.texto && <p style={{color: msgEditar.cor, textAlign: 'center'}}>{msgEditar.texto}</p>}
          </div>
        </div>
      )}

      {modalExcluir && (
        <div style={styles.overlay}>
          <div style={styles.modalSmall}>
            <h3>Atenção!</h3>
            <p>Deseja excluir este registro?</p>
            <button style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', width: '100%'}} onClick={confirmarExclusao}>Sim, Excluir</button>
            <button style={{backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', width: '100%', marginTop: '10px'}} onClick={() => setModalExcluir(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Historico() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <HistoricoConteudo />
    </Suspense>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '800px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  filterBar: { display: 'flex', gap: '10px', flexDirection: 'column', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px' },
  btnPesquisar: { padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  btnAcao: { padding: '10px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '5px' },
  card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: 'white', padding: '20px', borderRadius: '8px', width: '400px' },
  modalSmall: { background: 'white', padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center' }
};