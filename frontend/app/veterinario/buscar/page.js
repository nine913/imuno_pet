"use client";

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

  useEffect(() => {
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

  const carregarEspecies = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/especies');
      if (res.ok) setEspecies(await res.json());
    } catch (e) {}
  };

  const carregarTutores = async (id_clinica) => {
    try {
      let url = 'http://localhost:3000/listar-tutores';
      if (id_clinica) {
        url += `?id_clinica=${id_clinica}`;
      }
      const res = await fetch(url);
      if (res.ok) setTutores(await res.json());
    } catch (e) {}
  };

  const buscarAnimais = async (clinicaId = null) => {
    const id = clinicaId || (usuario ? usuario.id_clinica : null);
    let url = `http://localhost:3000/animais?termo=${termoBusca}`;
    
    if (id) {
      url += `&id_clinica=${id}`;
    }

    try {
      const res = await fetch(url);
      if (res.ok) {
        setAnimais(await res.json());
      }
    } catch (err) {}
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
        const res = await fetch(`http://localhost:3000/admin/racas?id_especie=${especieEncontrada.id_especie}`);
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
      const res = await fetch(`http://localhost:3000/admin/racas?id_especie=${value}`);
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

    let url = 'http://localhost:3000/cadastrar-animal';
    let metodo = 'POST';

    if (isEdicao) {
      url = `http://localhost:3000/editar-animal/${formDados.id_animal}`;
      metodo = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formDados, id_usuario_log: usuario.id_usuario }) 
      });
      const dados = await res.json();

      if (res.ok) {
        setMensagemForm({ texto: dados.mensagem || 'Operação realizada com sucesso!', cor: 'green' });
        setTimeout(() => {
          setModalFormOpen(false);
          buscarAnimais();
        }, 1500);
      } else {
        setMensagemForm({ texto: dados.erro || 'Erro ao processar requisição.', cor: 'red' });
      }
    } catch (err) {
      setMensagemForm({ texto: 'Erro de conexão com o servidor.', cor: 'red' });
    }
  };

  const abrirModalDelete = (id, nome) => {
    setAnimalToDelete({ id, nome });
    setModalDeleteOpen(true);
  };

  const confirmarDelecao = async () => {
    if (!animalToDelete) return;
    try {
      const res = await fetch(`http://localhost:3000/deletar-animal/${animalToDelete.id}`, {
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
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ margin: 0, color: headerColor }}>Buscar e Gerenciar Pacientes</h2>
            <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={abrirModalCadastro}>
              + Novo Paciente
            </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarAnimais()}
            placeholder="Pesquisar por nome do pet ou CPF do tutor..."
            style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit', margin: 0, flex: 1 }}
          />
          <button style={{ backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: 'auto', margin: 0, fontSize: 'inherit' }} onClick={() => buscarAnimais()}>Pesquisar</button>
        </div>

        <div>
          {animais.length === 0 ? <p style={{ color: textSecundario }}>Nenhum paciente encontrado na sua clínica.</p> : animais.map((animal, idx) => (
            <div key={`animal-${animal.id_animal || idx}`} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginBottom: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: headerColor }}>🐾 {animal.nome || animal.nome_animal}</h3>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Tutor:</strong> {animal.nome_tutor} (CPF: {animal.cpf})</p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <p style={{ margin: '5px 0', color: textSecundario }}><strong>Espécie:</strong> {animal.especie}</p>
                  <p style={{ margin: '5px 0', color: textSecundario }}><strong>Raça:</strong> {animal.raca || 'Não informada'}</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <p style={{ margin: '5px 0', color: textSecundario }}><strong>Porte:</strong> {animal.porte || 'Não informado'}</p>
                  <p style={{ margin: '5px 0', color: textSecundario }}><strong>Fase:</strong> {animal.fase_vida || 'Não informada'}</p>
                </div>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Nascimento:</strong> {animal.data_nascimento ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
                <button style={{ color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: 'inherit', backgroundColor: '#17a2b8' }} onClick={() => router.push(`/veterinario/historico?id=${animal.id_animal}`)}>📜 Histórico</button>
                <button style={{ color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: 'inherit', backgroundColor: '#28a745' }} onClick={() => router.push(`/veterinario/vacinar?id=${animal.id_animal}`)}>💉 Vacinar</button>
                <button style={{ color: '#333', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: 'inherit', backgroundColor: '#ffc107' }} onClick={() => abrirModalEdicao(animal)}>✏️ Editar</button>
                <button style={{ color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: 'inherit', backgroundColor: '#dc3545' }} onClick={() => abrirModalDelete(animal.id_animal, animal.nome || animal.nome_animal)}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}` }}>
            <h3 style={{ marginTop: 0, color: headerColor, marginBottom: '20px' }}>{isEdicao ? '✏️ Editar Paciente' : 'Cadastrar Novo Paciente'}</h3>
            <form onSubmit={submitForm}>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Tutor do Paciente:</label>
              <select 
                value={formDados.id_tutor} 
                onChange={e => setFormDados({...formDados, id_tutor: e.target.value})} 
                required 
                style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}
              >
                <option value="">Selecione o tutor...</option>
                {tutores.map((tutor, idx) => (
                  <option key={`tutor-${tutor.id_tutor || idx}`} value={tutor.id_tutor}>
                    {tutor.nome_completo} (CPF: {tutor.cpf})
                  </option>
                ))}
              </select>

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Nome do Paciente:</label>
              <input type="text" value={formDados.nome} onChange={e => setFormDados({...formDados, nome: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Espécie:</label>
                  <select value={idEspecieSel} onChange={handleEspecieChange} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                    <option value="">Selecione...</option>
                    {especies.map((e, idx) => (
                      <option key={`esp-${e.id_especie || idx}`} value={String(e.id_especie)}>{e.nome_especie}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Raça:</label>
                  <select value={formDados.raca} onChange={e => setFormDados({...formDados, raca: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} disabled={!idEspecieSel}>
                    <option value="">Selecione...</option>
                    {racas.map((r, idx) => (
                      <option key={`raca-${r.id_raca || idx}`} value={String(r.nome_raca)}>{r.nome_raca}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Porte:</label>
                  <select value={formDados.porte} onChange={e => setFormDados({...formDados, porte: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                    <option value="">Selecione...</option>
                    <option value="PEQUENO">Pequeno</option>
                    <option value="MEDIO">Médio</option>
                    <option value="GRANDE">Grande</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Fase da Vida:</label>
                  <select value={formDados.fase_vida} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: isEscuro ? '#444' : '#e9ecef', color: textColor, fontSize: 'inherit' }} disabled>
                    <option value="">Automático</option>
                    <option value="FILHOTE">Filhote</option>
                    <option value="ADULTO">Adulto</option>
                    <option value="IDOSO">Idoso</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Data de Nascimento:</label>
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

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, margin: 0, fontSize: 'inherit' }}>{isEdicao ? 'Salvar Alterações' : 'Cadastrar'}</button>
                <button type="button" onClick={() => setModalFormOpen(false)} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, margin: 0, width: 'auto', fontSize: 'inherit' }}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalDeleteOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ marginTop: 0, color: '#dc3545' }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Tem certeza que deseja excluir o paciente <strong>{animalToDelete?.nome}</strong>?</p>
            <p style={{ fontSize: '0.9em', color: textSecundario }}>O histórico de vacinas e todos os registros associados também serão apagados permanentemente.</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={confirmarDelecao} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, margin: 0, fontSize: 'inherit' }}>Sim, excluir</button>
              <button onClick={() => setModalDeleteOpen(false)} style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, margin: 0, width: 'auto', fontSize: 'inherit' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}