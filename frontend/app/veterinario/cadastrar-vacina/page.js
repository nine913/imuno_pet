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
    intervalo_doses_dias: ''
  });

  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO' && user.perfil !== 'GESTOR_CLINICA' && user.perfil !== 'ADMINISTRADOR') {
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
      intervalo_doses_dias: value === 'intervalo' ? form.intervalo_doses_dias : ''
    });
  };

  const handleIntervaloChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setForm({ ...form, intervalo_doses_dias: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      nome_vacina: form.nome_vacina,
      doencas_prevenidas: form.doencas_prevenidas,
      fabricante: form.fabricante,
      intervalo_doses_dias: form.tipo_dose === 'intervalo' ? form.intervalo_doses_dias : 0
    };

    try {
      const resposta = await fetch('http://localhost:3000/admin/cadastrar-vacina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem({ texto: dados.mensagem || 'Vacina salva com sucesso!', cor: 'green' });
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
          
          <label style={styles.label}>Nome da Vacina:</label>
          <input 
            type="text" 
            value={form.nome_vacina} 
            onChange={(e) => setForm({ ...form, nome_vacina: e.target.value })} 
            required 
            style={styles.input} 
          />
          
          <label style={styles.label}>Fabricante:</label>
          <input 
            type="text" 
            value={form.fabricante} 
            onChange={(e) => setForm({ ...form, fabricante: e.target.value })} 
            required 
            style={styles.input} 
          />

          <label style={styles.label}>Doenças Prevenidas:</label>
          <textarea 
            value={form.doencas_prevenidas} 
            onChange={(e) => setForm({ ...form, doencas_prevenidas: e.target.value })} 
            rows="3" 
            required 
            style={styles.input} 
          />
          
          <label style={styles.label}>Tipo de Dose:</label>
          <select 
            value={form.tipo_dose} 
            onChange={handleTipoDoseChange} 
            required 
            style={styles.input}
          >
            <option value="">Selecione...</option>
            <option value="unica">Dose Única</option>
            <option value="intervalo">Múltiplas Doses (Com Intervalo)</option>
          </select>

          {form.tipo_dose === 'intervalo' && (
            <>
              <label style={styles.label}>Intervalo entre doses (em dias):</label>
              <input 
                type="number" 
                value={form.intervalo_doses_dias} 
                onChange={handleIntervaloChange} 
                min="0" 
                required 
                style={styles.input} 
              />
            </>
          )}
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={styles.btnSalvar}>Salvar Dados</button>
            <button 
              type="button" 
              style={styles.btnVoltar} 
              onClick={() => router.push('/veterinario/vacinas')}
            >
              Cancelar
            </button>
          </div>
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
    width: '450px'
  },
  h2: {
    color: '#000000',
    marginTop: 0,
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '0 0 15px 0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    color: '#333'
  },
  btnSalvar: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  btnVoltar: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  mensagem: {
    textAlign: 'center',
    marginTop: '15px',
    fontWeight: 'bold'
  }
};