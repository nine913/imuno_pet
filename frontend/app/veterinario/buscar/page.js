"use client";

import { apiFetch } from '../../lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function BuscarAnimal() {
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [animais, setAnimais] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');

  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [idEspecieSel, setIdEspecieSel] = useState('');

  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [isEdicao, setIsEdicao] = useState(false);
  const [formDados, setFormDados] = useState({
    id_animal: '',
    nome: '',
    especie: '',
    raca: '',
    data_nascimento: '',
    porte: '',
    fase_vida: '',
    id_tutor: ''
  });

  const [mensagemForm, setMensagemForm] = useState({ texto: '', cor: '' });

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const hoje = new Date().toISOString().split('T')[0];

  const carregarEspecies = async () => {
    try {
      const res = await apiFetch('/admin/especies');
      if (res.ok) setEspecies(await res.json());
    } catch (e) {}
  };

  const carregarTutores = async (id_clinica) => {
    try {
      let url = '/listar-tutores';
      if (id_clinica) {
        url += `?id_clinica=${id_clinica}`;
      }
      const res = await apiFetch(url);
      if (res.ok) setTutores(await res.json());
    } catch (e) {}
  };

  const buscarAnimais = async (clinicaId = null) => {
    const id = clinicaId || (usuario ? usuario.id_clinica : null);
    let url = `/animais?termo=${termoBusca}`;

    if (id) {
      url += `&id_clinica=${id}`;
    }

    try {
      const res = await apiFetch(url);
      if (res.ok) {
        setAnimais(await res.json());
      }
    } catch (err) {}
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinaliza que já passamos da hidratação (evita mismatch de SSR); é o próprio propósito deste effect
    setIsMounted(true);
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      const user = JSON.parse(saved);
      setUsuario(user);
      if (user.perfil !== 'VETERINARIO' && user.perfil !== 'GESTOR_CLINICA' && user.perfil !== 'ADMINISTRADOR') {
        router.push('/dashboard');
      } else {
        carregarEspecies();
        carregarTutores(user.id_clinica);
        buscarAnimais(user.id_clinica);
      }
    } else {
      router.push('/');
    }

    const configSalvas = localStorage.getItem(`imunoPetConfig_${JSON.parse(saved)?.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
  }, [router]);

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

  const abrirModalCadastro = () => {
    setIsEdicao(false);
    setIdEspecieSel('');
    setRacas([]);
    setFormDados({
      id_animal: '',
      nome: '',
      especie: '',
      raca: '',
      data_nascimento: '',
      porte: '',
      fase_vida: '',
      id_tutor: ''
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = async (animal) => {
    setIsEdicao(true);
    const nomeCorreto = animal.nome || animal.nome_animal || '';
    const especieTexto = animal.especie || '';
    const dataNascimentoFomatada = animal.data_nascimento ? animal.data_nascimento.split('T')[0] : '';
    
    setFormDados({
      id_animal: animal.id_animal,
      nome: nomeCorreto,
      especie: especieTexto,
      raca: animal.raca || '',
      data_nascimento: dataNascimentoFomatada,
      porte: animal.porte || '',
      fase_vida: animal.fase_vida || calcularFaseVida(dataNascimentoFomatada),
      id_tutor: animal.id_tutor || ''
    });
    setMensagemForm({ texto: '', cor: '' });

    const normalizar = (str) => String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const especieEncontrada = especies.find(e => 
      normalizar(e.nome_especie) === normalizar(especieTexto) || String(e.id_especie) === String(especieTexto)
    );
    
    if (especieEncontrada) {
      setIdEspecieSel(String(especieEncontrada.id_especie));
      
      try {
        const res = await apiFetch(`/admin/racas?id_especie=${especieEncontrada.id_especie}`);
        if (res.ok) setRacas(await res.json());
      } catch (err) {}
    } else {
      setIdEspecieSel('');
      setRacas([]);
    }

    setModalFormOpen(true);
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

  const submitForm = async (e) => {
    e.preventDefault();

    if (formDados.data_nascimento > hoje) {
      setMensagemForm({ texto: 'A data de nascimento não pode ser no futuro.', cor: 'red' });
      return;
    }

    setMensagemForm({ texto: 'Processando...', cor: 'blue' });

    let url = '/cadastrar-animal';
    let metodo = 'POST';

    if (isEdicao) {
      url = `/editar-animal/${formDados.id_animal}`;
      metodo = 'PUT';
    }

    try {
      const res = await apiFetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formDados, id_usuario_log: usuario.id_usuario }) 
      });
      const dados = await res.json();

      if (res.ok) {
        setMensagemForm({ texto: dados.mensagem || 'Operação realizada com sucesso!', cor: '#10b981' });
        setTimeout(() => {
          setModalFormOpen(false);
          buscarAnimais();
        }, 1500);
      } else {
        setMensagemForm({ texto: dados.erro || 'Erro ao processar requisição.', cor: '#ef4444' });
      }
    } catch (err) {
      setMensagemForm({ texto: 'Erro de conexão com o servidor.', cor: '#ef4444' });
    }
  };

  const abrirModalDelete = (id, nome) => {
    setAnimalToDelete({ id, nome });
    setModalDeleteOpen(true);
  };

  const confirmarDelecao = async () => {
    if (!animalToDelete) return;
    try {
      const res = await apiFetch(`/deletar-animal/${animalToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        setModalDeleteOpen(false);
        setAnimalToDelete(null);
        buscarAnimais();
      }
    } catch (err) {}
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
        .premium-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '1100px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', color: headerColor, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Pacientes</h2>
              <p style={{ margin: 0, color: textSecundario, fontSize: '15px' }}>Busque ou gerencie os pacientes da clínica.</p>
            </div>
            <button className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={abrirModalCadastro}>
              <span style={{ fontSize: '18px' }}>+</span> Novo Paciente
            </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input
            type="text"
            className="premium-input"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarAnimais()}
            placeholder="Pesquisar por nome do pet ou CPF do tutor..."
            style={{ width: '100%', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '15px', margin: 0, flex: 1, outline: 'none', transition: 'all 0.2s' }}
          />
          <button className="premium-btn" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '0 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', width: 'auto', margin: 0, fontSize: '15px' }} onClick={() => buscarAnimais()}>Pesquisar</button>
        </div>

        <div>
          {animais.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🐕</span>
              Nenhum paciente encontrado na sua clínica.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {animais.map((animal, idx) => (
                <div key={`animal-${animal.id_animal || idx}`} className="premium-card" style={{ border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isEscuro ? '#1e3a8a' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', filter: sombraEmoji }}>🐾</div>
                      <h3 style={{ margin: 0, color: textColor, fontSize: '20px', fontWeight: '700' }}>{animal.nome || animal.nome_animal}</h3>
                    </div>
                    
                    <div style={{ backgroundColor: inputBg, padding: '12px 16px', borderRadius: '8px', border: `1px solid ${borderColor}`, marginBottom: '12px', display: 'inline-block' }}>
                      <span style={{ color: textSecundario, fontSize: '13px', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>Tutor Responsável</span>
                      <strong style={{ color: textColor, fontSize: '15px' }}>{animal.nome_tutor}</strong> <span style={{ color: textSecundario, fontSize: '14px' }}>(CPF: {animal.cpf})</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: textSecundario, backgroundColor: inputBg, padding: '6px 12px', borderRadius: '20px', border: `1px solid ${borderColor}`, fontWeight: '500' }}>
                        Espécie: <strong style={{ color: textColor }}>{animal.especie}</strong>
                      </span>
                      <span style={{ fontSize: '13px', color: textSecundario, backgroundColor: inputBg, padding: '6px 12px', borderRadius: '20px', border: `1px solid ${borderColor}`, fontWeight: '500' }}>
                        Raça: <strong style={{ color: textColor }}>{animal.raca || 'N/I'}</strong>
                      </span>
                      <span style={{ fontSize: '13px', color: textSecundario, backgroundColor: inputBg, padding: '6px 12px', borderRadius: '20px', border: `1px solid ${borderColor}`, fontWeight: '500' }}>
                        Fase: <strong style={{ color: textColor }}>{animal.fase_vida || 'N/I'}</strong>
                      </span>
                      <span style={{ fontSize: '13px', color: textSecundario, backgroundColor: inputBg, padding: '6px 12px', borderRadius: '20px', border: `1px solid ${borderColor}`, fontWeight: '500' }}>
                        Nasc: <strong style={{ color: textColor }}>{animal.data_nascimento ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</strong>
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
                    <button className="premium-btn" style={{ color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '14px', backgroundColor: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => router.push(`/veterinario/historico?id=${animal.id_animal}`)}>
                      <span style={{ filter: sombraEmoji }}>📜</span> Histórico
                    </button>
                    <button className="premium-btn" style={{ color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '14px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => router.push(`/veterinario/vacinar?id=${animal.id_animal}`)}>
                      <span style={{ filter: sombraEmoji }}>💉</span> Vacinar
                    </button>
                    <button className="premium-btn" style={{ color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '14px', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirModalEdicao(animal)}>
                      <span style={{ filter: sombraEmoji }}>✏️</span> Editar
                    </button>
                    <button className="premium-btn" style={{ color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '14px', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => abrirModalDelete(animal.id_animal, animal.nome || animal.nome_animal)}>
                      <span style={{ filter: sombraEmoji }}>🗑️</span> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, boxSizing: 'border-box' }}>
            <h3 style={{ marginTop: 0, color: headerColor, marginBottom: '24px', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEdicao ? <><span style={{ filter: sombraEmoji }}>✏️</span> Editar Paciente</> : '🐾 Cadastrar Novo Paciente'}
            </h3>
            
            <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Tutor do Paciente:</label>
                <select 
                  className="premium-input"
                  value={formDados.id_tutor} 
                  onChange={e => setFormDados({...formDados, id_tutor: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                >
                  <option value="">Selecione o tutor...</option>
                  {tutores.map((tutor, idx) => (
                    <option key={`tutor-${tutor.id_tutor || idx}`} value={tutor.id_tutor}>
                      {tutor.nome_completo} (CPF: {tutor.cpf})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Nome do Paciente:</label>
                <input type="text" className="premium-input" value={formDados.nome} onChange={e => setFormDados({...formDados, nome: e.target.value})} required style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Espécie:</label>
                  <select className="premium-input" value={idEspecieSel} onChange={handleEspecieChange} required style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                    <option value="">Selecione...</option>
                    {especies.map((e, idx) => (
                      <option key={`esp-${e.id_especie || idx}`} value={String(e.id_especie)}>{e.nome_especie}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Raça:</label>
                  <select className="premium-input" value={formDados.raca} onChange={e => setFormDados({...formDados, raca: e.target.value})} required style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} disabled={!idEspecieSel}>
                    <option value="">Selecione...</option>
                    {racas.map((r, idx) => (
                      <option key={`raca-${r.id_raca || idx}`} value={String(r.nome_raca)}>{r.nome_raca}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Porte:</label>
                  <select className="premium-input" value={formDados.porte} onChange={e => setFormDados({...formDados, porte: e.target.value})} required style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                    <option value="">Selecione...</option>
                    <option value="PEQUENO">Pequeno</option>
                    <option value="MEDIO">Médio</option>
                    <option value="GRANDE">Grande</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Fase da Vida:</label>
                  <select className="premium-input" value={formDados.fase_vida} required style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', boxSizing: 'border-box', backgroundColor: isEscuro ? '#334155' : '#f1f5f9', color: textSecundario, fontSize: '14px', outline: 'none' }} disabled>
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
                  style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '15px' }}>{isEdicao ? 'Salvar Alterações' : 'Cadastrar Paciente'}</button>
                <button type="button" className="premium-btn" onClick={() => setModalFormOpen(false)} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '15px' }}>Cancelar</button>
              </div>
            </form>

            {mensagemForm.texto && (
              <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: mensagemForm.cor === '#10b981' || mensagemForm.cor === 'green' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: mensagemForm.cor === '#10b981' || mensagemForm.cor === 'green' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                {mensagemForm.texto}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE DELEÇÃO */}
      {modalDeleteOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor, boxSizing: 'border-box' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: isEscuro ? '#7f1d1d' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>
              ⚠️
            </div>
            <h3 style={{ marginTop: 0, color: isEscuro ? '#f87171' : '#dc2626', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Excluir Paciente</h3>
            <p style={{ color: textColor, fontSize: '15px', marginBottom: '8px' }}>Tem certeza que deseja excluir <strong>{animalToDelete?.nome}</strong>?</p>
            <p style={{ fontSize: '13px', color: textSecundario, margin: '0 0 24px 0', lineHeight: '1.5' }}>O histórico de vacinas e todos os registros médicos associados a este paciente serão apagados permanentemente.</p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="premium-btn" onClick={confirmarDelecao} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '14px' }}>Sim, excluir</button>
              <button className="premium-btn" onClick={() => setModalDeleteOpen(false)} style={{ backgroundColor: '#64748b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', flex: 1, fontSize: '14px' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}