"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

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
    if (user.perfil.toUpperCase() !== 'GESTOR' && user.perfil.toUpperCase() !== 'GESTOR_CLINICA') {
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

    buscarEquipe('', user.id_clinica);
  }, [router]);

  const buscarEquipe = async (termo = termoBusca, idClinicaOverride = null) => {
    const idClinica = idClinicaOverride || (usuario ? usuario.id_clinica : null);
    if (!idClinica) return;

    try {
      const resposta = await fetch(`http://localhost:3000/gestor/veterinarios-lista?id_clinica=${idClinica}&termo=${termo}`);
      if (resposta.ok) {
        setEquipe(await resposta.json());
      } else {
        setEquipe([]);
      }
    } catch (erro) {}
  };

  const formatarCRMV = (valor) => {
    let limpo = valor.replace(/[^a-zA-Z0-9]/g, '');
    let uf = limpo.substring(0, 2).replace(/[^a-zA-Z]/g, '').toUpperCase();
    let numeros = limpo.substring(2).replace(/[^0-9]/g, '');
    
    if (limpo.length > 2) {
      return `${uf}-${numeros.substring(0, 5)}`;
    }
    return uf;
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
      email: formDados.email,
      id_clinica: usuario.id_clinica,
      id_usuario_log: usuario.id_usuario
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
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
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

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: textColor }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: headerColor }}>Equipe Veterinária</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={abrirModalCadastro}>
            + Novo Veterinário
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
          <input 
            type="text" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            placeholder="Pesquisar por nome, CRMV ou e-mail..." 
            style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, flex: 2, fontSize: 'inherit' }} 
          />
          <button style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: 0, flex: 1, fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => buscarEquipe(termoBusca)}>Pesquisar</button>
        </div>

        <div>
          {equipe.length === 0 ? <p style={{ color: textSecundario }}>Nenhum veterinário encontrado.</p> : equipe.map(vet => (
            <div key={vet.id_veterinario} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ marginTop: 0, color: headerColor }}>🩺 {vet.nome_completo}</h3>
                <p style={{ color: textSecundario, margin: '5px 0' }}><strong>CRMV:</strong> {vet.crmv} | <strong>E-mail:</strong> {vet.email}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '150px' }}>
                <button style={{ backgroundColor: '#ffc107', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => abrirModalEdicao(vet)}>✏️ Editar</button>
                <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => { setIdParaExcluir(vet.id_veterinario); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>{isEdicao ? '✏️ Editar Veterinário' : 'Cadastrar Novo Veterinário'}</h3>
            <form onSubmit={submitForm}>
              <label style={{ color: textSecundario, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nome Completo:</label>
              <input type="text" value={formDados.nome_completo} onChange={e => setFormDados({...formDados, nome_completo: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

              <label style={{ color: textSecundario, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>CRMV:</label>
              <input 
                type="text" 
                value={formDados.crmv} 
                onChange={e => setFormDados({...formDados, crmv: formatarCRMV(e.target.value)})} 
                required 
                style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
                placeholder="Ex: PA-12345"
                maxLength="8"
              />

              <label style={{ color: textSecundario, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>E-mail de Acesso:</label>
              <input type="email" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

              {!isEdicao && (
                <div>
                  <label style={{ color: textSecundario, fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Senha de Acesso (Criação):</label>
                  <input type="password" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, fontWeight: 'bold', fontSize: 'inherit' }}>Salvar Dados</button>
                <button type="button" style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1, margin: 0, fontWeight: 'bold', fontSize: 'inherit' }} onClick={fecharModais}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', textAlign: 'center', width: '320px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Confirma a exclusão deste veterinário e de seu acesso ao sistema?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={fecharModais}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}