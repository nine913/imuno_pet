"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function AdminClinicas() {
  const [usuario, setUsuario] = useState(null);
  const [clinicas, setClinicas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [isEdicao, setIsEdicao] = useState(false);
  const [formDados, setFormDados] = useState({
    id_clinica: '',
    nome_fantasia: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    estado: '',
    cidade: '',
    bairro: ''
  });
  const [mensagemForm, setMensagemForm] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

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
      setUsuario(user);

      const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
      if (configSalvas) {
        const config = JSON.parse(configSalvas);
        setTema(config.tema || 'claro');
        setAltoContraste(config.altoContraste || false);
      }

      buscarClinicas('');
    }
  }, [router]);

  const buscarClinicas = async (termo = termoBusca) => {
    try {
      const resposta = await apiFetch(`/admin/clinicas?termo=${termo}`);
      if (resposta.ok) {
        setClinicas(await resposta.json());
      } else {
        setClinicas([]);
      }
    } catch (erro) {}
  };

  const handleCNPJChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    setFormDados({ ...formDados, cnpj: v.substring(0, 18) });
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    setFormDados({ ...formDados, telefone: v.substring(0, 15) });
  };

  const handleEstadoChange = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setFormDados({ ...formDados, estado: v });
  };

  const abrirModalCadastro = () => {
    setIsEdicao(false);
    setFormDados({
      id_clinica: '',
      nome_fantasia: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      estado: '',
      cidade: '',
      bairro: ''
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = (clinica) => {
    setIsEdicao(true);
    setFormDados({
      id_clinica: clinica.id_clinica,
      nome_fantasia: clinica.nome_fantasia,
      cnpj: clinica.cnpj || '',
      endereco: clinica.endereco || '',
      telefone: clinica.telefone || '',
      estado: clinica.estado,
      cidade: clinica.cidade,
      bairro: clinica.bairro
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
    
    let url = '/admin/cadastrar-clinica';
    let metodo = 'POST';

    if (isEdicao) {
      url = `/admin/editar-clinica/${formDados.id_clinica}`;
      metodo = 'PUT';
    }

    const payload = { ...formDados, id_usuario_log: usuario.id_usuario };

    try {
      const resposta = await apiFetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagemForm({ texto: dados.mensagem || 'Operação realizada com sucesso!', cor: '#10b981' });
        setTimeout(() => {
          fecharModais();
          buscarClinicas();
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
      const resposta = await apiFetch(`/admin/deletar-clinica/${idParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (resposta.ok) {
        fecharModais();
        buscarClinicas();
      } else {
        const dados = await resposta.json();
        alert(dados.erro || 'Erro ao excluir a clínica. Verifique se existem vínculos ativos.');
        fecharModais();
      }
    } catch (erro) {
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
            <h2 style={{ margin: '0 0 8px 0', color: headerColor, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Gerenciamento de Clínicas</h2>
            <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Cadastre e administre as unidades de saúde integradas ao sistema.</p>
          </div>
          <button className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={abrirModalCadastro}>
            <span style={{ fontSize: '18px' }}>+</span> Nova Clínica
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input 
            type="text" 
            className="premium-input"
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && buscarClinicas(termoBusca)} 
            placeholder="Pesquisar por nome fantasia ou CNPJ..." 
            style={{ width: '100%', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, margin: 0, flex: 2, fontSize: '15px', outline: 'none', transition: 'all 0.2s' }} 
          />
          <button className="premium-btn" style={{ color: 'white', padding: '0 24px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#2563eb', flex: 1, margin: 0, fontSize: '15px' }} onClick={() => buscarClinicas(termoBusca)}>
            Pesquisar
          </button>
        </div>

        <div>
          {clinicas.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>
               <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🏥</span>
               Nenhuma clínica encontrada.
             </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {clinicas.map(clinica => (
                <div key={clinica.id_clinica} className="premium-card" style={{ border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isEscuro ? '#064e3b' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', filter: sombraEmoji }}>🏥</div>
                      <h3 style={{ margin: 0, color: headerColor, fontSize: '20px', fontWeight: '700' }}>{clinica.nome_fantasia}</h3>
                    </div>
                    
                    <div style={{ backgroundColor: inputBg, padding: '16px', borderRadius: '12px', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>CNPJ</span>
                          <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{clinica.cnpj || 'Não cadastrado'}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Telefone</span>
                          <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{clinica.telefone || 'Não cadastrado'}</span>
                        </div>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ display: 'block', fontSize: '12px', color: textSecundario, textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px' }}>Endereço</span>
                        <span style={{ fontSize: '14px', color: textColor, fontWeight: '500' }}>{clinica.endereco ? `${clinica.endereco}, ` : ''}{clinica.bairro}, {clinica.cidade} - {clinica.estado}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '140px' }}>
                    <button className="premium-btn" style={{ color: '#0f172a', padding: '10px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', width: '100%', backgroundColor: '#f59e0b', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirModalEdicao(clinica)}>
                      <span style={{ filter: sombraEmoji }}>✏️</span> Editar
                    </button>
                    <button className="premium-btn" style={{ color: 'white', padding: '10px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', width: '100%', backgroundColor: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { setIdParaExcluir(clinica.id_clinica); setModalExclusaoOpen(true); }}>
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
          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, boxSizing: 'border-box' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEdicao ? <><span style={{ filter: sombraEmoji }}>✏️</span> Editar Clínica</> : <><span style={{ filter: sombraEmoji }}>🏥</span> Cadastrar Nova Clínica</>}
            </h3>
            
            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Nome Fantasia:</label>
                <input type="text" className="premium-input" value={formDados.nome_fantasia} onChange={e => setFormDados({...formDados, nome_fantasia: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>CNPJ:</label>
                  <input type="text" className="premium-input" value={formDados.cnpj} onChange={handleCNPJChange} placeholder="00.000.000/0000-00" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Telefone:</label>
                  <input type="tel" className="premium-input" value={formDados.telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Endereço (Rua, Av, Número):</label>
                <input type="text" className="premium-input" value={formDados.endereco} onChange={e => setFormDados({...formDados, endereco: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>UF:</label>
                  <input type="text" className="premium-input" maxLength="2" value={formDados.estado} onChange={handleEstadoChange} placeholder="Ex: PA" required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Cidade:</label>
                  <input type="text" className="premium-input" value={formDados.cidade} onChange={e => setFormDados({...formDados, cidade: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Bairro:</label>
                  <input type="text" className="premium-input" value={formDados.bairro} onChange={e => setFormDados({...formDados, bairro: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" className="premium-btn" style={{ color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#10b981', flex: 1, margin: 0, fontSize: '15px' }}>Salvar Dados</button>
                <button type="button" className="premium-btn" style={{ color: 'white', padding: '14px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', backgroundColor: '#64748b', flex: 1, margin: 0, fontSize: '15px' }} onClick={fecharModais}>Cancelar</button>
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
          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', textAlign: 'center', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', color: textColor, border: altoContraste ? '2px solid #dc2626' : `1px solid ${borderColor}`, boxSizing: 'border-box' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isEscuro ? '#7f1d1d' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>
              ⚠️
            </div>
            <h3 style={{ color: isEscuro ? '#f87171' : '#dc2626', marginTop: 0, fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Atenção!</h3>
            <p style={{ color: textColor, fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>Confirma a exclusão desta clínica? Certifique-se de que não há usuários vinculados a ela.</p>
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