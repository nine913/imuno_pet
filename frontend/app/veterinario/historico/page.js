"use client";

import { apiFetch } from '../../lib/api';
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

  const carregarVacinas = async () => {
    try {
      const res = await apiFetch('/vacinas');
      if (res.ok) setVacinasBase(await res.json());
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: '#ef4444' });
    }
  };

  const buscarHistorico = async (idUserOverride) => {
    if (!idAnimal) return;
    const userId = idUserOverride || (usuario ? usuario.id_usuario : '');
    try {
      const res = await apiFetch(`/historico-pet/${idAnimal}?termo=${termoBusca}&status=${statusFiltro}&id_usuario_log=${userId}`);
      if (res.ok) setHistorico(await res.json());
      else setHistorico([]);
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: '#ef4444' });
    }
  };

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza a sessão salva em localStorage (sistema externo, só existe no cliente) na montagem; padrão seguro para SSR
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
      setMsgEditar({ texto: 'A data do agendamento não pode estar no passado.', cor: '#ef4444' });
      return;
    }

    if (editDados.status === 'APLICADA' && editDados.data_aplicacao > dataHoje) {
      setMsgEditar({ texto: 'A data de aplicação não pode estar no futuro.', cor: '#ef4444' });
      return;
    }

    if (editDados.status === 'APLICADA' && editDados.data_aplicacao && editDados.data_proxima_dose && editDados.data_proxima_dose < editDados.data_aplicacao) {
      setMsgEditar({ texto: 'A data de vencimento não pode ser menor que a data de aplicação.', cor: '#ef4444' });
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

      const res = await apiFetch(`/editar-registro-vacina/${editDados.id_registro}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsgEditar({ texto: 'Atualizado com sucesso!', cor: '#10b981' });
        setTimeout(() => { setModalEditar(false); buscarHistorico(); }, 1500);
      } else {
        setMsgEditar({ texto: 'Erro ao atualizar.', cor: '#ef4444' });
      }
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: '#ef4444' });
    }
  };

  const confirmarExcluir = async () => {
    try {
      const res = await apiFetch(`/deletar-registro-vacina/${idExcluir}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) { setModalExcluir(false); buscarHistorico(); }
    } catch (e) {
      setMsgEditar({ texto: 'Erro de conexão.', cor: '#ef4444' });
    }
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#f8fafc';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');
  
  const sombraEmoji = isEscuro ? 'drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.4))' : 'none';

  return (
    <LayoutPainel>
      <style>{`
        .premium-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        }
        .premium-btn {
          transition: all 0.2s ease;
        }
        .premium-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .premium-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '32px' }}>
          <button className="premium-btn" style={{ padding: '10px 16px', color: '#475569', border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', fontSize: '14px', backgroundColor: bgCard, fontWeight: '600' }} onClick={() => router.push('/veterinario/buscar')}>
            ← Voltar
          </button>
          <h2 style={{ color: headerColor, margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Histórico do Paciente</h2>
        </div>

        <div style={{ backgroundColor: bgCard, padding: '24px', borderRadius: '16px', marginBottom: '32px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              className="premium-input"
              value={termoBusca} 
              onChange={e => setTermoBusca(e.target.value)} 
              placeholder="Buscar por nome da vacina..." 
              style={{ flex: 2, minWidth: '200px', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
            />
            <select 
              className="premium-input"
              value={statusFiltro} 
              onChange={e => setStatusFiltro(e.target.value)} 
              style={{ flex: 1, minWidth: '150px', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
            >
              <option value="">Status da Vacina: Todos</option>
              <option value="APLICADA">Aplicada</option>
              <option value="PENDENTE">Pendente (Agendada)</option>
              <option value="ATRASADA">Atrasada</option>
            </select>
            <button className="premium-btn" style={{ flex: 1, minWidth: '120px', padding: '0 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', margin: 0, fontWeight: '600', fontSize: '15px' }} onClick={() => buscarHistorico()}>
              Pesquisar
            </button>
          </div>
        </div>

        <div>
          {historico.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>Nenhum registro encontrado.</div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {historico.map(reg => {
                let corStatus, bgBadge, textBadge;
                if (reg.status === 'APLICADA') {
                  corStatus = '#10b981';
                  bgBadge = isEscuro ? '#064e3b' : '#d1fae5';
                  textBadge = isEscuro ? '#34d399' : '#047857';
                } else if (reg.status === 'ATRASADA') {
                  corStatus = '#ef4444';
                  bgBadge = isEscuro ? '#7f1d1d' : '#fee2e2';
                  textBadge = isEscuro ? '#f87171' : '#b91c1c';
                } else {
                  corStatus = '#f59e0b';
                  bgBadge = isEscuro ? '#78350f' : '#fef3c7';
                  textBadge = isEscuro ? '#fbbf24' : '#b45309';
                }

                return (
                  <div key={reg.id_registro} className="premium-card" style={{ border: `1px solid ${borderColor}`, borderLeft: `4px solid ${corStatus}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <h3 style={{ color: headerColor, margin: 0, fontSize: '18px', fontWeight: '700' }}>
                          <span style={{ filter: sombraEmoji }}>💉</span> {reg.nome_vacina}
                        </h3>
                        <span style={{ backgroundColor: bgBadge, color: textBadge, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                          {reg.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', backgroundColor: inputBg, padding: '12px 16px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Aplicação</span>
                          <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{reg.data_aplicacao ? new Date(reg.data_aplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Próxima Dose</span>
                          <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{reg.data_proxima_dose ? new Date(reg.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '140px' }}>
                      <button className="premium-btn" style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirEditar(reg)}>
                        <span style={{ filter: sombraEmoji }}>✏️</span> Editar
                      </button>
                      <button className="premium-btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { setIdExcluir(reg.id_registro); setModalExcluir(true); }}>
                        <span style={{ filter: sombraEmoji }}>🗑️</span> Excluir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalEditar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: sombraEmoji }}>✏️</span> Editar Registro
            </h3>
            <form onSubmit={submitEditar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Vacina:</label>
                <select className="premium-input" value={editDados.id_vacina} onChange={handleChangeVacina} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} required>
                  <option value="">Selecione a vacina...</option>
                  {vacinasBase.map(v => <option key={v.id_vacina} value={v.id_vacina}>{v.nome_vacina}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Status:</label>
                <select className="premium-input" value={editDados.status} onChange={handleChangeStatus} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} required>
                  <option value="APLICADA">Aplicada</option>
                  <option value="PENDENTE">Agendada (Pendente)</option>
                  {editDados.status === 'ATRASADA' && <option value="ATRASADA">Atrasada (Automático)</option>}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Data de Aplicação:</label>
                <input
                  type="date"
                  className="premium-input"
                  value={editDados.data_aplicacao}
                  onChange={handleChangeDataAplicacao}
                  style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                  disabled={editDados.status === 'PENDENTE' || editDados.status === 'ATRASADA'}
                  required={editDados.status === 'APLICADA'}
                  max={dataHoje}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Data da Próxima Dose / Vencimento:</label>
                <input
                  type="date"
                  className="premium-input"
                  value={editDados.data_proxima_dose}
                  onChange={e => setEditDados({...editDados, data_proxima_dose: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                  min={editDados.status === 'PENDENTE' ? dataHoje : (editDados.data_aplicacao || '')}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', flex: 1, margin: 0, fontWeight: '600', fontSize: '15px' }}>Salvar Alterações</button>
                <button type="button" className="premium-btn" onClick={() => setModalEditar(false)} style={{ backgroundColor: '#64748b', color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', flex: 1, margin: 0, fontWeight: '600', fontSize: '15px' }}>Cancelar</button>
              </div>
            </form>
            {msgEditar.texto && (
              <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: msgEditar.cor === '#10b981' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: msgEditar.cor === '#10b981' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {msgEditar.texto}
              </div>
            )}
          </div>
        </div>
      )}

      {modalExcluir && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: altoContraste ? '2px solid #dc2626' : `1px solid ${borderColor}`, color: textColor, boxSizing: 'border-box' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isEscuro ? '#7f1d1d' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>
              ⚠️
            </div>
            <h3 style={{ color: isEscuro ? '#f87171' : '#dc2626', marginTop: 0, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Atenção!</h3>
            <p style={{ color: textSecundario, margin: '0 0 24px 0', fontSize: '15px' }}>Tem certeza que deseja excluir este registro de vacina do histórico?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="premium-btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '14px' }} onClick={confirmarExcluir}>Sim, Excluir</button>
              <button className="premium-btn" style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '14px' }} onClick={() => setModalExcluir(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}

export default function Historico() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', fontFamily: '"Inter", sans-serif', textAlign: 'center', color: '#64748b' }}>Carregando dados...</div>}>
      <HistoricoConteudo />
    </Suspense>
  );
}