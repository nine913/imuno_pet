"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

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

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO' && user.perfil !== 'GESTOR_CLINICA' && user.perfil !== 'ADMINISTRADOR') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);
    
    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }

    realizarBusca('', user.id_clinica);
  }, [router]);

  const realizarBusca = async (termo = termoBusca, id = null) => {
    const clinica = id || usuario?.id_clinica;
    if (!clinica) return;

    try {
      const resposta = await fetch(`http://localhost:3000/listar-tutores?termo=${termo}&id_clinica=${clinica}`);
      if (resposta.ok) {
        setTutores(await resposta.json());
      } else {
        setTutores([]);
      }
    } catch (erro) {}
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
        body: JSON.stringify({ ...editDados, id_usuario_log: usuario.id_usuario })
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
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
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
          <h2 style={{ margin: 0, color: headerColor }}>Consultar Tutores</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => router.push('/veterinario/cadastrar-tutor')}>
            + Cadastrar Novo Tutor
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="text" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && realizarBusca()} placeholder="Digite o nome, CPF ou E-mail" style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, margin: 0, flex: 1, fontSize: 'inherit' }} />
          <button style={{ padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: 0, width: 'auto', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => realizarBusca()}>Pesquisar</button>
        </div>

        <div>
          {tutores.length === 0 ? <p style={{ color: textSecundario }}>Nenhum tutor encontrado.</p> : tutores.map(tutor => (
            <div key={tutor.id_tutor} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 10px 0', color: headerColor }}>👤 {tutor.nome_completo}</h3>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>CPF:</strong> {tutor.cpf} | <strong>Email:</strong> {tutor.email}</p>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Telefone:</strong> {tutor.telefone}</p>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Endereço:</strong> {tutor.bairro}, {tutor.cidade} - {tutor.estado}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '150px' }}>
                <button style={{ padding: '10px 15px', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', backgroundColor: '#ffc107', fontSize: 'inherit' }} onClick={() => abrirModalEditar(tutor)}>✏️ Editar</button>
                <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', backgroundColor: '#dc3545', fontSize: 'inherit' }} onClick={() => { setTutorParaExcluir(tutor.id_tutor); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalEditarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Editar Tutor</h3>
            <form onSubmit={submitEditar}>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Nome Completo:</label>
              <input type="text" value={editDados.nome_completo} onChange={e => setEditDados({...editDados, nome_completo: e.target.value})} required style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Telefone:</label>
              <input type="tel" value={editDados.telefone} onChange={handleTelefoneChange} required maxLength="15" style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Estado (UF):</label>
              <input type="text" value={editDados.estado} onChange={handleEstadoChange} required maxLength="2" style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Cidade:</label>
              <input type="text" value={editDados.cidade} onChange={e => setEditDados({...editDados, cidade: e.target.value})} required style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Bairro:</label>
              <input type="text" value={editDados.bairro} onChange={e => setEditDados({...editDados, bairro: e.target.value})} required style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', backgroundColor: '#28a745', flex: 1, margin: 0, fontSize: 'inherit' }}>Salvar Alterações</button>
                <button type="button" onClick={() => setModalEditarOpen(false)} style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#6c757d', flex: 1, margin: 0, width: 'auto', fontSize: 'inherit' }}>Cancelar</button>
              </div>
            </form>
            {mensagemEditar.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemEditar.cor }}>{mensagemEditar.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Deseja excluir este tutor? Isso apagará a conta dele, todos os seus animais e registros de vacina.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modalErroOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Erro na Exclusão</h3>
            <p style={{ color: textSecundario }}>{mensagemErro}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => setModalErroOpen(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}