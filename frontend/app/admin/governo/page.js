"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function AdminGoverno() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
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

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (!saved) {
        router.push('/');
        return;
      }
      const user = JSON.parse(saved);
      if (user.perfil.toUpperCase() !== 'ADMINISTRADOR') {
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

      buscarOrgaos('');
    }
  }, [router]);

  const buscarOrgaos = async (termo = termoBusca) => {
    try {
      const resposta = await fetch(`http://localhost:3000/admin/orgaos?termo=${termo}`);
      if (resposta.ok) {
        setOrgaos(await resposta.json());
      } else {
        setOrgaos([]);
      }
    } catch (erro) {}
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
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#000000');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', color: textColor }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, color: headerColor }}>Gerenciamento de Órgãos Governamentais</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={abrirModalCadastro}>
            + Novo Órgão
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
          <input 
            type="text" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            placeholder="Pesquisar por nome da instituição ou e-mail..." 
            style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, flex: 2, fontSize: 'inherit' }} 
          />
          <button style={{ backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, margin: 0, fontSize: 'inherit' }} onClick={() => buscarOrgaos(termoBusca)}>Pesquisar</button>
        </div>

        <div>
          {orgaos.length === 0 ? <p style={{ color: textSecundario }}>Nenhum órgão encontrado.</p> : orgaos.map(orgao => (
            <div key={orgao.id_orgao} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, color: isEscuro ? '#66b2ff' : '#007bff' }}>🏛️ {orgao.nome_instituicao}</h3>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Esfera:</strong> {orgao.esfera}</p>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Atuação:</strong> {orgao.cidade_atuacao} - {orgao.estado_atuacao}</p>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>E-mail (Login):</strong> {orgao.email}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px' }}>
                <button style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => abrirModalEdicao(orgao)}>✏️ Editar</button>
                <button style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => { setIdParaExcluir(orgao.id_orgao); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: headerColor, marginTop: 0 }}>{isEdicao ? '✏️ Editar Órgão' : 'Cadastrar Novo Órgão'}</h3>
            <form onSubmit={submitForm}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Nome da Instituição:</label>
              <input type="text" value={formDados.nome_instituicao} onChange={e => setFormDados({...formDados, nome_instituicao: e.target.value})} placeholder="Ex: Vigilância Sanitária" required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Esfera:</label>
              <select value={formDados.esfera} onChange={e => setFormDados({...formDados, esfera: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                <option value="MUNICIPAL">Municipal</option>
                <option value="ESTADUAL">Estadual</option>
                <option value="FEDERAL">Federal</option>
              </select>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Estado (UF):</label>
                  <input type="text" maxLength="2" value={formDados.estado_atuacao} onChange={e => setFormDados({...formDados, estado_atuacao: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Cidade:</label>
                  <input type="text" value={formDados.cidade_atuacao} onChange={e => setFormDados({...formDados, cidade_atuacao: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
                </div>
              </div>

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>E-mail de Acesso:</label>
              <input type="email" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required disabled={isEdicao} style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

              {!isEdicao && (
                <>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Senha:</label>
                  <input type="password" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: 'inherit' }}>Salvar Dados</button>
                <button type="button" style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: 'inherit' }} onClick={fecharModais}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', textAlign: 'center', width: '320px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}` }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Confirma a exclusão deste órgão e do seu acesso ao sistema?</p>
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