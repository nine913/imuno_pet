"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MeusAnimaisTutor() {
  const [usuario, setUsuario] = useState(null);
  const [todosOsPets, setTodosOsPets] = useState([]);
  const [petsExibidos, setPetsExibidos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
    } else {
      const user = JSON.parse(usuarioString);
      setUsuario(user);
      buscarDadosIniciais(user.id_usuario);
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

  if (!usuario) return <h2 style={{ padding: '20px' }}>Carregando...</h2>;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={() => router.push('/dashboard')}>
          Voltar ao Painel
        </button>
        <h2 style={styles.h2}>Meus Animais</h2>

        <div style={styles.areaAlertas}>
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
                <div key={index} style={styles.alertaAtrasado}>
                  🚨 <strong>Atenção Inadimplência:</strong> A vacina <strong>{alerta.nome_vacina}</strong> do seu pet <strong>{alerta.nome_animal}</strong> está vencida desde <strong>{dataFormatada}</strong>. Regularize a imunização o quanto antes!
                </div>
              );
            } else if (diffDays <= 30 && diffDays >= 0) {
              return (
                <div key={index} style={styles.alertaLembrete}>
                  📅 <strong>Lembrete de Vacina:</strong> A dose da vacina <strong>{alerta.nome_vacina}</strong> para o seu pet <strong>{alerta.nome_animal}</strong> está chegando! Vencimento em <strong>{dataFormatada}</strong> (Faltam {diffDays} dias).
                </div>
              );
            }
            return null;
          })}
        </div>

        <div style={styles.searchContainer}>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Pesquisar por nome do pet ou raça..."
            style={styles.input}
          />
          <button style={styles.btnBuscar} onClick={handleBuscar}>Pesquisar</button>
        </div>

        {erro ? (
          <p style={{ color: 'red' }}>{erro}</p>
        ) : petsExibidos.length === 0 ? (
          <p>Nenhum animal encontrado.</p>
        ) : (
          <div>
            {petsExibidos.map(pet => (
              <div key={pet.id_animal} style={styles.petCard}>
                <div>
                  <strong style={{ fontSize: '20px', color: '#0056b3' }}>🐾 {pet.nome}</strong><br />
                  <span style={{ fontSize: '15px', color: '#333' }}>
                    Espécie: {pet.especie} | Raça: {pet.raca || 'Não informada'}
                  </span>
                </div>
                <button 
                  style={styles.btnHistorico} 
                  onClick={() => router.push(`/tutor/historico?id=${pet.id_animal}`)}
                >
                  📋 Carteira de Vacinação
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '800px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#0056b3', marginTop: 0 },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px' },
  areaAlertas: { marginBottom: '20px' },
  alertaAtrasado: { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '15px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
  alertaLembrete: { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: '15px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
  searchContainer: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  btnBuscar: { padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  petCard: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginTop: '15px', backgroundColor: '#fdfdfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btnHistorico: { backgroundColor: '#17a2b8', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }
};