"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGoverno() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  const [orgaos, setOrgaos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [isEdicao, setIsEdicao] = useState(false);
  const [formDados, setFormDados] = useState({
    id_orgao: '',
    nome_instituicao: '',
    esfera: 'MUNICIPAL',
    estado_atuacao: '',
    cidade_atuacao: '',
    email: '',
    senha: ''
  });
  const [mensagemForm, setMensagemForm] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  useEffect(() => {
    if (!usuario) {
      router.push('/');
    } else if (usuario.perfil.toUpperCase() !== 'ADMINISTRADOR') {
      router.push('/dashboard');
    } else {
      buscarOrgaos('');
    }
  }, [usuario, router]);

  const buscarOrgaos = async (termo = termoBusca) => {
    try {
      const resposta = await fetch(`http://localhost:3000/admin/orgaos?termo=${termo}`);
      if (resposta.ok) {
        setOrgaos(await resposta.json());
      } else {
        setOrgaos([]);
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  const abrirModalCadastro = () => {
    setIsEdicao(false);
    setFormDados({
      id_orgao: '',
      nome_instituicao: '',
      esfera: 'MUNICIPAL',
      estado_atuacao: '',
      cidade_atuacao: '',
      email: '',
      senha: ''
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = (orgao) => {
    setIsEdicao(true);
    setFormDados({
      id_orgao: orgao.id_orgao,
      nome_instituicao: orgao.nome_instituicao,
      esfera: orgao.esfera,
      estado_atuacao: orgao.estado_atuacao,
      cidade_atuacao: orgao.cidade_atuacao,
      email: orgao.email,
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
    
    let url = 'http://localhost:3000/admin/cadastrar-orgao';
    let metodo = 'POST';

    if (isEdicao) {
      url = `http://localhost:3000/admin/editar-orgao/${formDados.id_orgao}`;
      metodo = 'PUT';
    }

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formDados, id_usuario_log: usuario.id_usuario })
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagemForm({ texto: dados.mensagem || 'Operação realizada com sucesso!', cor: 'green' });
        setTimeout(() => {
          fecharModais();
          buscarOrgaos();
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
      const resposta = await fetch(`http://localhost:3000/admin/deletar-orgao/${idParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (resposta.ok) {
        fecharModais();
        buscarOrgaos();
      } else {
        const dados = await resposta.json();
        alert(dados.erro || 'Erro ao excluir o órgão.');
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
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Dashboard</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#000000' }}>Gerenciamento de Órgãos Governamentais</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }} onClick={abrirModalCadastro}>
            + Novo Órgão
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            placeholder="Pesquisar por nome da instituição ou e-mail..." 
            style={{ ...styles.input, margin: 0, flex: 2 }} 
          />
          <button style={{ ...styles.btnAcao, backgroundColor: '#0056b3', flex: 1, margin: 0 }} onClick={() => buscarOrgaos(termoBusca)}>Pesquisar</button>
        </div>

        <div>
          {orgaos.length === 0 ? <p>Nenhum órgão encontrado.</p> : orgaos.map(orgao => (
            <div key={orgao.id_orgao} style={styles.card}>
              <div>
                <h3 style={{ marginTop: 0, color: '#007bff' }}>🏛️ {orgao.nome_instituicao}</h3>
                <p style={{ margin: '5px 0' }}><strong>Esfera:</strong> {orgao.esfera}</p>
                <p style={{ margin: '5px 0' }}><strong>Atuação:</strong> {orgao.cidade_atuacao} - {orgao.estado_atuacao}</p>
                <p style={{ margin: '5px 0' }}><strong>E-mail (Login):</strong> {orgao.email}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px' }}>
                <button style={{ ...styles.btnAcao, backgroundColor: '#ffc107', color: 'black', margin: 0 }} onClick={() => abrirModalEdicao(orgao)}>✏️ Editar</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#dc3545', margin: 0 }} onClick={() => { setIdParaExcluir(orgao.id_orgao); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#000000', marginTop: 0 }}>{isEdicao ? '✏️ Editar Órgão' : 'Cadastrar Novo Órgão'}</h3>
            <form onSubmit={submitForm}>
              <label style={styles.label}>Nome da Instituição:</label>
              <input type="text" value={formDados.nome_instituicao} onChange={e => setFormDados({...formDados, nome_instituicao: e.target.value})} placeholder="Ex: Vigilância Sanitária" required style={styles.input} />

              <label style={styles.label}>Esfera:</label>
              <select value={formDados.esfera} onChange={e => setFormDados({...formDados, esfera: e.target.value})} required style={styles.input}>
                <option value="MUNICIPAL">Municipal</option>
                <option value="ESTADUAL">Estadual</option>
                <option value="FEDERAL">Federal</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Estado (UF):</label>
                  <input type="text" maxLength="2" value={formDados.estado_atuacao} onChange={e => setFormDados({...formDados, estado_atuacao: e.target.value})} required style={styles.input} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>Cidade:</label>
                  <input type="text" value={formDados.cidade_atuacao} onChange={e => setFormDados({...formDados, cidade_atuacao: e.target.value})} required style={styles.input} />
                </div>
              </div>

              <label style={styles.label}>E-mail de Acesso:</label>
              <input type="email" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required disabled={isEdicao} style={styles.input} />

              {!isEdicao && (
                <>
                  <label style={styles.label}>Senha:</label>
                  <input type="password" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={styles.input} />
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.btnAcao, backgroundColor: '#28a745', margin: 0, width: '100%' }}>Salvar Dados</button>
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
            <p>Confirma a exclusão deste órgão e do seu acesso ao sistema?</p>
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
  container: { maxWidth: '900px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', margin: '8px 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  label: { fontWeight: 'bold', color: '#333', fontSize: '14px' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' },
  btnAcao: { color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', width: '100%' },
  card: { border: '1px solid #e3e3e3', padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }
};