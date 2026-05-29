"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function VetBuscar() {
  const [usuario, setUsuario] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [vacinasDisp, setVacinasDisp] = useState([]);
  
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroVacina, setFiltroVacina] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [erroBusca, setErroBusca] = useState('');

  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editDados, setEditDados] = useState({
    id_animal: '', id_tutor: '', nome_animal: '', especie: '', raca: '', data_nascimento: '',
    telefone: '', estado: '', cidade: '', bairro: ''
  });

  const [modalVacinaOpen, setModalVacinaOpen] = useState(false);
  const [vacinaDados, setVacinaDados] = useState({
    id_animal: '', nome_animal: '', id_vacina: '', status: 'APLICADA', data_aplicacao: '', data_proxima_dose: ''
  });
  const [msgVacina, setMsgVacina] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  const router = useRouter();
  const bottomRef = useRef(null);
  const hoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);
    carregarVacinasBase();
    buscarAnimais(user.id_clinica);
  }, [router]);

  const carregarVacinasBase = async () => {
    try {
      const res = await fetch('http://localhost:3000/vacinas');
      if (res.ok) {
        setVacinasDisp(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const buscarAnimais = async (id_clinica = usuario?.id_clinica) => {
    setErroBusca('');
    try {
      const res = await fetch(`http://localhost:3000/buscar-animais?termo=${termoBusca}&vacina=${filtroVacina}&status=${filtroStatus}`);
      if (res.ok) {
        setAnimais(await res.json());
      } else {
        setErroBusca('Erro ao buscar animais.');
      }
    } catch (error) {
      setErroBusca('Erro de conexão com o servidor.');
    }
  };

  const handleBuscarClick = () => {
    buscarAnimais();
  };

  const abrirModalEditar = async (idAnimal) => {
    try {
      const res = await fetch(`http://localhost:3000/detalhes-animal/${idAnimal}`);
      if (res.ok) {
        const dados = await res.json();
        setEditDados({
          id_animal: dados.id_animal,
          id_tutor: dados.id_tutor,
          nome_animal: dados.nome_animal,
          especie: dados.especie,
          raca: dados.raca || '',
          data_nascimento: dados.data_nascimento ? dados.data_nascimento.split('T')[0] : '',
          telefone: dados.telefone || '',
          estado: dados.estado || '',
          cidade: dados.cidade || '',
          bairro: dados.bairro || ''
        });
        setModalVacinaOpen(false);
        setModalEditarOpen(true);
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitEditar = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/editar-pet-tutor/${editDados.id_animal}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDados)
      });
      if (res.ok) {
        setModalEditarOpen(false);
        buscarAnimais();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModalVacina = (idAnimal, nomeAnimal) => {
    setVacinaDados({
      id_animal: idAnimal,
      nome_animal: nomeAnimal,
      id_vacina: '',
      status: 'APLICADA',
      data_aplicacao: '',
      data_proxima_dose: ''
    });
    setMsgVacina({ texto: '', cor: '' });
    setModalEditarOpen(false);
    setModalVacinaOpen(true);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const calcularProximaDose = (id_vac, dt_app) => {
    if (!id_vac || !dt_app) return '';
    const vacinaSelecionada = vacinasDisp.find(v => String(v.id_vacina) === String(id_vac));
    const intervalo = vacinaSelecionada ? parseInt(vacinaSelecionada.intervalo_doses_dias || 0) : 0;
    
    if (intervalo > 0) {
      const partes = dt_app.split('-');
      const dataBaseObj = new Date(partes[0], partes[1] - 1, partes[2]);
      dataBaseObj.setDate(dataBaseObj.getDate() + intervalo);
      const ano = dataBaseObj.getFullYear();
      const mes = String(dataBaseObj.getMonth() + 1).padStart(2, '0');
      const dia = String(dataBaseObj.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    }
    return '';
  };

  const handleChangeVacinaForm = (campo, valor) => {
    const novosDados = { ...vacinaDados, [campo]: valor };
    
    if (campo === 'status' && valor === 'PENDENTE') {
      novosDados.data_aplicacao = '';
    }
    
    if ((campo === 'id_vacina' || campo === 'data_aplicacao') && novosDados.status !== 'PENDENTE') {
      novosDados.data_proxima_dose = calcularProximaDose(novosDados.id_vacina, novosDados.data_aplicacao);
    }
    
    setVacinaDados(novosDados);
  };

  const submitVacina = async (e) => {
    e.preventDefault();
    const payload = {
      ...vacinaDados,
      id_usuario: usuario.id_usuario,
      id_clinica: usuario.id_clinica
    };

    try {
      const res = await fetch('http://localhost:3000/registrar-vacina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setMsgVacina({ texto: 'Registro salvo com sucesso!', cor: 'green' });
        setTimeout(() => {
          setModalVacinaOpen(false);
          buscarAnimais();
        }, 1500);
      } else {
        setMsgVacina({ texto: 'Erro ao registrar a vacina.', cor: 'red' });
      }
    } catch (error) {
      setMsgVacina({ texto: 'Erro de conexão com o servidor.', cor: 'red' });
    }
  };

  const confirmarExclusao = async () => {
    if (!idParaExcluir) return;
    try {
      const res = await fetch(`http://localhost:3000/deletar-animal/${idParaExcluir}`, { method: 'DELETE' });
      if (res.ok) {
        setModalExclusaoOpen(false);
        buscarAnimais();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!usuario) return <h2 style={{ padding: '20px' }}>Carregando...</h2>;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Painel</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#0056b3' }}>Buscar Animal</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => router.push('/veterinario/cadastrar-pet')}>
            + Cadastrar Novo Pet
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} placeholder="Digite o nome do pet, tutor ou CPF" style={{ ...styles.input, flex: 2 }} />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" value={filtroVacina} onChange={(e) => setFiltroVacina(e.target.value)} placeholder="Filtro opcional: Nome da Vacina" style={{ ...styles.input, flex: 1 }} />
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ ...styles.input, flex: 1 }}>
              <option value="">Status da Vacina: Todos</option>
              <option value="APLICADA">Aplicada</option>
              <option value="PENDENTE">Pendente (Agendada)</option>
              <option value="ATRASADA">Atrasada</option>
            </select>
            <button style={{ ...styles.btnPrimario, flex: 1 }} onClick={handleBuscarClick}>Aplicar Filtros e Pesquisar</button>
          </div>
        </div>

        <div>
          {erroBusca ? <p style={{ color: 'red' }}>{erroBusca}</p> : animais.length === 0 ? <p>Nenhum animal encontrado com estes critérios.</p> : null}
          {animais.map(animal => (
            <div key={animal.id_animal} style={styles.card}>
              <div>
                <h3 style={{ color: '#0056b3', marginTop: 0 }}>🐾 {animal.nome_animal} ({animal.especie} - {animal.raca})</h3>
                <p><strong>Tutor:</strong> {animal.nome_tutor} | <strong>CPF:</strong> {animal.cpf}</p>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button style={styles.btnAcao} onClick={() => abrirModalEditar(animal.id_animal)}>✏️ Editar</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#17a2b8' }} onClick={() => router.push(`/veterinario/historico?id=${animal.id_animal}`)}>📋 Histórico</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#ffc107', color: 'black' }} onClick={() => abrirModalVacina(animal.id_animal, animal.nome_animal)}>💉 Registrar Vacina</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#dc3545' }} onClick={() => { setIdParaExcluir(animal.id_animal); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>

        {modalEditarOpen && (
          <div style={styles.modalContent}>
            <h3 style={{ color: '#0056b3' }}>✏️ Editar Dados do Paciente e Tutor</h3>
            <form onSubmit={submitEditar}>
              <h4 style={{ marginBottom: '0' }}>Dados do Pet</h4>
              <div style={styles.grid2}>
                <input type="text" value={editDados.nome_animal} onChange={e => setEditDados({...editDados, nome_animal: e.target.value})} placeholder="Nome do Pet" required style={styles.input} />
                <input type="date" value={editDados.data_nascimento} max={hoje} onChange={e => setEditDados({...editDados, data_nascimento: e.target.value})} required style={styles.input} />
              </div>
              <div style={styles.grid2}>
                <input type="text" value={editDados.especie} onChange={e => setEditDados({...editDados, especie: e.target.value})} placeholder="Espécie" required style={styles.input} />
                <input type="text" value={editDados.raca} onChange={e => setEditDados({...editDados, raca: e.target.value})} placeholder="Raça" required style={styles.input} />
              </div>
              
              <h4 style={{ marginBottom: '0' }}>Dados de Contato do Tutor</h4>
              <input type="text" value={editDados.telefone} onChange={e => setEditDados({...editDados, telefone: e.target.value})} placeholder="Telefone do Tutor" required style={styles.input} />
              <div style={styles.grid2}>
                <input type="text" value={editDados.estado} onChange={e => setEditDados({...editDados, estado: e.target.value})} placeholder="Estado (UF)" required style={styles.input} />
                <input type="text" value={editDados.cidade} onChange={e => setEditDados({...editDados, cidade: e.target.value})} placeholder="Cidade" required style={styles.input} />
                <input type="text" value={editDados.bairro} onChange={e => setEditDados({...editDados, bairro: e.target.value})} placeholder="Bairro" required style={styles.input} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.btnAcao, width: '100%' }}>Salvar Alterações</button>
                <button type="button" style={{ ...styles.btnVoltar, margin: 0, width: '100%' }} onClick={() => setModalEditarOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {modalVacinaOpen && (
          <div style={styles.modalContent}>
            <h3 style={{ color: '#0056b3' }}>💉 Registrar Vacina para: {vacinaDados.nome_animal}</h3>
            <form onSubmit={submitVacina}>
              <label>Vacina:</label>
              <select value={vacinaDados.id_vacina} onChange={e => handleChangeVacinaForm('id_vacina', e.target.value)} required style={styles.input}>
                <option value="">Selecione a vacina...</option>
                {vacinasDisp.map(v => <option key={v.id_vacina} value={v.id_vacina}>{v.nome_vacina}</option>)}
              </select>

              <label>Status:</label>
              <select value={vacinaDados.status} onChange={e => handleChangeVacinaForm('status', e.target.value)} required style={styles.input}>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDENTE">Agendada (Pendente)</option>
              </select>

              <label>Data de Aplicação (se já aplicada):</label>
              <input type="date" max={hoje} value={vacinaDados.data_aplicacao} onChange={e => handleChangeVacinaForm('data_aplicacao', e.target.value)} disabled={vacinaDados.status === 'PENDENTE'} required={vacinaDados.status !== 'PENDENTE'} style={styles.input} />

              <label>Data da Próxima Dose / Vencimento:</label>
              <input type="date" min={hoje} value={vacinaDados.data_proxima_dose} onChange={e => handleChangeVacinaForm('data_proxima_dose', e.target.value)} required style={styles.input} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.btnAcao, width: '100%' }}>Salvar Registro</button>
                <button type="button" style={{ ...styles.btnVoltar, margin: 0, width: '100%' }} onClick={() => setModalVacinaOpen(false)}>Cancelar</button>
              </div>
            </form>
            {msgVacina.texto && <div style={{ fontWeight: 'bold', marginTop: '10px', textAlign: 'center', color: msgVacina.cor }}>{msgVacina.texto}</div>}
          </div>
        )}

        {modalExclusaoOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalConfirmBox}>
              <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
              <p>Tem certeza que deseja excluir este animal e todo o seu histórico de vacinas?</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={confirmarExclusao}>Sim, Excluir</button>
                <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '800px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', width: '100%' },
  btnPrimario: { padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' },
  btnAcao: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalContent: { backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px', marginTop: '20px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalConfirmBox: { background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', width: '300px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  grid2: { display: 'flex', gap: '15px' }
};