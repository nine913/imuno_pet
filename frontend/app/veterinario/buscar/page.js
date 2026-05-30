"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    id_tutor: ''
  });

  const [mensagemForm, setMensagemForm] = useState({ texto: '', cor: '' });

  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      setUsuario(JSON.parse(saved));
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (usuario) {
      if (usuario.perfil !== 'VETERINARIO' && usuario.perfil !== 'GESTOR_CLINICA' && usuario.perfil !== 'ADMINISTRADOR') {
        router.push('/dashboard');
      } else {
        carregarEspecies();
        carregarTutores();
        buscarAnimais();
      }
    }
  }, [usuario, router]);

  const carregarEspecies = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/especies');
      if (res.ok) setEspecies(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const carregarTutores = async () => {
    try {
      const res = await fetch('http://localhost:3000/tutores');
      if (res.ok) setTutores(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const buscarAnimais = async () => {
    try {
      const res = await fetch(`http://localhost:3000/animais?termo=${termoBusca}`);
      if (res.ok) {
        setAnimais(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
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
      id_tutor: ''
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = async (animal) => {
    setIsEdicao(true);
    const nomeCorreto = animal.nome || animal.nome_animal || '';
    const especieTexto = animal.especie || '';
    
    setFormDados({
      id_animal: animal.id_animal,
      nome: nomeCorreto,
      especie: especieTexto,
      raca: animal.raca || '',
      data_nascimento: animal.data_nascimento ? animal.data_nascimento.split('T')[0] : '',
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
    } catch (err) {
      console.error(err);
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
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
        body: JSON.stringify(formDados)
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
        method: 'DELETE'
      });
      if (res.ok) {
        setModalDeleteOpen(false);
        setAnimalToDelete(null);
        buscarAnimais();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isMounted || !usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Painel</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={styles.h2}>Buscar e Gerenciar Pacientes</h2>
            <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={abrirModalCadastro}>
              + Novo Paciente
            </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Pesquisar paciente..."
            style={{ ...styles.input, margin: 0, flex: 1, color: '#333' }}
          />
          <button style={{ ...styles.btnAcao, width: 'auto' }} onClick={buscarAnimais}>Pesquisar</button>
        </div>

        <div>
          {animais.length === 0 ? <p style={{color: '#333'}}>Nenhum paciente encontrado.</p> : animais.map(animal => (
            <div key={animal.id_animal} style={styles.card}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>🐾 {animal.nome || animal.nome_animal}</h3>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Tutor:</strong> {animal.nome_tutor} (CPF: {animal.cpf})</p>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Espécie:</strong> {animal.especie}</p>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Raça:</strong> {animal.raca || 'Não informada'}</p>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Nascimento:</strong> {animal.data_nascimento ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</p>
              </div>
              <div style={styles.actionGroup}>
                <button style={{ ...styles.btnCard, backgroundColor: '#17a2b8' }} onClick={() => router.push(`/veterinario/historico?id=${animal.id_animal}`)}>📜 Histórico</button>
                <button style={{ ...styles.btnCard, backgroundColor: '#28a745' }} onClick={() => router.push(`/veterinario/vacinar?id=${animal.id_animal}`)}>💉 Vacinar</button>
                <button style={{ ...styles.btnCard, backgroundColor: '#ffc107', color: '#333' }} onClick={() => abrirModalEdicao(animal)}>✏️ Editar</button>
                <button style={{ ...styles.btnCard, backgroundColor: '#dc3545' }} onClick={() => abrirModalDelete(animal.id_animal, animal.nome || animal.nome_animal)}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#333' }}>{isEdicao ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}</h3>
            <form onSubmit={submitForm}>
              
              <label style={styles.label}>Tutor do Paciente:</label>
              <select 
                value={formDados.id_tutor} 
                onChange={e => setFormDados({...formDados, id_tutor: e.target.value})} 
                required 
                style={styles.input}
                disabled={isEdicao}
              >
                <option value="">Selecione o tutor...</option>
                {tutores.map(tutor => (
                  <option key={tutor.id_tutor} value={tutor.id_tutor}>
                    {tutor.nome_completo} (CPF: {tutor.cpf})
                  </option>
                ))}
              </select>

              <label style={styles.label}>Nome do Paciente:</label>
              <input type="text" value={formDados.nome} onChange={e => setFormDados({...formDados, nome: e.target.value})} required style={styles.input} />

              <label style={styles.label}>Espécie:</label>
              <select value={idEspecieSel} onChange={handleEspecieChange} required style={styles.input}>
                <option value="">Selecione a espécie...</option>
                {especies.map((e, index) => (
                  <option key={e.id_especie || `esp-${index}`} value={String(e.id_especie)}>{e.nome_especie}</option>
                ))}
              </select>

              <label style={styles.label}>Raça:</label>
              <select value={formDados.raca} onChange={e => setFormDados({...formDados, raca: e.target.value})} required style={styles.input} disabled={!idEspecieSel}>
                <option value="">Selecione a raça...</option>
                {racas.map((r, index) => (
                  <option key={r.id_raca || `raca-${index}`} value={String(r.nome_raca)}>{r.nome_raca}</option>
                ))}
              </select>

              <label style={styles.label}>Data de Nascimento:</label>
              <input type="date" value={formDados.data_nascimento} onChange={e => setFormDados({...formDados, data_nascimento: e.target.value})} required style={styles.input} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.btnAcao, flex: 1, margin: 0 }}>{isEdicao ? 'Salvar Alterações' : 'Cadastrar'}</button>
                <button type="button" onClick={() => setModalFormOpen(false)} style={{ ...styles.btnVoltar, flex: 1, margin: 0 }}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalDeleteOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#dc3545' }}>Confirmar Exclusão</h3>
            <p style={{ color: '#333' }}>Tem certeza que deseja excluir o paciente <strong>{animalToDelete?.nome}</strong>?</p>
            <p style={{ fontSize: '14px', color: '#333' }}>O histórico de vacinas e todos os registros associados também serão apagados permanentemente.</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={confirmarDelecao} style={{ ...styles.btnAcao, backgroundColor: '#dc3545', flex: 1, margin: 0 }}>Sim, excluir</button>
              <button onClick={() => setModalDeleteOpen(false)} style={{ ...styles.btnVoltar, flex: 1, margin: 0 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '900px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#000000', margin: 0 },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '8px 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#333' },
  label: { fontWeight: 'bold', color: '#333', fontSize: '14px' },
  btnAcao: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnCard: { color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  card: { border: '1px solid #e3e3e3', padding: '20px', borderRadius: '8px', marginBottom: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' },
  actionGroup: { display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }
};