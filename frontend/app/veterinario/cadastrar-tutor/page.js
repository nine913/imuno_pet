"use client";

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
      const res = await fetch('http://localhost:3000/admin/especies');
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
      const res = await fetch(`http://localhost:3000/admin/racas?id_especie=${value}`);
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
      setMsg({ texto: 'A data de nascimento não pode ser no futuro.', cor: 'red' });
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/cadastrar-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formDados, id_usuario_log: usuario.id_usuario })
      });
      const dados = await res.json();
      if (res.ok) {
        setMsg({ texto: 'Tutor e Pet cadastrados com sucesso!', cor: 'green' });
        setTimeout(() => router.back(), 2000);
      } else {
        setMsg({ texto: dados.erro || 'Erro ao cadastrar.', cor: 'red' });
      }
    } catch (err) {
      setMsg({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  if (!isMounted || !usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');
  const sectionBorder = isEscuro ? '#444' : '#e9ecef';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto', color: textColor }}>
        <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: altoContraste ? '3px solid #ffcc00' : 'none' }}>
          
          <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Cadastrar Tutor e Pet</h2>

          <form onSubmit={handleSubmit}>
            <h3 style={{ color: headerColor, marginTop: '25px', borderBottom: `2px solid ${sectionBorder}`, paddingBottom: '5px' }}>👨‍👩‍👧 Dados do Tutor</h3>
            
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Nome Completo:</label>
            <input type="text" value={formDados.nome_completo} onChange={e => setFormDados({...formDados, nome_completo: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>CPF:</label>
                <input 
                  type="text" 
                  value={formDados.cpf} 
                  onChange={e => setFormDados({...formDados, cpf: formatarCPF(e.target.value)})} 
                  required 
                  maxLength="14"
                  placeholder="000.000.000-00"
                  style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Telefone:</label>
                <input 
                  type="tel" 
                  value={formDados.telefone} 
                  onChange={e => setFormDados({...formDados, telefone: formatarTelefone(e.target.value)})} 
                  maxLength="15"
                  placeholder="(00) 00000-0000"
                  style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Estado (UF):</label>
                <input 
                  type="text" 
                  maxLength="2" 
                  value={formDados.estado} 
                  onChange={e => setFormDados({...formDados, estado: formatarEstado(e.target.value)})} 
                  required 
                  placeholder="Ex: PA"
                  style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Cidade:</label>
                <input type="text" value={formDados.cidade} onChange={e => setFormDados({...formDados, cidade: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              </div>
            </div>

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Bairro:</label>
            <input type="text" value={formDados.bairro} onChange={e => setFormDados({...formDados, bairro: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>E-mail (Login do Tutor):</label>
            <input type="email" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Senha de Acesso:</label>
            <input type="password" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

            <h3 style={{ color: headerColor, marginTop: '25px', borderBottom: `2px solid ${sectionBorder}`, paddingBottom: '5px' }}>🐾 Dados do Pet</h3>

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Nome do Animal:</label>
            <input type="text" value={formDados.nome_pet} onChange={e => setFormDados({...formDados, nome_pet: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Espécie:</label>
                <select value={idEspecieSel} onChange={handleEspecieChange} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                  <option value="">Selecione a espécie...</option>
                  {especies.map((e, index) => (
                    <option key={e.id_especie || `esp-${index}`} value={e.id_especie}>{e.nome_especie}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Raça:</label>
                <select value={formDados.raca} onChange={e => setFormDados({...formDados, raca: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} disabled={!idEspecieSel}>
                  <option value="">Selecione a raça...</option>
                  {racas.map((r, index) => (
                    <option key={r.id_raca || `raca-${index}`} value={r.nome_raca}>{r.nome_raca}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Porte:</label>
                <select value={formDados.porte} onChange={e => setFormDados({...formDados, porte: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                  <option value="">Selecione...</option>
                  <option value="PEQUENO">Pequeno</option>
                  <option value="MEDIO">Médio</option>
                  <option value="GRANDE">Grande</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Fase da Vida:</label>
                <select value={formDados.fase_vida} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: sectionBorder, color: textColor, fontSize: 'inherit' }} disabled>
                  <option value="">Automático</option>
                  <option value="FILHOTE">Filhote</option>
                  <option value="ADULTO">Adulto</option>
                  <option value="IDOSO">Idoso</option>
                </select>
              </div>
            </div>

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Data de Nascimento:</label>
            <input 
              type="date" 
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
              style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
            />

            <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', marginTop: '20px', fontSize: 'inherit' }}>
              Salvar Cadastros
            </button>
          </form>

          {msg.texto && <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: msg.cor }}>{msg.texto}</div>}
        </div>
      </div>
    </LayoutPainel>
  );
}