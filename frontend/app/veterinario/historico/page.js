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
  const dataHoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO' && user.perfil !== 'GESTOR_CLINICA' && user.perfil !== 'ADMINISTRADOR') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);
    carregarVacinas();
    buscarHistorico(user.id_usuario);
  }, [idAnimal, router]);

  const carregarVacinas = async () => {
    try {
      const res = await fetch('http://localhost:3000/vacinas');
      if (res.ok) setVacinasBase(await res.json());
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  const buscarHistorico = async (idUserOverride) => {
    if (!idAnimal) return;
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');
    try {
      const res = await fetch(`http://localhost:3000/historico-pet/${idAnimal}?termo=${termoBusca}&status=${statusFiltro}&id_usuario_log=${userId}`);
      if (res.ok) setHistorico(await res.json());
      else setHistorico([]);
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  const calcularProxima = (idVac, dataApp) => {
    if (!idVac || !dataApp) return '';
    const vacina = vacinasBase.find(v => String(v.id_vacina) === String(idVac));
    const intervalo = vacina ? parseInt(vacina.intervalo_doses_dias || vacina.intervalo_dose_dias || 0) : 0;
    if (intervalo > 0) {
      const partes = dataApp.split('-');
      const dataBaseObj = new Date(partes[0], partes[1] - 1, partes[2]);
      dataBaseObj.setDate(dataBaseObj.getDate() + intervalo);
      const ano = dataBaseObj.getFullYear();
      const mes = String(dataBaseObj.getMonth() + 1).padStart(2, '0');
      const dia = String(dataBaseObj.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
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

  const handleChangeStatus = (e) => {
    const novoStatus = e.target.value;
    setEditDados(prev => {
      const atualizado = { ...prev, status: novoStatus };
      if (novoStatus === 'PENDENTE' || novoStatus === 'ATRASADA') {
        atualizado.data_aplicacao = '';
      }
      return atualizado;
    });
  };

  const handleChangeVacina = (e) => {
    const novaVacina = e.target.value;
    setEditDados(prev => ({
      ...prev,
      id_vacina: novaVacina,
      data_proxima_dose: prev.status === 'APLICADA' ? calcularProxima(novaVacina, prev.data_aplicacao) : prev.data_proxima_dose
    }));
  };

  const handleChangeDataAplicacao = (e) => {
    const novaData = e.target.value;
    setEditDados(prev => ({
      ...prev,
      data_aplicacao: novaData,
      data_proxima_dose: calcularProxima(prev.id_vacina, novaData)
    }));
  };

  const submitEditar = async (e) => {
    e.preventDefault();

    if (editDados.status === 'PENDENTE' && editDados.data_proxima_dose < dataHoje) {
      setMsgEditar({ texto: 'A data do agendamento não pode estar no passado.', cor: 'red' });
      return;
    }

    if (editDados.status === 'APLICADA' && editDados.data_aplicacao > dataHoje) {
      setMsgEditar({ texto: 'A data de aplicação não pode estar no futuro.', cor: 'red' });
      return;
    }

    if (editDados.status === 'APLICADA' && editDados.data_aplicacao && editDados.data_proxima_dose && editDados.data_proxima_dose < editDados.data_aplicacao) {
      setMsgEditar({ texto: 'A data de vencimento não pode ser menor que a data de aplicação.', cor: 'red' });
      return;
    }

    try {
      const payload = {
        id_vacina: editDados.id_vacina,
        data_aplicacao: editDados.status === 'APLICADA' ? editDados.data_aplicacao : null,
        data_proxima_dose: editDados.data_proxima_dose || null,
        status: editDados.status,
        id_usuario_log: usuario.id_usuario
      };

      const res = await fetch(`http://localhost:3000/editar-registro-vacina/${editDados.id_registro}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsgEditar({ texto: 'Atualizado com sucesso!', cor: 'green' });
        setTimeout(() => { setModalEditar(false); buscarHistorico(); }, 1500);
      } else {
        setMsgEditar({ texto: 'Erro ao atualizar.', cor: 'red' });
      }
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  const confirmarExcluir = async () => {
    try {
      const res = await fetch(`http://localhost:3000/deletar-registro-vacina/${idExcluir}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) { setModalExcluir(false); buscarHistorico(); }
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/veterinario/buscar')}>Voltar para Busca</button>
        <h2 style={styles.h2}>Histórico de Vacinação do Paciente</h2>

        <div style={styles.filterBar}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" value={termoBusca} onChange={e => setTermoBusca(e.target.value)} placeholder="Buscar por nome da vacina..." style={{...styles.input, flex: 2, margin: 0}} />
            <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={{...styles.input, flex: 1, margin: 0}}>
              <option value="">Status da Vacina: Todos</option>
              <option value="APLICADA">Aplicada</option>
              <option value="PENDENTE">Pendente (Agendada)</option>
              <option value="ATRASADA">Atrasada</option>
            </select>
            <button style={{...styles.btnPesquisar, flex: 1}} onClick={() => buscarHistorico()}>Pesquisar</button>
          </div>
        </div>

        <div>
          {historico.length === 0 ? <p>Nenhum registro encontrado.</p> : historico.map(reg => (
            <div key={reg.id_registro} style={styles.card}>
              <div>
                <h3 style={styles.h3}>💉 {reg.nome_vacina}</h3>
                <p><strong>Status:</strong> <span style={{ color: reg.status === 'APLICADA' ? 'green' : reg.status === 'ATRASADA' ? 'red' : 'orange', fontWeight: 'bold' }}>{reg.status}</span></p>
                <p><strong>Aplicação:</strong> {reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'} | <strong>Próxima:</strong> {reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button style={{...styles.btnAcao, backgroundColor: '#ffc107', color: 'black'}} onClick={() => abrirEditar(reg)}>✏️ Editar</button>
                <button style={{...styles.btnAcao, backgroundColor: '#dc3545'}} onClick={() => { setIdExcluir(reg.id_registro); setModalExcluir(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalEditar && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.h3}>✏️ Editar Registro</h3>
            <form onSubmit={submitEditar}>
              <label style={styles.label}>Vacina:</label>
              <select value={editDados.id_vacina} onChange={handleChangeVacina} style={styles.input} required>
                <option value="">Selecione a vacina...</option>
                {vacinasBase.map(v => <option key={v.id_vacina} value={v.id_vacina}>{v.nome_vacina}</option>)}
              </select>

              <label style={styles.label}>Status:</label>
              <select value={editDados.status} onChange={handleChangeStatus} style={styles.input} required>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDENTE">Agendada (Pendente)</option>
                {editDados.status === 'ATRASADA' && <option value="ATRASADA">Atrasada (Automático)</option>}
              </select>

              <label style={styles.label}>Data de Aplicação:</label>
              <input
                type="date"
                value={editDados.data_aplicacao}
                onChange={handleChangeDataAplicacao}
                style={styles.input}
                disabled={editDados.status === 'PENDENTE' || editDados.status === 'ATRASADA'}
                required={editDados.status === 'APLICADA'}
                max={dataHoje}
              />

              <label style={styles.label}>Data da Próxima Dose / Vencimento:</label>
              <input
                type="date"
                value={editDados.data_proxima_dose}
                onChange={e => setEditDados({...editDados, data_proxima_dose: e.target.value})}
                style={styles.input}
                min={editDados.status === 'PENDENTE' ? dataHoje : (editDados.data_aplicacao || '')}
                required
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.btnAcao, backgroundColor: '#28a745', margin: 0, width: '100%' }}>Salvar Alterações</button>
                <button type="button" onClick={() => setModalEditar(false)} style={{...styles.btnVoltar, width: '100%', margin: 0}}>Cancelar</button>
              </div>
            </form>
            {msgEditar.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: msgEditar.cor }}>{msgEditar.texto}</div>}
          </div>
        </div>
      )}

      {modalExcluir && (
        <div style={styles.overlay}>
          <div style={styles.modalSmall}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p>Tem certeza que deseja excluir este registro de vacina do histórico?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={confirmarExcluir}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setModalExcluir(false)}>Cancelar</button>
            </div>
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
  h2: { color: '#0056b3', marginTop: 0 },
  h3: { color: '#0056b3', margin: '0 0 10px 0' },
  label: { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#333' },
  input: { width: '100%', padding: '10px', margin: '0 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  filterBar: { backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px' },
  btnPesquisar: { padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: 0 },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  btnAcao: { padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: '#e9ecef', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  modalSmall: { background: 'white', padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }
};