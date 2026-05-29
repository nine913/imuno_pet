"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarAnimal() {
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
  const [tutores, setTutores] = useState([]);
  const [idEspecieSel, setIdEspecieSel] = useState('');

  const [formDados, setFormDados] = useState({
    id_tutor: '',
    nome: '',
    especie: '',
    raca: '',
    data_nascimento: ''
  });
  const [msg, setMsg] = useState({ texto: '', cor: '' });

  useEffect(() => {
    if (!usuario) {
      router.push('/');
    } else if (usuario.perfil !== 'VETERINARIO' && usuario.perfil !== 'GESTOR_CLINICA') {
      router.push('/dashboard');
    } else {
      carregarDadosBase();
    }
  }, [usuario, router]);

  const carregarDadosBase = async () => {
    try {
      const resEspecies = await fetch('http://localhost:3000/admin/especies');
      if (resEspecies.ok) setEspecies(await resEspecies.json());

      const resTutores = await fetch('http://localhost:3000/tutores');
      if (resTutores.ok) setTutores(await resTutores.json());
    } catch (e) {
      console.error(e);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/cadastrar-animal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDados)
      });
      const dados = await res.json();
      if (res.ok) {
        setMsg({ texto: 'Animal cadastrado com sucesso!', cor: 'green' });
        setFormDados({ id_tutor: '', nome: '', especie: '', raca: '', data_nascimento: '' });
        setIdEspecieSel('');
        setRacas([]);
      } else {
        setMsg({ texto: dados.erro || 'Erro ao cadastrar animal.', cor: 'red' });
      }
    } catch (err) {
      setMsg({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.back()}>Voltar</button>
        <h2 style={styles.h2}>Cadastrar Novo Paciente (Animal)</h2>

        <form onSubmit={handleSubmit}>
          
          <label style={styles.label}>Tutor Responsável:</label>
          <select value={formDados.id_tutor} onChange={e => setFormDados({...formDados, id_tutor: e.target.value})} required style={styles.input}>
            <option value="">Selecione o tutor...</option>
            {tutores.map((tutor, index) => (
              <option key={tutor.id_tutor || `tutor-${index}`} value={tutor.id_tutor}>
                {tutor.nome_completo} (CPF: {tutor.cpf})
              </option>
            ))}
          </select>

          <label style={styles.label}>Nome do Animal:</label>
          <input type="text" value={formDados.nome} onChange={e => setFormDados({...formDados, nome: e.target.value})} required style={styles.input} />

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

          <button type="submit" style={styles.btnSub}>Salvar Cadastro</button>
        </form>

        {msg.texto && <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: msg.cor }}>{msg.texto}</div>}
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '600px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#000000', marginTop: 0, marginBottom: '20px' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '8px 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  label: { fontWeight: 'bold', color: '#333', fontSize: '14px' },
  btnSub: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }
};