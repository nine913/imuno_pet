"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function VetTutores() {
  const [usuario, setUsuario] = useState(null);
  const [tutores, setTutores] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editDados, setEditDados] = useState({
    id_tutor: '', nome_completo: '', telefone: '', estado: '', cidade: '', bairro: ''
  });
  const [mensagemEditar, setMensagemEditar] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [tutorParaExcluir, setTutorParaExcluir] = useState(null);

  const [modalErroOpen, setModalErroOpen] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

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

    realizarBusca('', user.id_clinica);
  }, [router]);

  const realizarBusca = async (termo = termoBusca, id = null) => {
    const clinica = id || usuario?.id_clinica;
    if (!clinica) return;

    try {
      const resposta = await apiFetch(`/listar-tutores?termo=${termo}&id_clinica=${clinica}`);
      if (resposta.ok) {
        setTutores(await resposta.json());
      } else {
        setTutores([]);
      }
    } catch (erro) {}
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    setEditDados({ ...editDados, telefone: v });
  };

  const handleEstadoChange = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setEditDados({ ...editDados, estado: v });
  };

  const abrirModalEditar = (tutor) => {
    setEditDados({
      id_tutor: tutor.id_tutor,
      nome_completo: tutor.nome_completo,
      telefone: tutor.telefone || '',
      estado: tutor.estado || '',
      cidade: tutor.cidade || '',
      bairro: tutor.bairro || ''
    });
    setMensagemEditar({ texto: '', cor: '' });
    setModalEditarOpen(true);
  };

  const submitEditar = async (e) => {
    e.preventDefault();
    try {
      const resposta = await apiFetch(`/editar-tutor-dados/${editDados.id_tutor}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editDados, id_usuario_log: usuario.id_usuario })
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setMensagemEditar({ texto: dados.mensagem, cor: '#10b981' });
        setTimeout(() => {
          setModalEditarOpen(false);
          realizarBusca();
        }, 1500);
      } else {
        setMensagemEditar({ texto: dados.erro, cor: '#ef4444' });
      }
    } catch (erro) {
      setMensagemEditar({ texto: 'Erro ao salvar alterações.', cor: '#ef4444' });
    }
  };

  const confirmarExclusao = async () => {
    if (!tutorParaExcluir) return;
    try {
      const resposta = await apiFetch(`/deletar-tutor/${tutorParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (resposta.ok) {
        setModalExclusaoOpen(false);
        realizarBusca();
      } else {
        const dados = await resposta.json();
        setModalExclusaoOpen(false);
        setMensagemErro(dados.erro || 'Erro: tutor não pode ser excluído.');
        setModalErroOpen(true);
      }
    } catch (erro) {
      setModalExclusaoOpen(false);
      setMensagemErro('Erro ao conectar com o servidor.');
      setModalErroOpen(true);
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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: headerColor, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Consultar Tutores</h2>
            <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Gerencie o cadastro dos responsáveis na clínica.</p>
          </div>
          <button className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => router.push('/veterinario/cadastrar-tutor')}>
            <span style={{ fontSize: '18px' }}>+</span> Novo Tutor
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input 
            type="text" 
            className="premium-input"
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && realizarBusca()} 
            placeholder="Digite o nome, CPF ou E-mail do tutor..." 
            style={{ padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, margin: 0, flex: 1, fontSize: '15px', outline: 'none', transition: 'all 0.2s' }} 
          />
          <button className="premium-btn" style={{ padding: '0 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', margin: 0, width: 'auto', fontWeight: '600', fontSize: '15px' }} onClick={() => realizarBusca()}>
            Pesquisar
          </button>
        </div>

        <div>
          {tutores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🔍</span>
              Nenhum tutor encontrado na busca.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {tutores.map(tutor => (
                <div key={tutor.id_tutor} className="premium-card" style={{ border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isEscuro ? '#1e3a8a' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', filter: sombraEmoji }}>👤</div>
                      <h3 style={{ margin: 0, color: headerColor, fontSize: '20px', fontWeight: '700' }}>{tutor.nome_completo}</h3>
                    </div>
                    
                    <div style={{ backgroundColor: inputBg, padding: '16px', borderRadius: '12px', border: `1px solid ${borderColor}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Documento / E-mail</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500', display: 'block', marginBottom: '2px' }}>CPF: {tutor.cpf}</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{tutor.email}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Contato / Localização</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500', display: 'block', marginBottom: '2px' }}>{tutor.telefone}</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{tutor.bairro}, {tutor.cidade} - {tutor.estado}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '140px' }}>
                    <button className="premium-btn" style={{ padding: '12px 16px', color: '#0f172a', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '600', backgroundColor: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirModalEditar(tutor)}>
                      <span style={{ filter: sombraEmoji }}>✏️</span> Editar
                    </button>
                    <button className="premium-btn" style={{ padding: '12px 16px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '600', backgroundColor: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { setTutorParaExcluir(tutor.id_tutor); setModalExclusaoOpen(true); }}>
                      <span style={{ filter: sombraEmoji }}>🗑️</span> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalEditarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, color: textColor, boxSizing: 'border-box' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: sombraEmoji }}>✏️</span> Editar Tutor
            </h3>
            <form onSubmit={submitEditar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Nome Completo:</label>
                <input type="text" className="premium-input" value={editDados.nome_completo} onChange={e => setEditDados({...editDados, nome_completo: e.target.value})} required style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Telefone:</label>
                <input type="tel" className="premium-input" value={editDados.telefone} onChange={handleTelefoneChange} required maxLength="15" style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>UF:</label>
                  <input type="text" className="premium-input" value={editDados.estado} onChange={handleEstadoChange} required maxLength="2" style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Cidade:</label>
                  <input type="text" className="premium-input" value={editDados.cidade} onChange={e => setEditDados({...editDados, cidade: e.target.value})} required style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Bairro:</label>
                <input type="text" className="premium-input" value={editDados.bairro} onChange={e => setEditDados({...editDados, bairro: e.target.value})} required style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="premium-btn" style={{ padding: '14px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '600', backgroundColor: '#10b981', flex: 1, margin: 0, fontSize: '15px' }}>Salvar Alterações</button>
                <button type="button" className="premium-btn" onClick={() => setModalEditarOpen(false)} style={{ padding: '14px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#64748b', flex: 1, margin: 0, fontSize: '15px' }}>Cancelar</button>
              </div>
            </form>
            {mensagemEditar.texto && (
              <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: mensagemEditar.cor === '#10b981' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: mensagemEditar.cor === '#10b981' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {mensagemEditar.texto}
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
            <h3 style={{ color: isEscuro ? '#f87171' : '#dc2626', marginTop: 0, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Excluir Tutor</h3>
            <p style={{ color: textColor, fontSize: '15px', marginBottom: '8px', lineHeight: '1.5' }}>Deseja excluir este tutor?</p>
            <p style={{ fontSize: '13px', color: textSecundario, margin: '0 0 24px 0', lineHeight: '1.5' }}>Isso apagará a conta dele, todos os seus animais e registros de vacina.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="premium-btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button className="premium-btn" style={{ backgroundColor: '#64748b', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modalErroOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: altoContraste ? '2px solid #dc2626' : `1px solid ${borderColor}`, color: textColor, boxSizing: 'border-box' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isEscuro ? '#7f1d1d' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px', color: '#ef4444' }}>
              ❌
            </div>
            <h3 style={{ color: isEscuro ? '#f87171' : '#dc2626', marginTop: 0, fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Erro na Exclusão</h3>
            <p style={{ color: textColor, fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px 0' }}>{mensagemErro}</p>
            <button className="premium-btn" style={{ backgroundColor: '#64748b', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', width: '100%' }} onClick={() => setModalErroOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}