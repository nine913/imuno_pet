"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    buscarEquipe('');
  }, [router]);

  const buscarEquipe = async (termo = termoBusca) => {
    try {
      const resposta = await fetch(`http://localhost:3000/gestor/veterinarios-lista?termo=${termo}`);
      if (resposta.ok) {
        setEquipe(await resposta.json());
      } else {
        setEquipe([]);
      }
    } catch (erro) {
      console.error(erro);
    }
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
      email: formDados.email
    };

    let url = 'http://localhost:3000/gestor/cadastrar-vet';
    let metodo = 'POST';

    if (isEdicao) {
      payload.id_usuario = formDados.id_usuario;
      url = `http://localhost:3000/gestor/editar-vet/${formDados.id_veterinario}`;
      metodo = 'PUT';
    } else {
      payload.senha = formDados.senha;
    }

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagemForm({ texto: dados.mensagem, cor: 'green' });
        setTimeout(() => {
          fecharModais();
          buscarEquipe();
        }, 1500);
      } else {
        setMensagemForm({ texto: dados.erro || 'Erro ao processar.', cor: 'red' });
      }
    } catch (erro) {
      setMensagemForm({ texto: 'Erro de conexão com o servidor.', cor: 'red' });
    }
  };

  const confirmarExclusao = async () => {
    if (!idParaExcluir) return;
    try {
      const resposta = await fetch(`http://localhost:3000/gestor/deletar-vet/${idParaExcluir}`, {
        method: 'DELETE'
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

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Painel</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#000000' }}>Equipe Veterinária</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={abrirModalCadastro}>
            + Novo Veterinário
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            placeholder="Pesquisar por nome, CRMV ou e-mail..." 
            style={{ ...styles.input, margin: 0, flex: 2 }} 
          />
          <button style={{ ...styles.btnVet, flex: 1 }} onClick={() => buscarEquipe(termoBusca)}>Pesquisar</button>
        </div>

        <div>
          {equipe.length === 0 ? <p>Nenhum veterinário encontrado.</p> : equipe.map(vet => (
            <div key={vet.id_veterinario} style={styles.card}>
              <div>
                <h3 style={{ marginTop: 0, color: '#007bff' }}>🩺 {vet.nome_completo}</h3>
                <p><strong>CRMV:</strong> {vet.crmv} | <strong>E-mail:</strong> {vet.email}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button style={{ ...styles.btnAcao, backgroundColor: '#ffc107', color: 'black' }} onClick={() => abrirModalEdicao(vet)}>✏️ Editar</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#dc3545' }} onClick={() => { setIdParaExcluir(vet.id_veterinario); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#000000', marginTop: 0 }}>{isEdicao ? '✏️ Editar Veterinário' : 'Cadastrar Novo Veterinário'}</h3>
            <form onSubmit={submitForm}>
              <label>Nome Completo:</label>
              <input type="text" value={formDados.nome_completo} onChange={e => setFormDados({...formDados, nome_completo: e.target.value})} required style={styles.input} />

              <label>CRMV:</label>
              <input type="text" value={formDados.crmv} onChange={e => setFormDados({...formDados, crmv: e.target.value})} required style={styles.input} />

              <label>E-mail de Acesso:</label>
              <input type="email" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required style={styles.input} />

              {!isEdicao && (
                <div>
                  <label>Senha de Acesso (Criação):</label>
                  <input type="password" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={styles.input} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={styles.btnAcao}>Salvar Dados</button>
                <button type="button" style={{ ...styles.btnVoltar, margin: 0, width: '100%' }} onClick={fecharModais}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', width: '320px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p>Confirma a exclusão deste veterinário e de seu acesso ao sistema?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={fecharModais}>Cancelar</button>
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
  input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' },
  btnAcao: { backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', width: '100%' },
  btnVet: { backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', margin: 0 },
  card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }
};