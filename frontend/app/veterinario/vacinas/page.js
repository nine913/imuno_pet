"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

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

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

  const realizarBusca = async (termo = termoBusca) => {
    try {
      const url = `/vacinas?termo=${encodeURIComponent(termo)}`;
      const resposta = await apiFetch(url);
      if (resposta.ok) {
        setVacinas(await resposta.json());
      } else {
        setVacinas([]);
      }
    } catch (erro) {}
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

    realizarBusca('');
  }, [router]);

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
      intervalo_doses_dias: editDados.tipo_dose === 'intervalo' ? editDados.intervalo_doses_dias : 0,
      id_usuario_log: usuario.id_usuario
    };

    try {
      const resposta = await apiFetch(`/editar-vacina/${editDados.id_vacina}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setMensagemEditar({ texto: dados.mensagem || 'Salvo com sucesso!', cor: '#10b981' });
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
    if (!vacinaParaExcluir) return;
    try {
      const resposta = await apiFetch(`/deletar-vacina/${vacinaParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (resposta.ok) {
        setModalExclusaoOpen(false);
        realizarBusca();
      }
    } catch (erro) {}
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
            <h2 style={{ margin: '0 0 8px 0', color: headerColor, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Catálogo de Vacinas</h2>
            <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Consulte e gerencie os imunizantes cadastrados no sistema.</p>
          </div>
          <button className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => router.push('/veterinario/cadastrar-vacina')}>
            <span style={{ fontSize: '18px' }}>+</span> Cadastrar Vacina
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input 
            type="text" 
            className="premium-input"
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && realizarBusca()} 
            placeholder="Pesquisar por nome, doenças prevenidas ou fabricante..." 
            style={{ width: '100%', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, flex: 1, fontSize: '15px', outline: 'none', transition: 'all 0.2s' }} 
          />
          <button className="premium-btn" style={{ padding: '0 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', margin: 0, width: 'auto', fontWeight: '600', fontSize: '15px' }} onClick={() => realizarBusca()}>
            Pesquisar
          </button>
        </div>

        <div>
          {vacinas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>💉</span>
              Nenhuma vacina encontrada no catálogo.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {vacinas.map(v => {
                const valorIntervalo = v.intervalo_doses_dias || v.intervalo_doses_dias || 0;
                const textoIntervalo = valorIntervalo > 0 ? `${valorIntervalo} dias` : 'Dose Única';
                
                return (
                  <div key={v.id_vacina} className="premium-card" style={{ border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isEscuro ? '#064e3b' : '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', filter: sombraEmoji }}>💉</div>
                        <h3 style={{ margin: 0, color: headerColor, fontSize: '20px', fontWeight: '700' }}>{v.nome_vacina}</h3>
                      </div>
                      
                      <div style={{ backgroundColor: inputBg, padding: '16px', borderRadius: '12px', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <span style={{ display: 'inline-block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', width: '80px' }}>Previne:</span>
                          <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{v.doencas_prevenidas}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ display: 'inline-block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', width: '80px' }}>Fabricante:</span>
                            <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{v.fabricante || 'N/I'}</span>
                          </div>
                          <div>
                            <span style={{ display: 'inline-block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', width: '80px' }}>Intervalo:</span>
                            <span style={{ fontSize: '14px', color: textColor, fontWeight: '500', backgroundColor: isEscuro ? '#1e3a8a' : '#e0e7ff', color: isEscuro ? '#bfdbfe' : '#1e40af', padding: '2px 8px', borderRadius: '4px' }}>{textoIntervalo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '140px' }}>
                      <button className="premium-btn" style={{ padding: '12px 16px', color: '#0f172a', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '600', backgroundColor: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirModalEditar(v)}>
                        <span style={{ filter: sombraEmoji }}>✏️</span> Editar
                      </button>
                      <button className="premium-btn" style={{ padding: '12px 16px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '600', backgroundColor: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { setVacinaParaExcluir(v.id_vacina); setModalExclusaoOpen(true); }}>
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

      {modalEditarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, color: textColor, boxSizing: 'border-box' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: sombraEmoji }}>✏️</span> Editar Vacina
            </h3>
            <form onSubmit={submitEditar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Nome da Vacina:</label>
                <input type="text" className="premium-input" value={editDados.nome_vacina} onChange={e => setEditDados({...editDados, nome_vacina: e.target.value})} required style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Doenças Prevenidas:</label>
                <textarea className="premium-input" value={editDados.doencas_prevenidas} onChange={e => setEditDados({...editDados, doencas_prevenidas: e.target.value})} rows="3" required style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', resize: 'vertical', outline: 'none', transition: 'all 0.2s' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Fabricante:</label>
                <input type="text" className="premium-input" value={editDados.fabricante} onChange={e => setEditDados({...editDados, fabricante: e.target.value})} style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Tipo de Dose:</label>
                <select className="premium-input" value={editDados.tipo_dose} onChange={handleTipoDoseChange} required style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                  <option value="unica">Dose Única</option>
                  <option value="intervalo">Múltiplas Doses (Com Intervalo)</option>
                </select>
              </div>

              {editDados.tipo_dose === 'intervalo' && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, textAlign: 'left', fontSize: '13px' }}>Intervalo entre doses (em dias):</label>
                  <input type="number" className="premium-input" value={editDados.intervalo_doses_dias} onChange={handleIntervaloChange} min="0" required style={{ padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              )}
              
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
            <h3 style={{ color: isEscuro ? '#f87171' : '#dc2626', marginTop: 0, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Atenção!</h3>
            <p style={{ color: textColor, fontSize: '15px', marginBottom: '8px', lineHeight: '1.5' }}>Deseja excluir esta vacina do catálogo?</p>
            <p style={{ fontSize: '13px', color: textSecundario, margin: '0 0 24px 0', lineHeight: '1.5' }}>Isso apagará este registro de todos os animais vacinados com ela e não poderá ser desfeito.</p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="premium-btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button className="premium-btn" style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}