"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function AdminEspeciesRacas() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  
  const [novaEspecie, setNovaEspecie] = useState('');
  const [formRaca, setFormRaca] = useState({ id_especie: '', nome_raca: '' });
  
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState({ tipo: '', id: null, nome: '' });

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

      carregarDados();
    }
  }, [router]);

  const carregarDados = async () => {
    try {
      const resEspecies = await fetch('http://localhost:3000/admin/especies');
      if (resEspecies.ok) setEspecies(await resEspecies.json());

      const resRacas = await fetch('http://localhost:3000/admin/racas');
      if (resRacas.ok) setRacas(await resRacas.json());
    } catch (erro) {}
  };

  const cadastrarEspecie = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/admin/cadastrar-especie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_especie: novaEspecie, id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        setNovaEspecie('');
        carregarDados();
        mostrarMensagem('Espécie cadastrada com sucesso!', 'green');
      } else {
        mostrarMensagem('Erro ao cadastrar.', 'red');
      }
    } catch (error) {
      mostrarMensagem('Erro de conexão.', 'red');
    }
  };

  const cadastrarRaca = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/admin/cadastrar-raca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formRaca, id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        setFormRaca({ ...formRaca, nome_raca: '' });
        carregarDados();
        mostrarMensagem('Raça cadastrada com sucesso!', 'green');
      } else {
        mostrarMensagem('Erro ao cadastrar.', 'red');
      }
    } catch (error) {
      mostrarMensagem('Erro de conexão.', 'red');
    }
  };

  const abrirModalDeletarEspecie = (especie) => {
    setItemParaExcluir({ tipo: 'especie', id: especie.id_especie, nome: especie.nome_especie });
    setModalExclusaoOpen(true);
  };

  const abrirModalDeletarRaca = (raca) => {
    setItemParaExcluir({ tipo: 'raca', id: raca.id_raca, nome: raca.nome_raca });
    setModalExclusaoOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir.id) return;
    try {
      const endpoint = itemParaExcluir.tipo === 'especie' 
        ? `http://localhost:3000/admin/deletar-especie/${itemParaExcluir.id}`
        : `http://localhost:3000/admin/deletar-raca/${itemParaExcluir.id}`;

      const res = await fetch(endpoint, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (res.ok) {
        carregarDados();
        setModalExclusaoOpen(false);
        setItemParaExcluir({ tipo: '', id: null, nome: '' });
      } else {
        mostrarMensagem('Erro ao deletar.', 'red');
        setModalExclusaoOpen(false);
      }
    } catch (error) {
      mostrarMensagem('Erro ao deletar.', 'red');
      setModalExclusaoOpen(false);
    }
  };

  const mostrarMensagem = (texto, cor) => {
    setMensagem({ texto, cor });
    setTimeout(() => setMensagem({ texto: '', cor: '' }), 3000);
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
        <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Catálogo de Espécies e Raças</h2>

        {mensagem.texto && <div style={{ color: mensagem.cor, fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>{mensagem.texto}</div>}

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: 1, minWidth: '300px', backgroundColor: bgCard, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ color: isEscuro ? '#66b2ff' : '#0056b3', marginTop: 0 }}>Adicionar Espécie</h3>
            <form onSubmit={cadastrarEspecie} style={{ display: 'flex', gap: '10px' }}>
              <input type="text" value={novaEspecie} onChange={(e) => setNovaEspecie(e.target.value)} placeholder="Ex: Pássaro" required style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }} />
              <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }}>Salvar</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
              {especies.map(e => (
                <li key={e.id_especie} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: `1px solid ${borderColor}` }}>
                  <span style={{ color: textColor, fontWeight: 'bold' }}>{e.nome_especie}</span>
                  <button onClick={() => abrirModalDeletarEspecie(e)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold', fontSize: 'inherit' }}>X</button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: 1, minWidth: '300px', backgroundColor: bgCard, padding: '20px', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
            <h3 style={{ color: isEscuro ? '#66b2ff' : '#0056b3', marginTop: 0 }}>Adicionar Raça</h3>
            <form onSubmit={cadastrarRaca} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={formRaca.id_especie} onChange={(e) => setFormRaca({...formRaca, id_especie: e.target.value})} required style={{ padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', color: textColor, backgroundColor: inputBg, fontSize: 'inherit' }}>
                <option value="">Selecione a Espécie...</option>
                {especies.map(e => <option key={e.id_especie} value={e.id_especie}>{e.nome_especie}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={formRaca.nome_raca} onChange={(e) => setFormRaca({...formRaca, nome_raca: e.target.value})} placeholder="Nome da Raça" required style={{ flex: 1, padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', color: textColor, backgroundColor: inputBg, margin: 0, fontSize: 'inherit' }} />
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', margin: 0, fontSize: 'inherit' }}>Salvar</button>
              </div>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {racas.map(r => (
                <li key={r.id_raca} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: `1px solid ${borderColor}` }}>
                  <span style={{ color: textColor, fontWeight: 'bold' }}>{r.nome_raca} <small style={{ color: textSecundario }}>({r.nome_especie})</small></span>
                  <button onClick={() => abrirModalDeletarRaca(r)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold', fontSize: 'inherit' }}>X</button>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', width: '320px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            
            <p style={{ color: textSecundario }}>
              Tem certeza que deseja excluir a {itemParaExcluir.tipo === 'especie' ? 'espécie' : 'raça'} <strong>{itemParaExcluir.nome}</strong>?
            </p>

            {itemParaExcluir.tipo === 'especie' && (
              <p style={{ fontSize: '0.9em', color: '#dc3545', fontWeight: 'bold' }}>
                Isso apagará automaticamente todas as raças vinculadas a ela!
              </p>
            )}

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