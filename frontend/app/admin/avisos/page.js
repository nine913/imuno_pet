"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function AdminAvisos() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
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

      buscarAvisos();
    }
  }, [router]);

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

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#000000');
  const tagBg = isEscuro ? '#444444' : '#e9ecef';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', color: textColor }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: headerColor }}>Central de Avisos Globais</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={abrirModalCadastro}>
            + Criar Aviso
          </button>
        </div>

        <div>
          {avisos.length === 0 ? <p style={{ color: textSecundario }}>Nenhum aviso criado.</p> : avisos.map(aviso => (
            <div key={aviso.id_aviso} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', borderLeft: `5px solid ${aviso.tipo === 'URGENTE' ? '#dc3545' : aviso.tipo === 'ALERTA' ? '#ffc107' : '#17a2b8'}` }}>
              <div>
                <h3 style={{ marginTop: 0, color: textColor }}>{aviso.titulo}</h3>
                <p style={{ margin: '5px 0', color: textSecundario }}>{aviso.mensagem}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '0.85em' }}>
                  <span style={{ backgroundColor: tagBg, padding: '4px 8px', borderRadius: '4px', color: textColor }}>Tipo: <strong>{aviso.tipo}</strong></span>
                  <span style={{ backgroundColor: aviso.status === 'ATIVO' ? (isEscuro ? '#155724' : '#d4edda') : (isEscuro ? '#721c24' : '#f8d7da'), color: aviso.status === 'ATIVO' ? (isEscuro ? '#d4edda' : '#155724') : (isEscuro ? '#f8d7da' : '#721c24'), padding: '4px 8px', borderRadius: '4px' }}>Status: <strong>{aviso.status}</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '120px' }}>
                <button style={{ color: 'black', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#ffc107', fontSize: 'inherit' }} onClick={() => abrirModalEdicao(aviso)}>✏️ Editar</button>
                <button style={{ color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#dc3545', fontSize: 'inherit' }} onClick={() => { setAvisoParaExcluir(aviso.id_aviso); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalFormOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: textColor, border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}` }}>
            <h3 style={{ marginTop: 0, color: headerColor }}>{isEdicao ? '✏️ Editar Aviso' : 'Criar Novo Aviso'}</h3>
            <form onSubmit={submitForm}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Título:</label>
              <input type="text" value={formDados.titulo} onChange={e => setFormDados({...formDados, titulo: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Mensagem:</label>
              <textarea value={formDados.mensagem} onChange={e => setFormDados({...formDados, mensagem: e.target.value})} required rows="4" style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit', resize: 'vertical' }} />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Tipo:</label>
              <select value={formDados.tipo} onChange={e => setFormDados({...formDados, tipo: e.target.value})} style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                <option value="INFO">Informativo (Azul)</option>
                <option value="ALERTA">Alerta (Amarelo)</option>
                <option value="URGENTE">Urgente (Vermelho)</option>
              </select>

              {isEdicao && (
                <>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Status:</label>
                  <select value={formDados.status} onChange={e => setFormDados({...formDados, status: e.target.value})} style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                    <option value="ATIVO">Ativo (Aparece para todos)</option>
                    <option value="INATIVO">Inativo (Oculto)</option>
                  </select>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#28a745', flex: 1, margin: 0, fontSize: 'inherit' }}>Salvar Aviso</button>
                <button type="button" onClick={() => setModalFormOpen(false)} style={{ color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#6c757d', flex: 1, margin: 0, fontSize: 'inherit' }}>Cancelar</button>
              </div>
            </form>
            {mensagemForm.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemForm.cor }}>{mensagemForm.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', color: textColor, border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}` }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Deseja excluir este aviso permanentemente?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}