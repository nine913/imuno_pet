"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    
    if (!usuarioString) {
      router.push('/');
    } else {
      const user = JSON.parse(usuarioString);
      if (user.perfil.toUpperCase() === 'ADMINISTRADOR') {
        router.push('/admin/dashboard');
      } else {
        setUsuario(user);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioImunoPet');
    router.push('/');
  };

  if (!isMounted || !usuario) {
    return null;
  }

  const perfilUsuario = usuario.perfil.toUpperCase();
  const nomeExibicao = usuario.nome_completo || usuario.nome || 'Usuário';

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        
        <div style={styles.header}>
          <div>
            <h2 style={styles.h2}>Olá, {nomeExibicao}! 👋</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Você está logado como: <strong>{perfilUsuario.replace('_', ' ')}</strong>
            </p>
          </div>
          <button style={styles.btnSair} onClick={handleLogout}>
            Sair do Sistema
          </button>
        </div>

        <p style={{ marginBottom: '30px', color: '#333', fontSize: '16px' }}>
          Selecione uma das opções abaixo para acessar os módulos do seu painel:
        </p>

        <div style={styles.grid}>
          
          {perfilUsuario === 'TUTOR' && (
            <div style={styles.card} onClick={() => router.push('/tutor/animais')}>
              <h3 style={styles.cardTitle}>🐾 Meus Pets e Vacinas</h3>
              <p style={styles.cardText}>Acesse as informações dos seus animais e consulte as carteirinhas de vacinação.</p>
            </div>
          )}

          {perfilUsuario === 'VETERINARIO' && (
            <>
              <div style={styles.card} onClick={() => router.push('/veterinario/buscar')}>
                <h3 style={styles.cardTitle}>🐾 Gerenciar Pacientes</h3>
                <p style={styles.cardText}>Busque, cadastre e edite os perfis dos animais atendidos na clínica.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/veterinario/tutores')}>
                <h3 style={styles.cardTitle}>👤 Gerenciar Tutores</h3>
                <p style={styles.cardText}>Acesse e gerencie o cadastro dos responsáveis pelos animais.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/veterinario/vacinas')}>
                <h3 style={styles.cardTitle}>💉 Catálogo de Vacinas</h3>
                <p style={styles.cardText}>Consulte e cadastre os imunizantes disponíveis para aplicação.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/veterinario/relatorio')}>
                <h3 style={{...styles.cardTitle, color: '#17a2b8'}}>📊 Relatórios de Vacinação</h3>
                <p style={styles.cardText}>Extraia relatórios e consulte o histórico de vacinas aplicadas.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/veterinario/atrasados')}>
                <h3 style={{...styles.cardTitle, color: '#dc3545'}}>⚠️ Vacinas Atrasadas</h3>
                <p style={styles.cardText}>Verifique rapidamente os pacientes com doses pendentes ou em atraso.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/veterinario/especies')}>
                <h3 style={styles.cardTitle}>🐾 Catálogo de Espécies</h3>
                <p style={styles.cardText}>Gerencie as espécies e raças de animais cadastradas no sistema.</p>
              </div>
            </>
          )}

          {(perfilUsuario === 'GESTOR' || perfilUsuario === 'GESTOR_CLINICA') && (
            <>
              <div style={styles.card} onClick={() => router.push('/gestor/dashboard')}>
                <h3 style={styles.cardTitle}>📈 Visão Geral (Métricas)</h3>
                <p style={styles.cardText}>Acompanhe o desempenho e as estatísticas gerais de atendimento da clínica.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/gestor/relatorios')}>
                <h3 style={styles.cardTitle}>📑 Relatórios Avançados</h3>
                <p style={styles.cardText}>Filtre e exporte dados estratégicos detalhados sobre as vacinações.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/gestor/equipe')}>
                <h3 style={styles.cardTitle}>👥 Gerenciar Equipe</h3>
                <p style={styles.cardText}>Cadastre e edite os perfis dos médicos veterinários da sua clínica.</p>
              </div>
            </>
          )}

          {perfilUsuario === 'GOVERNO' && (
            <>
              <div style={styles.card} onClick={() => router.push('/governo/dashboard')}>
                <h3 style={styles.cardTitle}>🦠 Monitoramento Epidemiológico</h3>
                <p style={styles.cardText}>Acompanhe as métricas globais de vacinação e controle de endemias na sua região.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/governo/relatorios')}>
                <h3 style={styles.cardTitle}>📊 Relatórios Avançados</h3>
                <p style={styles.cardText}>Gere documentos analíticos baseados nos dados sanitários unificados.</p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
  container: { maxWidth: '1000px', width: '100%', background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f4f4f9', paddingBottom: '20px', marginBottom: '30px' },
  h2: { color: '#0056b3', margin: 0, fontSize: '28px' },
  btnSair: { backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fdfdfd', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '25px', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s' },
  cardTitle: { color: '#0056b3', margin: '0 0 10px 0', fontSize: '18px' },
  cardText: { color: '#444', margin: 0, fontSize: '14px', lineHeight: '1.5' }
};