"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function MeusAnimaisTutor() {
  const [usuario, setUsuario] = useState(null);
  const [todosOsPets, setTodosOsPets] = useState([]);
  const [petsExibidos, setPetsExibidos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
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
    setUsuario(user);
    buscarDadosIniciais(user.id_usuario);

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }
  }, [router]);

  const buscarDadosIniciais = async (id_usuario) => {
    try {
      const resAlertas = await fetch(`http://localhost:3000/tutor/alertas/${id_usuario}?id_usuario_log=${id_usuario}`);
      if (resAlertas.ok) {
        const dataAlertas = await resAlertas.json();
        setAlertas(dataAlertas);
      }

      const resPets = await fetch(`http://localhost:3000/tutor/animais/${id_usuario}?id_usuario_log=${id_usuario}`);
      if (resPets.ok) {
        const dataPets = await resPets.json();
        setTodosOsPets(dataPets);
        setPetsExibidos(dataPets);
      } else {
        setErro('Erro ao carregar a lista de animais.');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
    }
  };

  const handleBuscar = () => {
    const termo = termoBusca.toLowerCase();
    const filtrados = todosOsPets.filter(pet => 
      pet.nome.toLowerCase().includes(termo) || 
      (pet.raca && pet.raca.toLowerCase().includes(termo))
    );
    setPetsExibidos(filtrados);
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  const alertaAtrasadoBg = isEscuro ? '#4a191e' : '#f8d7da';
  const alertaAtrasadoText = isEscuro ? '#ffb3b8' : '#721c24';
  const alertaLembreteBg = isEscuro ? '#4d3a00' : '#fff3cd';
  const alertaLembreteText = isEscuro ? '#ffdf7e' : '#856404';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor }}>
        <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Meus Animais</h2>

        <div style={{ marginBottom: '20px' }}>
          {alertas.map((alerta, index) => {
            const dataLim = new Date(alerta.data_proxima_dose);
            const hoje = new Date();
            dataLim.setHours(0, 0, 0, 0);
            hoje.setHours(0, 0, 0, 0);
            const diffTime = dataLim - hoje;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const dataFormatada = new Date(alerta.data_proxima_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            if (alerta.status === 'ATRASADA') {
              return (
                <div key={index} style={{ backgroundColor: alertaAtrasadoBg, color: alertaAtrasadoText, border: `1px solid ${alertaAtrasadoText}`, padding: '15px', borderRadius: '6px', marginBottom: '15px', fontSize: 'inherit' }}>
                  🚨 <strong>Atenção Inadimplência:</strong> A vacina <strong>{alerta.nome_vacina}</strong> do seu pet <strong>{alerta.nome_animal}</strong> está vencida desde <strong>{dataFormatada}</strong>. Regularize a imunização o quanto antes!
                </div>
              );
            } else if (diffDays <= 30 && diffDays >= 0) {
              return (
                <div key={index} style={{ backgroundColor: alertaLembreteBg, color: alertaLembreteText, border: `1px solid ${alertaLembreteText}`, padding: '15px', borderRadius: '6px', marginBottom: '15px', fontSize: 'inherit' }}>
                  📅 <strong>Lembrete de Vacina:</strong> A dose da vacina <strong>{alerta.nome_vacina}</strong> para o seu pet <strong>{alerta.nome_animal}</strong> está chegando! Vencimento em <strong>{dataFormatada}</strong> (Faltam {diffDays} dias).
                </div>
              );
            }
            return null;
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Pesquisar por nome do pet ou raça..."
            style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}
          />
          <button style={{ padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'bold' }} onClick={handleBuscar}>Pesquisar</button>
        </div>

        {erro ? (
          <p style={{ color: '#dc3545', fontWeight: 'bold' }}>{erro}</p>
        ) : petsExibidos.length === 0 ? (
          <p style={{ color: textSecundario }}>Nenhum animal encontrado.</p>
        ) : (
          <div>
            {petsExibidos.map(pet => (
              <div key={pet.id_animal} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginBottom: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <strong style={{ fontSize: '1.2em', color: headerColor }}>🐾 {pet.nome}</strong><br />
                  <span style={{ fontSize: '0.9em', color: textSecundario, display: 'inline-block', marginTop: '5px' }}>
                    Espécie: {pet.especie} | Raça: {pet.raca || 'Não informada'}
                  </span>
                </div>
                <button 
                  style={{ backgroundColor: '#17a2b8', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 'inherit', fontWeight: 'bold' }} 
                  onClick={() => router.push(`/tutor/historico?id=${pet.id_animal}`)}
                >
                  📋 Carteira de Vacinação
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutPainel>
  );
}