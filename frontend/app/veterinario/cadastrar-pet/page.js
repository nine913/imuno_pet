"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VetCadastrarPet() {
  const [usuario, setUsuario] = useState(null);
  const [tutores, setTutores] = useState([]);
  
  const [idUsuarioTutor, setIdUsuarioTutor] = useState('');
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [raca, setRaca] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  const router = useRouter();
  const dataHoje = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);
    carregarTutores();
  }, [router]);

  const carregarTutores = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/tutores');
      if (resposta.ok) {
        setTutores(await resposta.json());
      }
    } catch (erro) {
      setMensagem({ texto: 'Erro ao carregar lista de tutores.', cor: 'red' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch('http://localhost:3000/cadastrar-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idUsuarioTutor,
          nome,
          especie,
          raca,
          data_nascimento: dataNascimento
        })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem({ texto: dados.mensagem, cor: 'green' });
        setIdUsuarioTutor('');
        setNome('');
        setEspecie('');
        setRaca('');
        setDataNascimento('');
      } else {
        setMensagem({ texto: dados.erro, cor: 'red' });
      }
    } catch (erro) {
      setMensagem({ texto: 'Erro ao conectar com o servidor.', cor: 'red' });
    }
  };

  if (!usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2 style={styles.h2}>Cadastrar Novo Animal</h2>
        <form onSubmit={handleSubmit}>
          <select 
            value={idUsuarioTutor} 
            onChange={(e) => setIdUsuarioTutor(e.target.value)} 
            required 
            style={styles.input}
          >
            <option value="">Selecione o Tutor dono do pet...</option>
            {tutores.map(tutor => (
              <option key={tutor.id_usuario} value={tutor.id_usuario}>
                {tutor.nome_completo} (CPF: {tutor.cpf})
              </option>
            ))}
          </select>
          
          <input 
            type="text" 
            value={nome} 
            onChange={(e) => setNome(e.target.value)} 
            placeholder="Nome do Pet" 
            required 
            style={styles.input} 
          />
          
          <select 
            value={especie} 
            onChange={(e) => setEspecie(e.target.value)} 
            required 
            style={styles.input}
          >
            <option value="">Selecione a Espécie...</option>
            <option value="Cachorro">Cachorro</option>
            <option value="Gato">Gato</option>
            <option value="Outro">Outro</option>
          </select>
          
          <input 
            type="text" 
            value={raca} 
            onChange={(e) => setRaca(e.target.value)} 
            placeholder="Raça" 
            required 
            style={styles.input} 
          />
          
          <input 
            type="date" 
            value={dataNascimento} 
            onChange={(e) => setDataNascimento(e.target.value)} 
            max={dataHoje} 
            required 
            style={styles.input} 
          />
          
          <button type="submit" style={styles.button}>Salvar Animal</button>
          
          <button 
            type="button" 
            style={{ ...styles.button, ...styles.btnVoltar }} 
            onClick={() => router.push('/veterinario/buscar')}
          >
            Voltar ao Painel
          </button>
        </form>
        
        {mensagem.texto && (
          <div style={{ ...styles.mensagem, color: mensagem.cor }}>
            {mensagem.texto}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f4f4f9',
    margin: 0,
    padding: '20px',
    boxSizing: 'border-box'
  },
  container: {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '400px'
  },
  h2: {
    textAlign: 'center',
    color: '#0056b3',
    marginTop: 0
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px'
  },
  btnVoltar: {
    backgroundColor: '#6c757d'
  },
  mensagem: {
    textAlign: 'center',
    marginTop: '15px',
    fontWeight: 'bold'
  }
};