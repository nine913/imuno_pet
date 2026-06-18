"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAvisos() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  const [avisos, setAvisos] = useState([]);
  
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [isEdicao, setIsEdicao] = useState(false);
  const [formDados, setFormDados] = useState({
    id_aviso: '',
    titulo: '',
    mensagem: '',
    tipo: 'INFO',
    status: 'ATIVO'
  });
  const [mensagemForm, setMensagemForm] = useState({ texto: '', cor: '' });
  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [avisoParaExcluir, setAvisoParaExcluir] = useState(null);

  useEffect(() => {
    if (!usuario) {
      router.push('/');
    } else if (usuario.perfil.toUpperCase() !== 'ADMINISTRADOR') {
      router.push('/dashboard');
    } else {
      buscarAvisos();
    }
  }, [usuario, router]);

  const buscarAvisos = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/admin/avisos');
      if (resposta.ok) {
        setAvisos(await resposta.json());
      }
    } catch (erro) {}
  };

  const abrirModalCadastro = () => {
    setIsEdicao(false);
    setFormDados({ id_aviso: '', titulo: '', mensagem: '', tipo: 'INFO', status: 'ATIVO' });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = (aviso) => {
    setIsEdicao(true);
    setFormDados({
      id_aviso: aviso.id_aviso,
      titulo: aviso.titulo,
      mensagem: aviso.mensagem,
      tipo: aviso.tipo,
      status: aviso.status
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    let url = 'http://localhost:3000/admin/cadastrar-aviso';
    let metodo = 'POST';

    const payload = { ...formDados, id_usuario_log: usuario.id_usuario };

    if (isEdicao) {
      url = `http://localhost:3000/admin/editar-aviso/${formDados.id_aviso}`;
      metodo = 'PUT';
    }

    try {
      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagemForm({ texto: dados.mensagem || 'Sucesso!', cor: 'green' });
        setTimeout(() => {
          setModalFormOpen(false);
          buscarAvisos();
        }, 1500);
      } else {
        setMensagemForm({ texto: dados.erro || 'Erro.', cor: 'red' });
      }
    } catch (erro) {
      setMensagemForm({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  const confirmarExclusao = async () => {
    if (!avisoParaExcluir) return;
    try {
      const res = await fetch(`http://localhost:3000/admin/deletar-aviso/${avisoParaExcluir}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        setModalExclusaoOpen(false);
        setAvisoParaExcluir(null);
        buscarAvisos();
      }
    } catch (error) {
      setModalExclusaoOpen(false);
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/admin/dashboard')}>Voltar ao Dashboard</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#000000' }}>Central de Avisos Globais</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={abrirModalCadastro}>
            + Criar Aviso
          </button>
        </div>

        <div>
          {avisos.length === 0 ? <p style={{ color: '#333' }}>Nenhum aviso criado.</p> : avisos.map(aviso => (
            <div key={aviso.id_aviso} style={{ ...styles.card, borderLeft: `5px solid ${aviso.tipo === 'URGENTE' ? '#dc3545' : aviso.tipo === 'ALERTA' ? '#ffc107' : '#17a2b8'}` }}>
              <div>
                <h3 style={{ marginTop: 0, color: '#333' }}>{aviso.titulo}</h3>
                <p style={{ margin: '5px 0', color: '#333' }}>{aviso.mensagem}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '12px' }}>
                  <span style={{ backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '4px', color: '#333' }}>Tipo: <strong>{aviso.tipo}</strong></span>
                  <span style={{ backgroundColor: aviso.status === 'ATIVO' ? '#d4edda' : '#f8d7da', color: aviso.status === 'ATIVO' ? '#155724' : '#721c24', padding: '4px 8px', borderRadius: '4px' }}>Status: <strong>{aviso.status}</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px' }}>
                <button style={{ ...styles.btnAcao, backgroundColor: '#ffc107', color: 'black' }} onClick={() => abrirModalEdicao(aviso)}>✏️ Editar</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#dc3545' }} onClick={() => { setAvisoParaExcluir(aviso.id_aviso); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#333' }}>{isEdicao ? '✏️ Editar Aviso' : 'Criar Novo Aviso'}</h3>
            <form onSubmit={submitForm}>
              <label style={styles.label}>Título:</label>
              <input type="text" value={formDados.titulo} onChange={e => setFormDados({...formDados, titulo: e.target.value})} required style={styles.input} />

              <label style={styles.label}>Mensagem:</label>
              <textarea value={formDados.mensagem} onChange={e => setFormDados({...formDados, mensagem: e.target.value})} required rows="4" style={styles.input} />

              <label style={styles.label}>Tipo:</label>
              <select value={formDados.tipo} onChange={e => setFormDados({...formDados, tipo: e.target.value})} style={styles.input}>
                <option value="INFO">Informativo (Azul)</option>
                <option value="ALERTA">Alerta (Amarelo)</option>
                <option value="URGENTE">Urgente (Vermelho)</option>
              </select>

              {isEdicao && (
                <>
                  <label style={styles.label}>Status:</label>
                  <select value={formDados.status} onChange={e => setFormDados({...formDados, status: e.target.value})} style={styles.input}>
                    <option value="ATIVO">Ativo (Aparece para todos)</option>
                    <option value="INATIVO">Inativo (Oculto)</option>
                  </select>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.btnAcao, backgroundColor: '#28a745', flex: 1, margin: 0 }}>Salvar Aviso</button>
                <button type="button" onClick={() => setModalFormOpen(false)} style={{ ...styles.btnVoltar, flex: 1, margin: 0 }}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContentSmall}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: '#333' }}>Deseja excluir este aviso permanentemente?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
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
  input: { width: '100%', padding: '10px', margin: '0 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#333' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '14px' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' },
  btnAcao: { color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  card: { border: '1px solid #e3e3e3', padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  modalContentSmall: { background: 'white', padding: '20px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }
};