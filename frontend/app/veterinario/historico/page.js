"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

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

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

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

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }

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
        <button style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => router.push('/veterinario/buscar')}>Voltar para Busca</button>
        <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Histórico de Vacinação do Paciente</h2>

        <div style={{ backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" value={termoBusca} onChange={e => setTermoBusca(e.target.value)} placeholder="Buscar por nome da vacina..." style={{ flex: 2, minWidth: '200px', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, fontSize: 'inherit' }} />
            <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, fontSize: 'inherit' }}>
              <option value="">Status da Vacina: Todos</option>
              <option value="APLICADA">Aplicada</option>
              <option value="PENDENTE">Pendente (Agendada)</option>
              <option value="ATRASADA">Atrasada</option>
            </select>
            <button style={{ flex: 1, minWidth: '120px', padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: 0, fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => buscarHistorico()}>Pesquisar</button>
          </div>
        </div>

        <div>
          {historico.length === 0 ? <p style={{ color: textSecundario }}>Nenhum registro encontrado.</p> : historico.map(reg => (
            <div key={reg.id_registro} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginBottom: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ color: headerColor, margin: '0 0 10px 0' }}>💉 {reg.nome_vacina}</h3>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Status:</strong> <span style={{ color: reg.status === 'APLICADA' ? '#28a745' : reg.status === 'ATRASADA' ? '#dc3545' : '#fd7e14', fontWeight: 'bold' }}>{reg.status}</span></p>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Aplicação:</strong> {reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'} | <strong>Próxima:</strong> {reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '150px' }}>
                <button style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => abrirEditar(reg)}>✏️ Editar</button>
                <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => { setIdExcluir(reg.id_registro); setModalExcluir(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalEditar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>✏️ Editar Registro</h3>
            <form onSubmit={submitEditar}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Vacina:</label>
              <select value={editDados.id_vacina} onChange={handleChangeVacina} style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} required>
                <option value="">Selecione a vacina...</option>
                {vacinasBase.map(v => <option key={v.id_vacina} value={v.id_vacina}>{v.nome_vacina}</option>)}
              </select>

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Status:</label>
              <select value={editDados.status} onChange={handleChangeStatus} style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} required>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDENTE">Agendada (Pendente)</option>
                {editDados.status === 'ATRASADA' && <option value="ATRASADA">Atrasada (Automático)</option>}
              </select>

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Data de Aplicação:</label>
              <input
                type="date"
                value={editDados.data_aplicacao}
                onChange={handleChangeDataAplicacao}
                style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}
                disabled={editDados.status === 'PENDENTE' || editDados.status === 'ATRASADA'}
                required={editDados.status === 'APLICADA'}
                max={dataHoje}
              />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Data da Próxima Dose / Vencimento:</label>
              <input
                type="date"
                value={editDados.data_proxima_dose}
                onChange={e => setEditDados({...editDados, data_proxima_dose: e.target.value})}
                style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}
                min={editDados.status === 'PENDENTE' ? dataHoje : (editDados.data_aplicacao || '')}
                required
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, margin: 0, fontWeight: 'bold', fontSize: 'inherit' }}>Salvar Alterações</button>
                <button type="button" onClick={() => setModalEditar(false)} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, margin: 0, fontWeight: 'bold', fontSize: 'inherit' }}>Cancelar</button>
              </div>
            </form>
            {msgEditar.texto && <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: msgEditar.cor }}>{msgEditar.texto}</div>}
          </div>
        </div>
      )}

      {modalExcluir && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Tem certeza que deseja excluir este registro de vacina do histórico?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: 'inherit' }} onClick={confirmarExcluir}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: 'inherit' }} onClick={() => setModalExcluir(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}

export default function Historico() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', fontFamily: 'Arial' }}>Carregando...</div>}>
      <HistoricoConteudo />
    </Suspense>
  );
}