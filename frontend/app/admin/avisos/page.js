"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function AdminAvisos() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [avisos, setAvisos] = useState([]);
  
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [isEdicao, setIsEdicao] = useState(false);
  const [formDados, setFormDados] = useState({
    id_aviso: '',
    titulo: '',
    mensagem: '',
    tipo: 'INFO',
    status: 'ATIVO'
  });
  const [mensagemForm, setMensagemForm] = useState({ texto: '', cor: '' });
  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [avisoParaExcluir, setAvisoParaExcluir] = useState(null);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const buscarAvisos = async () => {
    try {
      const resposta = await apiFetch('/admin/avisos');
      if (resposta.ok) {
        setAvisos(await resposta.json());
      }
    } catch (erro) {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (!saved) {
        router.push('/');
        return;
      }
      const user = JSON.parse(saved);
      if (user.perfil.toUpperCase() !== 'ADMINISTRADOR') {
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

      buscarAvisos();
    }
  }, [router]);

  const abrirModalCadastro = () => {
    setIsEdicao(false);
    setFormDados({ id_aviso: '', titulo: '', mensagem: '', tipo: 'INFO', status: 'ATIVO' });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = (aviso) => {
    setIsEdicao(true);
    setFormDados({
      id_aviso: aviso.id_aviso,
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      tipo: aviso.tipo,
      status: aviso.status
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    let url = '/admin/cadastrar-aviso';
    let metodo = 'POST';

    const payload = { ...formDados, id_usuario_log: usuario.id_usuario };

    if (isEdicao) {
      url = `/admin/editar-aviso/${formDados.id_aviso}`;
      metodo = 'PUT';
    }

    try {
      const resposta = await apiFetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagemForm({ texto: dados.mensagem || 'Sucesso!', cor: '#10b981' });
        setTimeout(() => {
          setModalFormOpen(false);
          buscarAvisos();
        }, 1500);
      } else {
        setMensagemForm({ texto: dados.erro || 'Erro.', cor: '#ef4444' });
      }
    } catch (erro) {
      setMensagemForm({ texto: 'Erro de conexão.', cor: '#ef4444' });
    }
  };

  const confirmarExclusao = async () => {
    if (!avisoParaExcluir) return;
    try {
      const res = await apiFetch(`/admin/deletar-aviso/${avisoParaExcluir}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        setModalExclusaoOpen(false);
        setAvisoParaExcluir(null);
        buscarAvisos();
      }
    } catch (error) {
      setModalExclusaoOpen(false);
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
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ color: headerColor, margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Avisos Globais</h2>
            <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Gerencie os comunicados enviados para os usuários.</p>
          </div>
          <button className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={abrirModalCadastro}>
            <span style={{ fontSize: '18px' }}>+</span> Criar Aviso
          </button>
        </div>

        <div>
          {avisos.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>
               <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📢</span>
               Nenhum aviso criado.
             </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {avisos.map(aviso => {
                let borderLeftColor = '#3b82f6'; // INFO
                let icon = 'ℹ️';
                if (aviso.tipo === 'URGENTE') {
                  borderLeftColor = '#ef4444';
                  icon = '🚨';
                } else if (aviso.tipo === 'ALERTA') {
                  borderLeftColor = '#f59e0b';
                  icon = '⚠️';
                }

                return (
                  <div key={aviso.id_aviso} className="premium-card" style={{ border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', borderLeft: `6px solid ${borderLeftColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginTop: 0, color: textColor, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ filter: sombraEmoji }}>{icon}</span> {aviso.titulo}
                      </h3>
                      <p style={{ margin: '8px 0 16px 0', color: textSecundario, lineHeight: '1.5', fontSize: '15px' }}>{aviso.mensagem}</p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ backgroundColor: inputBg, border: `1px solid ${borderColor}`, padding: '6px 12px', borderRadius: '20px', color: textSecundario, fontSize: '13px', fontWeight: '600' }}>
                          Tipo: <strong style={{ color: textColor }}>{aviso.tipo}</strong>
                        </span>
                        <span style={{ backgroundColor: aviso.status === 'ATIVO' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: aviso.status === 'ATIVO' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                          {aviso.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
                      <button className="premium-btn" style={{ color: '#0f172a', padding: '10px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirModalEdicao(aviso)}>
                        <span style={{ filter: sombraEmoji }}>✏️</span> Editar
                      </button>
                      <button className="premium-btn" style={{ color: 'white', padding: '10px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { setAvisoParaExcluir(aviso.id_aviso); setModalExclusaoOpen(true); }}>
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

      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, color: headerColor, marginBottom: '24px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEdicao ? <><span style={{ filter: sombraEmoji }}>✏️</span> Editar Aviso</> : <><span style={{ filter: sombraEmoji }}>📢</span> Criar Novo Aviso</>}
            </h3>
            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Título:</label>
                <input type="text" className="premium-input" value={formDados.titulo} onChange={e => setFormDados({...formDados, titulo: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Mensagem:</label>
                <textarea className="premium-input" value={formDados.mensagem} onChange={e => setFormDados({...formDados, mensagem: e.target.value})} required rows="4" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Tipo:</label>
                <select className="premium-input" value={formDados.tipo} onChange={e => setFormDados({...formDados, tipo: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                  <option value="INFO">Informativo (Azul)</option>
                  <option value="ALERTA">Alerta (Amarelo)</option>
                  <option value="URGENTE">Urgente (Vermelho)</option>
                </select>
              </div>

              {isEdicao && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Status:</label>
                  <select className="premium-input" value={formDados.status} onChange={e => setFormDados({...formDados, status: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                    <option value="ATIVO">Ativo (Aparece para todos)</option>
                    <option value="INATIVO">Inativo (Oculto)</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="premium-btn" style={{ color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#10b981', flex: 1, fontSize: '15px' }}>Salvar Aviso</button>
                <button type="button" className="premium-btn" onClick={() => setModalFormOpen(false)} style={{ color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#64748b', flex: 1, fontSize: '15px' }}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && (
              <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: mensagemForm.cor === '#10b981' || mensagemForm.cor === 'green' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: mensagemForm.cor === '#10b981' || mensagemForm.cor === 'green' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {mensagemForm.texto}
              </div>
            )}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: altoContraste ? '2px solid #dc2626' : `1px solid ${borderColor}`, color: textColor, boxSizing: 'border-box' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isEscuro ? '#7f1d1d' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>
              ⚠️
            </div>
            <h3 style={{ color: isEscuro ? '#f87171' : '#dc2626', marginTop: 0, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Atenção!</h3>
            <p style={{ color: textColor, fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>Deseja excluir este aviso permanentemente?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="premium-btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button className="premium-btn" style={{ backgroundColor: '#64748b', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}