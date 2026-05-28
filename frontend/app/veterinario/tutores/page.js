"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VetTutores() {
  const [usuario, setUsuario] = useState(null);
  const [tutores, setTutores] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editDados, setEditDados] = useState({
    id_tutor: '', nome_completo: '', telefone: '', estado: '', cidade: '', bairro: ''
  });
  const [mensagemEditar, setMensagemEditar] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [tutorParaExcluir, setTutorParaExcluir] = useState(null);

  const [modalErroOpen, setModalErroOpen] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const router = useRouter();

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
    realizarBusca('');
  }, [router]);

  const realizarBusca = async (termo = termoBusca) => {
    try {
      const resposta = await fetch(`http://localhost:3000/listar-tutores?termo=${termo}`);
      if (resposta.ok) {
        setTutores(await resposta.json());
      } else {
        setTutores([]);
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    setEditDados({ ...editDados, telefone: v });
  };

  const handleEstadoChange = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setEditDados({ ...editDados, estado: v });
  };

  const abrirModalEditar = (tutor) => {
    setEditDados({
      id_tutor: tutor.id_tutor,
      nome_completo: tutor.nome_completo,
      telefone: tutor.telefone || '',
      estado: tutor.estado || '',
      cidade: tutor.cidade || '',
      bairro: tutor.bairro || ''
    });
    setMensagemEditar({ texto: '', cor: '' });
    setModalEditarOpen(true);
  };

  const submitEditar = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch(`http://localhost:3000/editar-tutor-dados/${editDados.id_tutor}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDados)
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setMensagemEditar({ texto: dados.mensagem, cor: 'green' });
        setTimeout(() => {
          setModalEditarOpen(false);
          realizarBusca();
        }, 1500);
      } else {
        setMensagemEditar({ texto: dados.erro, cor: 'red' });
      }
    } catch (erro) {
      setMensagemEditar({ texto: 'Erro ao salvar alterações.', cor: 'red' });
    }
  };

  const confirmarExclusao = async () => {
    if (!tutorParaExcluir) return;
    try {
      const resposta = await fetch(`http://localhost:3000/deletar-tutor/${tutorParaExcluir}`, {
        method: 'DELETE'
      });
      if (resposta.ok) {
        setModalExclusaoOpen(false);
        realizarBusca();
      } else {
        const dados = await resposta.json();
        setModalExclusaoOpen(false);
        setMensagemErro(dados.erro || 'Erro: tutor não pode ser excluído.');
        setModalErroOpen(true);
      }
    } catch (erro) {
      setModalExclusaoOpen(false);
      setMensagemErro('Erro ao conectar com o servidor.');
      setModalErroOpen(true);
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Painel</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#0056b3' }}>Consultar Tutores</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => router.push('/veterinario/cadastrar-tutor')}>
            + Cadastrar Novo Tutor
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} placeholder="Digite o nome, CPF ou E-mail" style={styles.input} />
          <button style={styles.btnBuscar} onClick={() => realizarBusca()}>Pesquisar</button>
        </div>

        <div>
          {tutores.length === 0 ? <p>Nenhum tutor encontrado.</p> : tutores.map(tutor => (
            <div key={tutor.id_tutor} style={styles.card}>
              <div style={{ flex: 1 }}>
                <strong>{tutor.nome_completo}</strong><br/>
                <span style={{ fontSize: '14px', color: '#555' }}>
                  <strong>CPF:</strong> {tutor.cpf} | <strong>Email:</strong> {tutor.email}<br/>
                  <strong>Telefone:</strong> {tutor.telefone}<br/>
                  <strong>Endereço:</strong> {tutor.bairro}, {tutor.cidade} - {tutor.estado}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button style={{ ...styles.btnAcao, backgroundColor: '#ffc107', color: '#333' }} onClick={() => abrirModalEditar(tutor)}>Editar Tutor</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#dc3545' }} onClick={() => { setTutorParaExcluir(tutor.id_tutor); setModalExclusaoOpen(true); }}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalEditarOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#0056b3', marginTop: 0 }}>Editar Tutor</h3>
            <form onSubmit={submitEditar}>
              <input type="text" value={editDados.nome_completo} onChange={e => setEditDados({...editDados, nome_completo: e.target.value})} placeholder="Nome Completo" required style={styles.input} />
              <input type="tel" value={editDados.telefone} onChange={handleTelefoneChange} placeholder="Telefone" required maxLength="15" style={styles.input} />
              <input type="text" value={editDados.estado} onChange={handleEstadoChange} placeholder="Estado (ex: PA)" required maxLength="2" style={styles.input} />
              <input type="text" value={editDados.cidade} onChange={e => setEditDados({...editDados, cidade: e.target.value})} placeholder="Cidade" required style={styles.input} />
              <input type="text" value={editDados.bairro} onChange={e => setEditDados({...editDados, bairro: e.target.value})} placeholder="Bairro" required style={styles.input} />
              
              <button type="submit" style={{ ...styles.btnAcao, marginTop: '10px' }}>Salvar Alterações</button>
              <button type="button" onClick={() => setModalEditarOpen(false)} style={{ ...styles.btnVoltar, width: '100%', margin: '10px 0 0 0' }}>Cancelar</button>
            </form>
            {mensagemEditar.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemEditar.cor }}>{mensagemEditar.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p>Deseja excluir este tutor? Isso apagará a conta dele, todos os seus animais e registros de vacina.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modalErroOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Erro na Exclusão</h3>
            <p>{mensagemErro}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setModalErroOpen(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '800px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', width: '100%' },
  btnBuscar: { padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', margin: '10px 0' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' },
  btnAcao: { padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', width: '100%' },
  card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { background: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalContentSmall: { background: 'white', padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }
};