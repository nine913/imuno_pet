"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VetCadastrarTutor() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  const [form, setForm] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    senha: '',
    telefone: '',
    estado: '',
    cidade: '',
    bairro: '',
    nome_animal: '',
    especie: '',
    raca: '',
    data_nascimento: ''
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

  const handleCpfChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setForm({ ...form, cpf: v });
  };

  const handleTelefoneChange = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    setForm({ ...form, telefone: v });
  };

  const handleEstadoChange = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase();
    setForm({ ...form, estado: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fetch('http://localhost:3000/cadastrar-tutor-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        setMensagem({ texto: dados.mensagem, cor: 'green' });
        setTimeout(() => {
          router.push('/veterinario/tutores');
        }, 2000);
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
        <h2 style={styles.h2}>Cadastrar Tutor e Pet</h2>
        <form onSubmit={handleSubmit}>
          <h3 style={styles.h3}>Dados do Tutor</h3>
          <div style={styles.row}>
            <div style={styles.col}>
              <input type="text" value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} placeholder="Nome Completo" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <input type="text" value={form.cpf} onChange={handleCpfChange} placeholder="CPF" maxLength="14" required style={styles.input} />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.col}>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="E-mail" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <input type="password" value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} placeholder="Senha de Acesso" required style={styles.input} />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.col}>
              <input type="tel" value={form.telefone} onChange={handleTelefoneChange} placeholder="Telefone" maxLength="15" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <input type="text" value={form.estado} onChange={handleEstadoChange} placeholder="Estado (ex: PA)" maxLength="2" required style={styles.input} />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.col}>
              <input type="text" value={form.cidade} onChange={e => setForm({...form, cidade: e.target.value})} placeholder="Cidade" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <input type="text" value={form.bairro} onChange={e => setForm({...form, bairro: e.target.value})} placeholder="Bairro" required style={styles.input} />
            </div>
          </div>

          <hr style={styles.hr} />

          <h3 style={styles.h3}>Dados do Primeiro Pet</h3>
          <div style={styles.row}>
            <div style={styles.col}>
              <input type="text" value={form.nome_animal} onChange={e => setForm({...form, nome_animal: e.target.value})} placeholder="Nome do Pet" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <select value={form.especie} onChange={e => setForm({...form, especie: e.target.value})} required style={styles.input}>
                <option value="">Selecione a Espécie...</option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.col}>
              <input type="text" value={form.raca} onChange={e => setForm({...form, raca: e.target.value})} placeholder="Raça" required style={styles.input} />
            </div>
            <div style={styles.col}>
              <input type="date" value={form.data_nascimento} onChange={e => setForm({...form, data_nascimento: e.target.value})} max={new Date().toISOString().split('T')[0]} required style={styles.input} />
            </div>
          </div>

          <button type="submit" style={styles.button}>Finalizar Cadastro</button>
          <button type="button" style={{ ...styles.button, ...styles.btnVoltar }} onClick={() => router.push('/veterinario/tutores')}>Cancelar / Voltar</button>
        </form>
        {mensagem.texto && <div style={{ ...styles.mensagem, color: mensagem.cor }}>{mensagem.texto}</div>}
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', margin: 0, padding: '20px', boxSizing: 'border-box' },
  container: { background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '600px', maxWidth: '100%' },
  h2: { textAlign: 'center', color: '#0056b3', marginTop: 0 },
  h3: { textAlign: 'center', color: '#0056b3', marginTop: 0 },
  row: { display: 'flex', gap: '15px' },
  col: { flex: 1 },
  input: { width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginTop: '15px', fontWeight: 'bold' },
  btnVoltar: { backgroundColor: '#6c757d' },
  mensagem: { textAlign: 'center', marginTop: '15px', fontWeight: 'bold' },
  hr: { border: 0, borderTop: '1px solid #eee', margin: '20px 0' }
};