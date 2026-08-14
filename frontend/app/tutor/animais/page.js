"use client";

import { apiFetch } from '../../lib/api';
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
      const resAlertas = await apiFetch(`/tutor/alertas/${id_usuario}?id_usuario_log=${id_usuario}`);
      if (resAlertas.ok) {
        const dataAlertas = await resAlertas.json();
        setAlertas(dataAlertas);
      }

      const resPets = await apiFetch(`/tutor/animais/${id_usuario}?id_usuario_log=${id_usuario}`);
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
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#f8fafc';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');

  const alertaAtrasadoBg = isEscuro ? '#7f1d1d' : '#fef2f2';
  const alertaAtrasadoText = isEscuro ? '#fecaca' : '#dc2626';
  const alertaAtrasadoBorder = isEscuro ? '#991b1b' : '#fecaca';

  const alertaLembreteBg = isEscuro ? '#78350f' : '#fffbeb';
  const alertaLembreteText = isEscuro ? '#fde68a' : '#d97706';
  const alertaLembreteBorder = isEscuro ? '#92400e' : '#fde68a';

  return (
    <LayoutPainel>
      <style>{`
        .premium-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        }
        .premium-btn {
          transition: all 0.2s ease;
        }
        .premium-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .premium-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '24px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Meus Pets
        </h2>

        <div style={{ marginBottom: '24px' }}>
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
                <div key={index} style={{ backgroundColor: alertaAtrasadoBg, color: alertaAtrasadoText, border: `1px solid ${alertaAtrasadoBorder}`, padding: '16px 20px', borderRadius: '12px', marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '20px', marginRight: '12px' }}>🚨</span>
                  <div>
                    <strong style={{ fontWeight: '700' }}>Atenção:</strong> A vacina <strong>{alerta.nome_vacina}</strong> do(a) <strong>{alerta.nome_animal}</strong> está vencida desde <strong>{dataFormatada}</strong>.
                  </div>
                </div>
              );
            } else if (diffDays <= 30 && diffDays >= 0) {
              return (
                <div key={index} style={{ backgroundColor: alertaLembreteBg, color: alertaLembreteText, border: `1px solid ${alertaLembreteBorder}`, padding: '16px 20px', borderRadius: '12px', marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '20px', marginRight: '12px' }}>📅</span>
                  <div>
                    <strong style={{ fontWeight: '700' }}>Lembrete:</strong> A vacina <strong>{alerta.nome_vacina}</strong> para o(a) <strong>{alerta.nome_animal}</strong> vence em <strong>{dataFormatada}</strong> (Faltam {diffDays} dias).
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input
            type="text"
            className="premium-input"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar por nome ou raça..."
            style={{ width: '100%', padding: '14px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '15px', outline: 'none', transition: 'all 0.2s' }}
          />
          <button className="premium-btn" style={{ padding: '0 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }} onClick={handleBuscar}>
            Pesquisar
          </button>
        </div>

        {erro ? (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', fontWeight: '500' }}>{erro}</div>
        ) : petsExibidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: bgCard, borderRadius: '16px', border: `1px dashed ${borderColor}`, color: textSecundario }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🐕</span>
            Nenhum animal encontrado.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {petsExibidos.map(pet => (
              <div key={pet.id_animal} className="premium-card" style={{ border: `1px solid ${borderColor}`, padding: '24px', borderRadius: '16px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: isEscuro ? '#1e3a8a' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    🐾
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', color: headerColor, margin: '0 0 4px 0', fontWeight: '700' }}>{pet.nome}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: textSecundario, backgroundColor: inputBg, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${borderColor}`, fontWeight: '500' }}>
                        {pet.especie}
                      </span>
                      <span style={{ fontSize: '13px', color: textSecundario, backgroundColor: inputBg, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${borderColor}`, fontWeight: '500' }}>
                        {pet.raca || 'Raça não informada'}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="premium-btn"
                  style={{ backgroundColor: '#0f766e', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }} 
                  onClick={() => router.push(`/tutor/historico?id=${pet.id_animal}`)}
                >
                  <span style={{ fontSize: '16px' }}>📋</span> Carteira de Vacinação
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutPainel>
  );
}