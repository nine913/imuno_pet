"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function VetCadastrarVacina() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

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

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
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
      intervalo_doses_dias: form.tipo_dose === 'intervalo' ? form.intervalo_doses_dias : 0,
      id_usuario_log: usuario.id_usuario
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

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  return (
    <LayoutPainel>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', padding: '40px 20px', boxSizing: 'border-box' }}>
        <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', border: altoContraste ? '3px solid #ffcc00' : 'none' }}>
          
          <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Cadastrar Nova Vacina</h2>
          
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Nome da Vacina:</label>
            <input 
              type="text" 
              value={form.nome_vacina} 
              onChange={(e) => setForm({ ...form, nome_vacina: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
            />
            
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Fabricante:</label>
            <input 
              type="text" 
              value={form.fabricante} 
              onChange={(e) => setForm({ ...form, fabricante: e.target.value })} 
              required 
              style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
            />

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Doenças Prevenidas:</label>
            <textarea 
              value={form.doencas_prevenidas} 
              onChange={(e) => setForm({ ...form, doencas_prevenidas: e.target.value })} 
              rows="3" 
              required 
              style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit', resize: 'vertical' }} 
            />
            
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Tipo de Dose:</label>
            <select 
              value={form.tipo_dose} 
              onChange={handleTipoDoseChange} 
              required 
              style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}
            >
              <option value="">Selecione...</option>
              <option value="unica">Dose Única</option>
              <option value="intervalo">Múltiplas Doses (Com Intervalo)</option>
            </select>

            {form.tipo_dose === 'intervalo' && (
              <>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario }}>Intervalo entre doses (em dias):</label>
                <input 
                  type="number" 
                  value={form.intervalo_doses_dias} 
                  onChange={handleIntervaloChange} 
                  min="0" 
                  required 
                  style={{ width: '100%', padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
                />
              </>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }}>
                Salvar Dados
              </button>
              <button 
                type="button" 
                style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} 
                onClick={() => router.push('/veterinario/vacinas')}
              >
                Cancelar
              </button>
            </div>
          </form>
          
          {mensagem.texto && (
            <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: mensagem.cor }}>
              {mensagem.texto}
            </div>
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}