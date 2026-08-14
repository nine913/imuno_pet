"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function CadastrarTutor() {
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  const [idEspecieSel, setIdEspecieSel] = useState('');

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [formDados, setFormDados] = useState({
    email: '',
    senha: '',
    nome_completo: '',
    cpf: '',
    telefone: '',
    estado: '',
    cidade: '',
    bairro: '',
    nome_pet: '',
    especie: '',
    raca: '',
    data_nascimento: '',
    porte: '',
    fase_vida: ''
  });
  const [msg, setMsg] = useState({ texto: '', cor: '' });

  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      const user = JSON.parse(saved);
      setUsuario(user);

      const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
      if (configSalvas) {
        const config = JSON.parse(configSalvas);
        setTema(config.tema || 'claro');
        setAltoContraste(config.altoContraste || false);
      }
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (usuario) {
      carregarEspecies();
    }
  }, [usuario]);

  const carregarEspecies = async () => {
    try {
      const res = await apiFetch('/admin/especies');
      if (res.ok) setEspecies(await res.json());
    } catch (e) {}
  };

  const handleEspecieChange = async (e) => {
    const value = e.target.value;
    setIdEspecieSel(value);
    
    if (!value) {
      setRacas([]);
      setFormDados({ ...formDados, especie: '', raca: '' });
      return;
    }

    const especieObjeto = especies.find(esp => String(esp.id_especie) === String(value));
    const nomeEspecie = especieObjeto ? especieObjeto.nome_especie : '';

    setFormDados({ ...formDados, especie: nomeEspecie, raca: '' });

    try {
      const res = await apiFetch(`/admin/racas?id_especie=${value}`);
      if (res.ok) setRacas(await res.json());
    } catch (err) {}
  };

  const formatarCPF = (valor) => {
    let v = valor.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return v;
  };

  const formatarTelefone = (valor) => {
    let v = valor.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    return v;
  };

  const formatarEstado = (valor) => {
    return valor.replace(/[^a-zA-Z]/g, "").toUpperCase();
  };

  const calcularFaseVida = (data) => {
    if (!data) return '';
    const hojeData = new Date();
    const nasc = new Date(data);
    let idade = hojeData.getFullYear() - nasc.getFullYear();
    const m = hojeData.getMonth() - nasc.getMonth();
    
    if (m < 0 || (m === 0 && hojeData.getDate() < nasc.getDate())) {
      idade--;
    }
    
    if (idade < 1) return 'FILHOTE';
    if (idade >= 1 && idade < 8) return 'ADULTO';
    return 'IDOSO';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formDados.data_nascimento > hoje) {
      setMsg({ texto: 'A data de nascimento não pode ser no futuro.', cor: '#ef4444' });
      return;
    }

    try {
      const res = await apiFetch('/cadastrar-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formDados, id_usuario_log: usuario.id_usuario })
      });
      const dados = await res.json();
      if (res.ok) {
        setMsg({ texto: 'Tutor e Pet cadastrados com sucesso!', cor: '#10b981' });
        setTimeout(() => router.back(), 2000);
      } else {
        setMsg({ texto: dados.erro || 'Erro ao cadastrar.', cor: '#ef4444' });
      }
    } catch (err) {
      setMsg({ texto: 'Erro de conexão.', cor: '#ef4444' });
    }
  };

  if (!isMounted || !usuario) return null;

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
      `}</style>

      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '32px' }}>
          <button className="premium-btn" style={{ padding: '10px 16px', color: '#475569', border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', fontSize: '14px', backgroundColor: bgCard, fontWeight: '600' }} onClick={() => router.back()}>
            ← Voltar
          </button>
          <h2 style={{ color: headerColor, margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Cadastrar Tutor e Pet</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ background: bgCard, padding: '32px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}` }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: headerColor, margin: '0 0 16px 0', borderBottom: `2px solid ${borderColor}`, paddingBottom: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: sombraEmoji }}>👨‍👩‍👧</span> Dados do Tutor
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Nome Completo:</label>
                <input type="text" className="premium-input" value={formDados.nome_completo} onChange={e => setFormDados({...formDados, nome_completo: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>CPF:</label>
                  <input type="text" className="premium-input" value={formDados.cpf} onChange={e => setFormDados({...formDados, cpf: formatarCPF(e.target.value)})} required maxLength="14" placeholder="000.000.000-00" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Telefone:</label>
                  <input type="tel" className="premium-input" value={formDados.telefone} onChange={e => setFormDados({...formDados, telefone: formatarTelefone(e.target.value)})} maxLength="15" placeholder="(00) 00000-0000" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ width: '100px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>UF:</label>
                  <input type="text" className="premium-input" maxLength="2" value={formDados.estado} onChange={e => setFormDados({...formDados, estado: formatarEstado(e.target.value)})} required placeholder="Ex: PA" style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Cidade:</label>
                  <input type="text" className="premium-input" value={formDados.cidade} onChange={e => setFormDados({...formDados, cidade: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Bairro:</label>
                  <input type="text" className="premium-input" value={formDados.bairro} onChange={e => setFormDados({...formDados, bairro: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>E-mail (Login):</label>
                  <input type="email" className="premium-input" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Senha de Acesso:</label>
                  <input type="password" className="premium-input" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ color: headerColor, margin: '0 0 16px 0', borderBottom: `2px solid ${borderColor}`, paddingBottom: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ filter: sombraEmoji }}>🐾</span> Dados do Pet
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Nome do Animal:</label>
                <input type="text" className="premium-input" value={formDados.nome_pet} onChange={e => setFormDados({...formDados, nome_pet: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Espécie:</label>
                  <select className="premium-input" value={idEspecieSel} onChange={handleEspecieChange} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                    <option value="">Selecione a espécie...</option>
                    {especies.map((e, index) => (
                      <option key={e.id_especie || `esp-${index}`} value={e.id_especie}>{e.nome_especie}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Raça:</label>
                  <select className="premium-input" value={formDados.raca} onChange={e => setFormDados({...formDados, raca: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} disabled={!idEspecieSel}>
                    <option value="">Selecione a raça...</option>
                    {racas.map((r, index) => (
                      <option key={r.id_raca || `raca-${index}`} value={r.nome_raca}>{r.nome_raca}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Porte:</label>
                  <select className="premium-input" value={formDados.porte} onChange={e => setFormDados({...formDados, porte: e.target.value})} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                    <option value="">Selecione...</option>
                    <option value="PEQUENO">Pequeno</option>
                    <option value="MEDIO">Médio</option>
                    <option value="GRANDE">Grande</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Fase da Vida:</label>
                  <select className="premium-input" value={formDados.fase_vida} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: isEscuro ? '#334155' : '#f1f5f9', color: textSecundario, fontSize: '14px', outline: 'none' }} disabled>
                    <option value="">Automático</option>
                    <option value="FILHOTE">Filhote</option>
                    <option value="ADULTO">Adulto</option>
                    <option value="IDOSO">Idoso</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Data de Nascimento:</label>
                <input 
                  type="date" 
                  className="premium-input"
                  value={formDados.data_nascimento} 
                  max={hoje}
                  onChange={e => {
                    const novaData = e.target.value;
                    setFormDados({
                      ...formDados, 
                      data_nascimento: novaData,
                      fase_vida: calcularFaseVida(novaData)
                    });
                  }} 
                  required 
                  style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
                />
              </div>
            </div>

            <button type="submit" className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '16px', borderRadius: '10px', cursor: 'pointer', width: '100%', fontWeight: '700', marginTop: '32px', fontSize: '16px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              Salvar Cadastros
            </button>
          </div>
          
          {msg.texto && (
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: msg.cor === '#10b981' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: msg.cor === '#10b981' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
              {msg.texto}
            </div>
          )}
        </form>
      </div>
    </LayoutPainel>
  );
}