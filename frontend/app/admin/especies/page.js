"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEspeciesRacas() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  
  const [novaEspecie, setNovaEspecie] = useState('');
  const [formRaca, setFormRaca] = useState({ id_especie: '', nome_raca: '' });
  
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  useEffect(() => {
    if (!usuario) {
      router.push('/');
    } else if (usuario.perfil.toUpperCase() !== 'ADMINISTRADOR') {
      router.push('/dashboard');
    } else {
      carregarDados();
    }
  }, [usuario, router]);

  const carregarDados = async () => {
    try {
      const resEspecies = await fetch('http://localhost:3000/admin/especies');
      if (resEspecies.ok) setEspecies(await resEspecies.json());

      const resRacas = await fetch('http://localhost:3000/admin/racas');
      if (resRacas.ok) setRacas(await resRacas.json());
    } catch (erro) {
      console.error(erro);
    }
  };

  const cadastrarEspecie = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/admin/cadastrar-especie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_especie: novaEspecie })
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
        body: JSON.stringify(formRaca)
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

  const deletarEspecie = async (id) => {
    if (!confirm('Excluir esta espécie vai apagar todas as raças vinculadas a ela. Confirma?')) return;
    try {
      const res = await fetch(`http://localhost:3000/admin/deletar-especie/${id}`, { method: 'DELETE' });
      if (res.ok) carregarDados();
    } catch (error) {
      mostrarMensagem('Erro ao deletar.', 'red');
    }
  };

  const deletarRaca = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/admin/deletar-raca/${id}`, { method: 'DELETE' });
      if (res.ok) carregarDados();
    } catch (error) {
      mostrarMensagem('Erro ao deletar.', 'red');
    }
  };

  const mostrarMensagem = (texto, cor) => {
    setMensagem({ texto, cor });
    setTimeout(() => setMensagem({ texto: '', cor: '' }), 3000);
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/admin/dashboard')}>Voltar ao Dashboard</button>
        <h2 style={styles.h2}>Catálogo de Espécies e Raças</h2>

        {mensagem.texto && <div style={{ color: mensagem.cor, fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>{mensagem.texto}</div>}

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fdfdfd', padding: '20px', borderRadius: '8px', border: '1px solid #e3e3e3' }}>
            <h3 style={{ color: '#0056b3', marginTop: 0 }}>Adicionar Espécie</h3>
            <form onSubmit={cadastrarEspecie} style={{ display: 'flex', gap: '10px' }}>
              <input type="text" value={novaEspecie} onChange={(e) => setNovaEspecie(e.target.value)} placeholder="Ex: Pássaro" required style={styles.input} />
              <button type="submit" style={styles.btnAcao}>Salvar</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
              {especies.map(e => (
                <li key={e.id_especie} style={styles.listItem}>
                  <span>{e.nome_especie}</span>
                  <button onClick={() => deletarEspecie(e.id_especie)} style={styles.btnDelete}>X</button>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fdfdfd', padding: '20px', borderRadius: '8px', border: '1px solid #e3e3e3' }}>
            <h3 style={{ color: '#0056b3', marginTop: 0 }}>Adicionar Raça</h3>
            <form onSubmit={cadastrarRaca} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select value={formRaca.id_especie} onChange={(e) => setFormRaca({...formRaca, id_especie: e.target.value})} required style={styles.input}>
                <option value="">Selecione a Espécie...</option>
                {especies.map(e => <option key={e.id_especie} value={e.id_especie}>{e.nome_especie}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={formRaca.nome_raca} onChange={(e) => setFormRaca({...formRaca, nome_raca: e.target.value})} placeholder="Nome da Raça" required style={styles.input} />
                <button type="submit" style={styles.btnAcao}>Salvar</button>
              </div>
            </form>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
              {racas.map(r => (
                <li key={r.id_raca} style={styles.listItem}>
                  <span>{r.nome_raca} <small style={{ color: '#666' }}>({r.nome_especie})</small></span>
                  <button onClick={() => deletarRaca(r.id_raca)} style={styles.btnDelete}>X</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '900px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#000000', marginTop: 0, marginBottom: '20px' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  input: { flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
  btnAcao: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer' },
  btnDelete: { backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '5px 10px' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }
};