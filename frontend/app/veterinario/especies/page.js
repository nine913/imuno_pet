"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function VetEspeciesRacas() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  
  const [novaEspecie, setNovaEspecie] = useState('');
  const [formRaca, setFormRaca] = useState({ id_especie: '', nome_raca: '' });
  
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState({ tipo: '', id: null, nome: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (!saved) {
        router.push('/');
        return;
      }
      const user = JSON.parse(saved);
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
    }
  }, [router]);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario]);

  const carregarDados = async () => {
    try {
      const resEspecies = await apiFetch('/admin/especies');
      if (resEspecies.ok) setEspecies(await resEspecies.json());

      const resRacas = await apiFetch('/admin/racas');
      if (resRacas.ok) setRacas(await resRacas.json());
    } catch (erro) {}
  };

  const cadastrarEspecie = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/cadastrar-especie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_especie: novaEspecie, id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        setNovaEspecie('');
        carregarDados();
        mostrarMensagem('Espécie cadastrada com sucesso!', '#10b981');
      } else {
        mostrarMensagem('Erro ao cadastrar.', '#ef4444');
      }
    } catch (error) {
      mostrarMensagem('Erro de conexão.', '#ef4444');
    }
  };

  const cadastrarRaca = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/cadastrar-raca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formRaca, id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        setFormRaca({ ...formRaca, nome_raca: '' });
        carregarDados();
        mostrarMensagem('Raça cadastrada com sucesso!', '#10b981');
      } else {
        mostrarMensagem('Erro ao cadastrar.', '#ef4444');
      }
    } catch (error) {
      mostrarMensagem('Erro de conexão.', '#ef4444');
    }
  };

  const abrirModalDeletarEspecie = (especie) => {
    setItemParaExcluir({ tipo: 'especie', id: especie.id_especie, nome: especie.nome_especie });
    setModalExclusaoOpen(true);
  };

  const abrirModalDeletarRaca = (raca) => {
    setItemParaExcluir({ tipo: 'raca', id: raca.id_raca, nome: raca.nome_raca });
    setModalExclusaoOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir.id) return;
    try {
      const endpoint = itemParaExcluir.tipo === 'especie' 
        ? `/admin/deletar-especie/${itemParaExcluir.id}`
        : `/admin/deletar-raca/${itemParaExcluir.id}`;

      const res = await apiFetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      
      if (res.ok) {
        carregarDados();
        setModalExclusaoOpen(false);
        setItemParaExcluir({ tipo: '', id: null, nome: '' });
      } else {
        mostrarMensagem('Erro ao deletar.', '#ef4444');
        setModalExclusaoOpen(false);
      }
    } catch (error) {
      mostrarMensagem('Erro ao deletar.', '#ef4444');
      setModalExclusaoOpen(false);
    }
  };

  const mostrarMensagem = (texto, cor) => {
    setMensagem({ texto, cor });
    setTimeout(() => setMensagem({ texto: '', cor: '' }), 3000);
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
        .premium-list-item {
          transition: background-color 0.2s ease;
        }
        .premium-list-item:hover {
          background-color: ${isEscuro ? '#0f172a' : '#f8fafc'};
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '8px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Catálogo de Espécies e Raças</h2>
          <p style={{ color: textSecundario, fontSize: '15px', margin: 0 }}>Gerencie as espécies e raças disponíveis para cadastro no sistema.</p>
        </div>

        {mensagem.texto && (
          <div style={{ marginBottom: '24px', padding: '12px', borderRadius: '8px', backgroundColor: mensagem.cor === '#10b981' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: mensagem.cor === '#10b981' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
            {mensagem.texto}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: sombraEmoji }}>🐈</span> Adicionar Espécie
            </h3>
            <form onSubmit={cadastrarEspecie} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="premium-input"
                value={novaEspecie} 
                onChange={(e) => setNovaEspecie(e.target.value)} 
                placeholder="Ex: Pássaro" 
                required 
                style={{ flex: 1, padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
              />
              <button type="submit" className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Salvar</button>
            </form>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px', borderTop: `1px solid ${borderColor}` }}>
              {especies.map(e => (
                <li key={e.id_especie} className="premium-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: `1px solid ${borderColor}` }}>
                  <span style={{ color: textColor, fontWeight: '600', fontSize: '15px' }}>{e.nome_especie}</span>
                  <button className="premium-btn" onClick={() => abrirModalDeletarEspecie(e)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px 12px', fontWeight: '600', fontSize: '12px' }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '20px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: sombraEmoji }}>🐕</span> Adicionar Raça
            </h3>
            <form onSubmit={cadastrarRaca} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select 
                className="premium-input"
                value={formRaca.id_especie} 
                onChange={(e) => setFormRaca({...formRaca, id_especie: e.target.value})} 
                required 
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
              >
                <option value="">Selecione a Espécie...</option>
                {especies.map(e => <option key={e.id_especie} value={e.id_especie}>{e.nome_especie}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  className="premium-input"
                  value={formRaca.nome_raca} 
                  onChange={(e) => setFormRaca({...formRaca, nome_raca: e.target.value})} 
                  placeholder="Nome da Raça" 
                  required 
                  style={{ flex: 1, padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
                />
                <button type="submit" className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Salvar</button>
              </div>
            </form>
            
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '24px', borderTop: `1px solid ${borderColor}`, maxHeight: '400px', overflowY: 'auto' }}>
              {racas.map(r => (
                <li key={r.id_raca} className="premium-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderBottom: `1px solid ${borderColor}` }}>
                  <div>
                    <span style={{ color: textColor, fontWeight: '600', fontSize: '15px', display: 'block' }}>{r.nome_raca}</span>
                    <span style={{ color: textSecundario, fontSize: '12px', fontWeight: '500' }}>{r.nome_especie}</span>
                  </div>
                  <button className="premium-btn" onClick={() => abrirModalDeletarRaca(r)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px 12px', fontWeight: '600', fontSize: '12px' }}>Excluir</button>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: altoContraste ? '2px solid #dc2626' : `1px solid ${borderColor}`, color: textColor, boxSizing: 'border-box' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isEscuro ? '#7f1d1d' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>
              ⚠️
            </div>
            
            <h3 style={{ marginTop: 0, color: isEscuro ? '#f87171' : '#dc2626', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Excluir Registro</h3>
            
            <p style={{ color: textColor, fontSize: '15px', marginBottom: '8px' }}>
              Tem certeza que deseja excluir a {itemParaExcluir.tipo === 'especie' ? 'espécie' : 'raça'} <strong>{itemParaExcluir.nome}</strong>?
            </p>

            {itemParaExcluir.tipo === 'especie' && (
              <p style={{ fontSize: '13px', color: isEscuro ? '#fca5a5' : '#b91c1c', margin: '0 0 24px 0', lineHeight: '1.5', fontWeight: '600' }}>
                Isso apagará automaticamente todas as raças vinculadas a ela!
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="premium-btn" onClick={confirmarExclusao} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '14px' }}>Sim, Excluir</button>
              <button className="premium-btn" onClick={() => setModalExclusaoOpen(false)} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '14px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}