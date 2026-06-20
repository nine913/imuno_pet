"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminClinicas() {
  const [usuario, setUsuario] = useState(null);
  const [clinicas, setClinicas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [isEdicao, setIsEdicao] = useState(false);
  const [formDados, setFormDados] = useState({
    id_clinica: '',
    nome_fantasia: '',
    cnpj: '',
    endereco: '',
    telefone: '',
    estado: '',
    cidade: '',
    bairro: ''
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
    if (user.perfil.toUpperCase() !== 'ADMINISTRADOR') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);
    buscarClinicas('');
  }, [router]);

  const buscarClinicas = async (termo = termoBusca) => {
    try {
      const resposta = await fetch(`http://localhost:3000/admin/clinicas?termo=${termo}`);
      if (resposta.ok) {
        setClinicas(await resposta.json());
      } else {
        setClinicas([]);
      }
    } catch (erro) {}
  };

  const handleCNPJChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    setFormDados({ ...formDados, cnpj: v.substring(0, 18) });
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    setFormDados({ ...formDados, telefone: v.substring(0, 15) });
  };

  const handleEstadoChange = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setFormDados({ ...formDados, estado: v });
  };

  const abrirModalCadastro = () => {
    setIsEdicao(false);
    setFormDados({
      id_clinica: '',
      nome_fantasia: '',
      cnpj: '',
      endereco: '',
      telefone: '',
      estado: '',
      cidade: '',
      bairro: ''
    });
    setMensagemForm({ texto: '', cor: '' });
    setModalFormOpen(true);
  };

  const abrirModalEdicao = (clinica) => {
    setIsEdicao(true);
    setFormDados({
      id_clinica: clinica.id_clinica,
      nome_fantasia: clinica.nome_fantasia,
      cnpj: clinica.cnpj || '',
      endereco: clinica.endereco || '',
      telefone: clinica.telefone || '',
      estado: clinica.estado,
      cidade: clinica.cidade,
      bairro: clinica.bairro
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
    
    let url = 'http://localhost:3000/admin/cadastrar-clinica';
    let metodo = 'POST';

    const payload = { ...formDados, id_usuario_log: usuario.id_usuario };

    if (isEdicao) {
      url = `http://localhost:3000/admin/editar-clinica/${formDados.id_clinica}`;
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
        setMensagemForm({ texto: dados.mensagem || 'Operação realizada com sucesso!', cor: 'green' });
        setTimeout(() => {
          fecharModais();
          buscarClinicas();
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
      const resposta = await fetch(`http://localhost:3000/admin/deletar-clinica/${idParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (resposta.ok) {
        fecharModais();
        buscarClinicas();
      } else {
        const dados = await resposta.json();
        alert(dados.erro || 'Erro ao excluir a clínica. Verifique se existem vínculos ativos.');
        fecharModais();
      }
    } catch (erro) {
      fecharModais();
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>Voltar ao Dashboard</button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#000000' }}>Gerenciamento de Clínicas</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={abrirModalCadastro}>
            + Nova Clínica
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', backgroundColor: '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            placeholder="Pesquisar por nome fantasia ou CNPJ..." 
            style={{ ...styles.input, margin: 0, flex: 2 }} 
          />
          <button style={{ ...styles.btnAcao, backgroundColor: '#0056b3', flex: 1, margin: 0 }} onClick={() => buscarClinicas(termoBusca)}>Pesquisar</button>
        </div>

        <div>
          {clinicas.length === 0 ? <p style={{ color: '#333' }}>Nenhuma clínica encontrada.</p> : clinicas.map(clinica => (
            <div key={clinica.id_clinica} style={styles.card}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, margin: '0 0 10px 0', color: '#0056b3' }}>🏥 {clinica.nome_fantasia}</h3>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>CNPJ:</strong> {clinica.cnpj || 'Não cadastrado'} | <strong>Telefone:</strong> {clinica.telefone || 'Não cadastrado'}</p>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Endereço:</strong> {clinica.endereco ? `${clinica.endereco}, ` : ''}{clinica.bairro}, {clinica.cidade} - {clinica.estado}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px' }}>
                <button style={{ ...styles.btnAcao, backgroundColor: '#ffc107', color: 'black', margin: 0 }} onClick={() => abrirModalEdicao(clinica)}>✏️ Editar</button>
                <button style={{ ...styles.btnAcao, backgroundColor: '#dc3545', margin: 0 }} onClick={() => { setIdParaExcluir(clinica.id_clinica); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ color: '#000000', marginTop: 0, marginBottom: '20px' }}>{isEdicao ? '✏️ Editar Clínica' : 'Cadastrar Nova Clínica'}</h3>
            <form onSubmit={submitForm}>
              
              <label style={styles.label}>Nome Fantasia:</label>
              <input type="text" value={formDados.nome_fantasia} onChange={e => setFormDados({...formDados, nome_fantasia: e.target.value})} required style={styles.input} />

              <label style={styles.label}>CNPJ:</label>
              <input type="text" value={formDados.cnpj} onChange={handleCNPJChange} placeholder="00.000.000/0000-00" style={styles.input} />

              <label style={styles.label}>Telefone:</label>
              <input type="tel" value={formDados.telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" style={styles.input} />

              <label style={styles.label}>Endereço (Rua, Av, Número):</label>
              <input type="text" value={formDados.endereco} onChange={e => setFormDados({...formDados, endereco: e.target.value})} style={styles.input} />

              <label style={styles.label}>Estado (UF):</label>
              <input type="text" maxLength="2" value={formDados.estado} onChange={handleEstadoChange} placeholder="Ex: PA" required style={styles.input} />

              <label style={styles.label}>Cidade:</label>
              <input type="text" value={formDados.cidade} onChange={e => setFormDados({...formDados, cidade: e.target.value})} required style={styles.input} />

              <label style={styles.label}>Bairro:</label>
              <input type="text" value={formDados.bairro} onChange={e => setFormDados({...formDados, bairro: e.target.value})} required style={styles.input} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ ...styles.btnAcao, backgroundColor: '#28a745', margin: 0, flex: 1 }}>Salvar Dados</button>
                <button type="button" style={{ ...styles.btnVoltar, margin: 0, flex: 1, width: 'auto' }} onClick={fecharModais}>Cancelar</button>
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
            <p style={{ color: '#333' }}>Confirma a exclusão desta clínica? Certifique-se de que não há usuários vinculados a ela.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={fecharModais}>Cancelar</button>
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
  input: { width: '100%', padding: '10px', margin: '0 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#333' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '14px', textAlign: 'left' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' },
  btnAcao: { color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', width: '100%', fontWeight: 'bold' },
  card: { border: '1px solid #e3e3e3', padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }
};