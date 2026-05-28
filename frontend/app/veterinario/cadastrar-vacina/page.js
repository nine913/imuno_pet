"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VetCadastrarVacina() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  const [form, setForm] = useState({
    nome_vacina: '',
    doencas_prevenidas: '',
    fabricante: '',
    tipo_dose: '',
    intervalo_dose_dias: ''
  });

  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

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
  }, [router]);

  const handleTipoDoseChange = (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      tipo_dose: value,
      intervalo_dose_dias: value === 'intervalo' ? form.intervalo_dose_dias : ''
    });
  };

  const handleIntervaloChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setForm({ ...form, intervalo_dose_dias: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      nome_vacina: form.nome_vacina,
      doencas_prevenidas: form.doencas_prevenidas,
      fabricante: form.fabricante,
      intervalo_dose_dias: form.tipo_dose === 'intervalo' ? form.intervalo_dose_dias : 0
    };

    try {
      const resposta = await fetch('http://localhost:3000/cadastrar-vacina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem({ texto: dados.mensagem, cor: 'green' });
        setTimeout(() => {
          router.push('/veterinario/vacinas');
        }, 1500);
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
        <h2 style={styles.h2}>Cadastrar Nova Vacina</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            value={form.nome_vacina} 
            onChange={(e) => setForm({ ...form, nome_vacina: e.target.value })} 
            placeholder="Nome da Vacina (Ex: V10, Antirrábica)" 
            required 
            style={styles.input} 
          />
          
          <textarea 
            value={form.doencas_prevenidas} 
            onChange={(e) => setForm({ ...form, doencas_prevenidas: e.target.value })} 
            placeholder="Doenças Prevenidas (Ex: Cinomose, Parvovirose...)" 
            rows="4" 
            required 
            style={styles.input} 
          />
          
          <input 
            type="text" 
            value={form.fabricante} 
            onChange={(e) => setForm({ ...form, fabricante: e.target.value })} 
            placeholder="Fabricante" 
            required 
            style={styles.input} 
          />
          
          <select 
            value={form.tipo_dose} 
            onChange={handleTipoDoseChange} 
            required 
            style={styles.input}
          >
            <option value="">Selecione o Tipo de Dose...</option>
            <option value="unica">Dose Única</option>
            <option value="intervalo">Múltiplas Doses (Com Intervalo)</option>
          </select>

          {form.tipo_dose === 'intervalo' && (
            <input 
              type="number" 
              value={form.intervalo_dose_dias} 
              onChange={handleIntervaloChange} 
              placeholder="Intervalo entre doses (em dias)" 
              min="0" 
              required 
              style={styles.input} 
            />
          )}
          
          <button type="submit" style={styles.button}>Salvar Vacina</button>
          
          <button 
            type="button" 
            style={{ ...styles.button, ...styles.btnVoltar }} 
            onClick={() => router.push('/veterinario/vacinas')}
          >
            Cancelar / Voltar
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
    marginTop: '10px',
    fontWeight: 'bold'
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