"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function GestorEquipe() {
  const [usuario, setUsuario] = useState(null);
  const [equipe, setEquipe] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [isEdicao, setIsEdicao] = useState(false);
  const [formDados, setFormDados] = useState({
    id_veterinario: '',
    id_usuario: '',
    nome_completo: '',
    crmv: '',
    email: '',
    senha: ''
  });
  const [mensagemForm, setMensagemForm] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

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

    buscarEquipe('', user.id_clinica);
  }, [router]);

  const buscarEquipe = async (termo = termoBusca, idClinicaOverride = null) => {
    const idClinica = idClinicaOverride || (usuario ? usuario.id_clinica : null);
    if (!idClinica) return;

    try {
      const resposta = await apiFetch(`/gestor/veterinarios-lista?id_clinica=${idClinica}&termo=${termo}`);
      if (resposta.ok) {
        setEquipe(await resposta.json());
      } else {
        setEquipe([]);
      }
    } catch (erro) {}
  };

  const formatarCRMV = (valor) => {
    let limpo = valor.replace(/[^a-zA-Z0-9]/g, '');
    let uf = limpo.substring(0, 2).replace(/[^a-zA-Z]/g, '').toUpperCase();
    let numeros = limpo.substring(2).replace(/[^0-9]/g, '');
    
    if (limpo.length > 2) {
      return `${uf}-${numeros.substring(0, 5)}`;
    }
    return uf;
  };

  const abrirModalCadastro = () => {
    setIsEdicao(false);
    setFormDados({
      id_veterinario: '',
      id_usuario: '',
      nome_completo: '',
      crmv: '',
      email: '',
      senha: ''
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = (vet) => {
    setIsEdicao(true);
    setFormDados({
      id_veterinario: vet.id_veterinario,
      id_usuario: vet.id_usuario,
      nome_completo: vet.nome_completo,
      crmv: vet.crmv,
      email: vet.email,
      senha: ''
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const fecharModais = () => {
    setModalFormOpen(false);
    setModalExclusaoOpen(false);
    setIdParaExcluir(null);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    
    const payload = {
      nome_completo: formDados.nome_completo,
      crmv: formDados.crmv,
      email: formDados.email,
      id_clinica: usuario.id_clinica,
      id_usuario_log: usuario.id_usuario
    };

    let url = '/gestor/cadastrar-vet';
    let metodo = 'POST';

    if (isEdicao) {
      payload.id_usuario = formDados.id_usuario;
      url = `/gestor/editar-vet/${formDados.id_veterinario}`;
      metodo = 'PUT';
    } else {
      payload.senha = formDados.senha;
    }

    try {
      const resposta = await apiFetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagemForm({ texto: dados.mensagem, cor: '#10b981' });
        setTimeout(() => {
          fecharModais();
          buscarEquipe();
        }, 1500);
      } else {
        setMensagemForm({ texto: dados.erro || 'Erro ao processar.', cor: '#ef4444' });
      }
    } catch (erro) {
      setMensagemForm({ texto: 'Erro de conexão com o servidor.', cor: '#ef4444' });
    }
  };

  const confirmarExclusao = async () => {
    if (!idParaExcluir) return;
    try {
      const resposta = await apiFetch(`/gestor/deletar-vet/${idParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (resposta.ok) {
        fecharModais();
        buscarEquipe();
      } else {
        const dados = await resposta.json();
        alert(dados.erro || 'Erro ao excluir.');
        fecharModais();
      }
    } catch (erro) {
      alert('Erro de conexão.');
      fecharModais();
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
            <h2 style={{ margin: '0 0 8px 0', color: headerColor, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Equipe Veterinária</h2>
            <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Gerencie os profissionais cadastrados na sua clínica.</p>
          </div>
          <button className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={abrirModalCadastro}>
            <span style={{ fontSize: '18px' }}>+</span> Novo Veterinário
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input 
            type="text" 
            className="premium-input"
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && buscarEquipe(termoBusca)} 
            placeholder="Pesquisar por nome, CRMV ou e-mail..." 
            style={{ width: '100%', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, flex: 2, fontSize: '15px', outline: 'none', transition: 'all 0.2s' }} 
          />
          <button className="premium-btn" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0 24px', borderRadius: '10px', cursor: 'pointer', margin: 0, width: 'auto', fontWeight: '600', fontSize: '15px' }} onClick={() => buscarEquipe(termoBusca)}>
            Pesquisar
          </button>
        </div>

        <div>
          {equipe.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>👥</span>
              Nenhum veterinário encontrado.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {equipe.map(vet => (
                <div key={vet.id_veterinario} className="premium-card" style={{ border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isEscuro ? '#1e3a8a' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', filter: sombraEmoji }}>🩺</div>
                      <h3 style={{ margin: 0, color: headerColor, fontSize: '20px', fontWeight: '700' }}>{vet.nome_completo}</h3>
                    </div>
                    
                    <div style={{ backgroundColor: inputBg, padding: '16px', borderRadius: '12px', border: `1px solid ${borderColor}`, display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Documento</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>CRMV: {vet.crmv}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Acesso</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{vet.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '140px' }}>
                    <button className="premium-btn" style={{ padding: '12px 16px', color: '#0f172a', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '600', backgroundColor: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirModalEdicao(vet)}>
                      <span style={{ filter: sombraEmoji }}>✏️</span> Editar
                    </button>
                    <button className="premium-btn" style={{ padding: '12px 16px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '600', backgroundColor: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { setIdParaExcluir(vet.id_veterinario); setModalExclusaoOpen(true); }}>
                      <span style={{ filter: sombraEmoji }}>🗑️</span> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEdicao ? <><span style={{ filter: sombraEmoji }}>✏️</span> Editar Veterinário</> : <><span style={{ filter: sombraEmoji }}>🩺</span> Cadastrar Veterinário</>}
            </h3>
            
            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Nome Completo:</label>
                <input type="text" className="premium-input" value={formDados.nome_completo} onChange={e => setFormDados({...formDados, nome_completo: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>CRMV:</label>
                <input 
                  type="text" 
                  className="premium-input"
                  value={formDados.crmv} 
                  onChange={e => setFormDados({...formDados, crmv: formatarCRMV(e.target.value)})} 
                  required 
                  style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
                  placeholder="Ex: PA-12345"
                  maxLength="8"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>E-mail de Acesso:</label>
                <input type="email" className="premium-input" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              {!isEdicao && (
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Senha de Acesso (Criação):</label>
                  <input type="password" className="premium-input" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="premium-btn" style={{ padding: '14px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', flex: 1, fontWeight: '600', backgroundColor: '#10b981', fontSize: '15px' }}>Salvar Dados</button>
                <button type="button" className="premium-btn" style={{ padding: '14px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', flex: 1, margin: 0, fontWeight: '600', backgroundColor: '#64748b', fontSize: '15px' }} onClick={fecharModais}>Cancelar</button>
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
            <p style={{ color: textColor, fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>Confirma a exclusão deste veterinário e de seu acesso permanente ao sistema?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="premium-btn" style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button className="premium-btn" style={{ backgroundColor: '#64748b', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', flex: 1 }} onClick={fecharModais}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}