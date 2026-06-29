"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function VetAtrasados() {
  const [usuario, setUsuario] = useState(null);
  const [atrasados, setAtrasados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

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
    carregarAtrasados(user.id_clinica);

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
  }, [router]);

  const carregarAtrasados = async (id_clinica) => {
    setCarregando(true);
    setErro('');
    
    if (!id_clinica) {
      setCarregando(false);
      return;
    }

    try {
      const resposta = await fetch(`http://localhost:3000/animais-atrasados?id_clinica=${id_clinica}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setAtrasados(dados);
      } else {
        setErro('Erro ao carregar os registros.');
      }
    } catch (e) {
      setErro('Erro de conexão com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#ff6b6b' : '#dc3545');
  const accentRed = altoContraste ? '#ffcc00' : '#dc3545';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor }}>
        <h2 style={{ color: headerColor, marginTop: 0 }}>⚠️ Controle de Vacinação Atrasada</h2>
        <p style={{ color: textSecundario }}>Lista de pacientes com doses pendentes após a data de vencimento:</p>
        
        <div style={{ marginTop: '20px' }}>
          {carregando ? (
            <p style={{ color: textSecundario }}>Carregando...</p>
          ) : erro ? (
            <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{erro}</p>
          ) : atrasados.length === 0 ? (
            <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.2em' }}>
              Nenhuma vacina atrasada no sistema!
            </p>
          ) : (
            atrasados.map((item, index) => {
              const dataVenc = new Date(item.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
              const telLimpo = item.telefone ? item.telefone.replace(/\D/g, '') : '';
              const mensagemWhats = `Olá, ${item.nome_tutor}. Notamos no sistema ImunoPet que a vacina ${item.nome_vacina} do(a) ${item.nome_animal} venceu em ${dataVenc}. Gostaria de agendar a nova dose?`;
              const linkWhats = `https://wa.me/55${telLimpo}?text=${encodeURIComponent(mensagemWhats)}`;

              return (
                <div key={index} style={{ 
                  border: `1px solid ${borderColor}`, 
                  borderLeft: `5px solid ${accentRed}`, 
                  padding: '20px', 
                  borderRadius: '8px', 
                  marginBottom: '15px', 
                  backgroundColor: bgCard, 
                  color: textColor, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '15px',
                  boxShadow: isEscuro ? 'none' : '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                  <div>
                    <strong style={{ fontSize: '1.2em' }}>🐾 {item.nome_animal} ({item.especie})</strong><br />
                    <span style={{ display: 'inline-block', margin: '5px 0' }}>Vacina: <strong>{item.nome_vacina}</strong> (Venceu em: {dataVenc})</span><br />
                    <span style={{ fontSize: '0.9em', color: textSecundario }}>Tutor: {item.nome_tutor} | Contato: {item.telefone}</span>
                  </div>
                  <a href={linkWhats} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center', fontSize: 'inherit' }}>
                    📱 Entrar em Contato
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}