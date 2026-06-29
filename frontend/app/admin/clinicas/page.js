"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

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

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

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

      buscarClinicas('');
    }
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

    if (isEdicao) {
      url = `http://localhost:3000/admin/editar-clinica/${formDados.id_clinica}`;
      metodo = 'PUT';
    }

    const payload = { ...formDados, id_usuario_log: usuario.id_usuario };

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
          <h2 style={{ margin: 0, color: headerColor }}>Gerenciamento de Clínicas</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={abrirModalCadastro}>
            + Nova Clínica
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', backgroundColor: isEscuro ? '#2d2d2d' : '#e9ecef', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${borderColor}` }}>
          <input 
            type="text" 
            value={termoBusca} 
            onChange={(e) => setTermoBusca(e.target.value)} 
            placeholder="Pesquisar por nome fantasia ou CNPJ..." 
            style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, margin: 0, flex: 2, fontSize: 'inherit' }} 
          />
          <button style={{ color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#0056b3', flex: 1, margin: 0, fontSize: 'inherit' }} onClick={() => buscarClinicas(termoBusca)}>Pesquisar</button>
        </div>

        <div>
          {clinicas.length === 0 ? <p style={{ color: textSecundario }}>Nenhuma clínica encontrada.</p> : clinicas.map(clinica => (
            <div key={clinica.id_clinica} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginBottom: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, margin: '0 0 10px 0', color: headerColor }}>🏥 {clinica.nome_fantasia}</h3>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>CNPJ:</strong> {clinica.cnpj || 'Não cadastrado'} | <strong>Telefone:</strong> {clinica.telefone || 'Não cadastrado'}</p>
                <p style={{ margin: '5px 0', color: textSecundario }}><strong>Endereço:</strong> {clinica.endereco ? `${clinica.endereco}, ` : ''}{clinica.bairro}, {clinica.cidade} - {clinica.estado}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px' }}>
                <button style={{ color: 'black', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', backgroundColor: '#ffc107', margin: 0, fontSize: 'inherit' }} onClick={() => abrirModalEdicao(clinica)}>✏️ Editar</button>
                <button style={{ color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', backgroundColor: '#dc3545', margin: 0, fontSize: 'inherit' }} onClick={() => { setIdParaExcluir(clinica.id_clinica); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}` }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>{isEdicao ? '✏️ Editar Clínica' : 'Cadastrar Nova Clínica'}</h3>
            <form onSubmit={submitForm}>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Nome Fantasia:</label>
              <input type="text" value={formDados.nome_fantasia} onChange={e => setFormDados({...formDados, nome_fantasia: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>CNPJ:</label>
              <input type="text" value={formDados.cnpj} onChange={handleCNPJChange} placeholder="00.000.000/0000-00" style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Telefone:</label>
              <input type="tel" value={formDados.telefone} onChange={handleTelefoneChange} placeholder="(00) 00000-0000" style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Endereço (Rua, Av, Número):</label>
              <input type="text" value={formDados.endereco} onChange={e => setFormDados({...formDados, endereco: e.target.value})} style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Estado (UF):</label>
              <input type="text" maxLength="2" value={formDados.estado} onChange={handleEstadoChange} placeholder="Ex: PA" required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Cidade:</label>
              <input type="text" value={formDados.cidade} onChange={e => setFormDados({...formDados, cidade: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Bairro:</label>
              <input type="text" value={formDados.bairro} onChange={e => setFormDados({...formDados, bairro: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#28a745', margin: 0, flex: 1, fontSize: 'inherit' }}>Salvar Dados</button>
                <button type="button" style={{ color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#6c757d', margin: 0, flex: 1, fontSize: 'inherit' }} onClick={fecharModais}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '20px', borderRadius: '8px', textAlign: 'center', width: '320px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', color: textColor, border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}` }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Confirma a exclusão desta clínica? Certifique-se de que não há usuários vinculados a ela.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit', flex: 1 }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit', flex: 1 }} onClick={fecharModais}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}