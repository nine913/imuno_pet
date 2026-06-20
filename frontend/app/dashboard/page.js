"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../components/LayoutPainel';

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
      setUsuario(JSON.parse(usuarioString));
    }
  }, [router]);

  if (!isMounted || !usuario) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>Carregando painel...</div>;

  const perfilUsuario = usuario.perfil.toUpperCase();

  return (
    <LayoutPainel>
      <div style={styles.container}>
        
        <h2 style={styles.h2}>Bem-vindo ao Painel ImunoPet</h2>
        <p style={{ marginBottom: '30px', color: '#333', fontSize: '16px' }}>
          Utilize o menu lateral esquerdo ou clique nos atalhos abaixo para navegar:
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

          {perfilUsuario === 'ADMINISTRADOR' && (
             <>
              <div style={styles.card} onClick={() => router.push('/admin/clinicas')}>
                <h3 style={styles.cardTitle}>🏥 Gerenciar Clínicas</h3>
                <p style={styles.cardText}>Cadastre e edite as clínicas que utilizam o sistema.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/admin/gestores')}>
                <h3 style={styles.cardTitle}>👔 Gestores de Clínica</h3>
                <p style={styles.cardText}>Vincule contas de gestores às clínicas cadastradas.</p>
              </div>
              
              <div style={styles.card} onClick={() => router.push('/admin/governo')}>
                <h3 style={styles.cardTitle}>🏛️ Acessos do Governo</h3>
                <p style={styles.cardText}>Gerencie os perfis da Vigilância Sanitária e Órgãos Públicos.</p>
              </div>

              <div style={styles.card} onClick={() => router.push('/admin/vacinas')}>
                <h3 style={styles.cardTitle}>💉 Catálogo de Vacinas</h3>
                <p style={styles.cardText}>Gerencie a tabela base de vacinas e fabricantes para todo o sistema.</p>
              </div>

              <div style={styles.card} onClick={() => router.push('/admin/especies')}>
                <h3 style={styles.cardTitle}>🐾 Catálogo de Espécies</h3>
                <p style={styles.cardText}>Gerencie as espécies e raças de animais cadastradas no sistema.</p>
              </div>

              <div style={styles.card} onClick={() => router.push('/admin/avisos')}>
                <h3 style={styles.cardTitle}>📢 Avisos Globais</h3>
                <p style={styles.cardText}>Crie e gerencie os comunicados para os usuários da plataforma.</p>
              </div>

              <div style={styles.card} onClick={() => router.push('/admin/auditoria')}>
                <h3 style={styles.cardTitle}>🔍 Logs de Auditoria</h3>
                <p style={styles.cardText}>Acesse o histórico de ações realizadas no sistema.</p>
              </div>
             </>
          )}

        </div>
      </div>
    </LayoutPainel>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
  h2: { color: '#0056b3', margin: '0 0 10px 0', fontSize: '28px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '25px', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  cardTitle: { color: '#0056b3', margin: '0 0 10px 0', fontSize: '18px' },
  cardText: { color: '#444', margin: '0', fontSize: '14px', lineHeight: '1.5' }
};