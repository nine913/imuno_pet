"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarTutor() {
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  const [idEspecieSel, setIdEspecieSel] = useState('');

  const [formDados, setFormDados] = useState({
    email: '',
    senha: '',
    nome_completo: '',
    cpf: '',
    telefone: '',
    estado: '',
    cidade: '',
    bairro: '',
    nome_pet: '',
    especie: '',
    raca: '',
    data_nascimento: ''
  });
  const [msg, setMsg] = useState({ texto: '', cor: '' });

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      setUsuario(JSON.parse(saved));
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (usuario) {
      carregarEspecies();
    }
  }, [usuario]);

  const carregarEspecies = async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/especies');
      if (res.ok) setEspecies(await res.json());
    } catch (e) {}
  };

  const handleEspecieChange = async (e) => {
    const value = e.target.value;
    setIdEspecieSel(value);
    
    if (!value) {
      setRacas([]);
      setFormDados({ ...formDados, especie: '', raca: '' });
      return;
    }

    const especieObjeto = especies.find(esp => String(esp.id_especie) === String(value));
    const nomeEspecie = especieObjeto ? especieObjeto.nome_especie : '';

    setFormDados({ ...formDados, especie: nomeEspecie, raca: '' });

    try {
      const res = await fetch(`http://localhost:3000/admin/racas?id_especie=${value}`);
      if (res.ok) setRacas(await res.json());
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/cadastrar-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDados)
      });
      const dados = await res.json();
      if (res.ok) {
        setMsg({ texto: 'Tutor e Pet cadastrados com sucesso!', cor: 'green' });
        setTimeout(() => router.back(), 2000);
      } else {
        setMsg({ texto: dados.erro || 'Erro ao cadastrar.', cor: 'red' });
      }
    } catch (err) {
      setMsg({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  if (!isMounted || !usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.back()}>Voltar</button>
        <h2 style={styles.h2}>Cadastrar Tutor e Pet</h2>

        <form onSubmit={handleSubmit}>
          <h3 style={styles.sectionTitle}>👨‍👩‍👧 Dados do Tutor</h3>
          
          <label style={styles.label}>Nome Completo:</label>
          <input type="text" value={formDados.nome_completo} onChange={e => setFormDados({...formDados, nome_completo: e.target.value})} required style={styles.input} />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>CPF:</label>
              <input type="text" value={formDados.cpf} onChange={e => setFormDados({...formDados, cpf: e.target.value})} required style={styles.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Telefone:</label>
              <input type="text" value={formDados.telefone} onChange={e => setFormDados({...formDados, telefone: e.target.value})} style={styles.input} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Estado (UF):</label>
              <input type="text" maxLength="2" value={formDados.estado} onChange={e => setFormDados({...formDados, estado: e.target.value})} required style={styles.input} />
            </div>
            <div style={{ flex: 2 }}>
              <label style={styles.label}>Cidade:</label>
              <input type="text" value={formDados.cidade} onChange={e => setFormDados({...formDados, cidade: e.target.value})} required style={styles.input} />
            </div>
          </div>

          <label style={styles.label}>Bairro:</label>
          <input type="text" value={formDados.bairro} onChange={e => setFormDados({...formDados, bairro: e.target.value})} required style={styles.input} />

          <label style={styles.label}>E-mail (Login do Tutor):</label>
          <input type="email" value={formDados.email} onChange={e => setFormDados({...formDados, email: e.target.value})} required style={styles.input} />

          <label style={styles.label}>Senha de Acesso:</label>
          <input type="password" value={formDados.senha} onChange={e => setFormDados({...formDados, senha: e.target.value})} required style={styles.input} />

          <h3 style={styles.sectionTitle}>🐾 Dados do Pet</h3>

          <label style={styles.label}>Nome do Animal:</label>
          <input type="text" value={formDados.nome_pet} onChange={e => setFormDados({...formDados, nome_pet: e.target.value})} required style={styles.input} />

          <label style={styles.label}>Espécie:</label>
          <select value={idEspecieSel} onChange={handleEspecieChange} required style={styles.input}>
            <option value="">Selecione a espécie...</option>
            {especies.map((e, index) => (
              <option key={e.id_especie || `esp-${index}`} value={e.id_especie}>{e.nome_especie}</option>
            ))}
          </select>

          <label style={styles.label}>Raça:</label>
          <select value={formDados.raca} onChange={e => setFormDados({...formDados, raca: e.target.value})} required style={styles.input} disabled={!idEspecieSel}>
            <option value="">Selecione a raça...</option>
            {racas.map((r, index) => (
              <option key={r.id_raca || `raca-${index}`} value={r.nome_raca}>{r.nome_raca}</option>
            ))}
          </select>

          <label style={styles.label}>Data de Nascimento:</label>
          <input type="date" value={formDados.data_nascimento} onChange={e => setFormDados({...formDados, data_nascimento: e.target.value})} required style={styles.input} />

          <button type="submit" style={styles.btnSub}>Salvar Cadastros</button>
        </form>

        {msg.texto && <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: msg.cor }}>{msg.texto}</div>}
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '700px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#000000', marginTop: 0, marginBottom: '20px' },
  sectionTitle: { color: '#0056b3', marginTop: '25px', borderBottom: '2px solid #e9ecef', paddingBottom: '5px' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '8px 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  label: { fontWeight: 'bold', color: '#333', fontSize: '14px' },
  btnSub: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' }
};