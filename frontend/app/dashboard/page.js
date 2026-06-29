"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../components/LayoutPainel';

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    
    if (!usuarioString) {
      router.push('/');
    } else {
      const user = JSON.parse(usuarioString);
      setUsuario(user);

      const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
      if (configSalvas) {
        const config = JSON.parse(configSalvas);
        setTema(config.tema || 'claro');
        setAltoContraste(config.altoContraste || false);
      }
    }
  }, [router]);

  if (!isMounted || !usuario) return null;

  const perfilUsuario = usuario.perfil.toUpperCase();

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#444444';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  const cardStyle = { 
    backgroundColor: bgCard, 
    border: `1px solid ${borderColor}`, 
    borderRadius: '8px', 
    padding: '25px', 
    cursor: 'pointer', 
    transition: 'transform 0.2s, boxShadow 0.2s', 
    boxShadow: isEscuro ? 'none' : '0 4px 6px rgba(0,0,0,0.05)' 
  };

  const cardTitleStyle = { color: headerColor, margin: '0 0 10px 0', fontSize: '1.1em' };
  const cardTextStyle = { color: textSecundario, margin: 0, fontSize: '0.9em', lineHeight: '1.5' };

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor }}>
        
        <h2 style={{ color: headerColor, margin: '0 0 10px 0', fontSize: '1.8em' }}>Bem-vindo ao Painel ImunoPet</h2>
        <p style={{ marginBottom: '30px', color: textSecundario, fontSize: '1em' }}>
          Utilize o menu lateral esquerdo ou clique nos atalhos abaixo para navegar:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {perfilUsuario === 'TUTOR' && (
            <div style={cardStyle} onClick={() => router.push('/tutor/animais')}>
              <h3 style={cardTitleStyle}>🐾 Meus Pets e Vacinas</h3>
              <p style={cardTextStyle}>Acesse as informações dos seus animais e consulte as carteirinhas de vacinação.</p>
            </div>
          )}

          {perfilUsuario === 'VETERINARIO' && (
            <>
              <div style={cardStyle} onClick={() => router.push('/veterinario/buscar')}>
                <h3 style={cardTitleStyle}>🐾 Gerenciar Pacientes</h3>
                <p style={cardTextStyle}>Busque, cadastre e edite os perfis dos animais atendidos na clínica.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/veterinario/tutores')}>
                <h3 style={cardTitleStyle}>👤 Gerenciar Tutores</h3>
                <p style={cardTextStyle}>Acesse e gerencie o cadastro dos responsáveis pelos animais.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/veterinario/vacinas')}>
                <h3 style={cardTitleStyle}>💉 Catálogo de Vacinas</h3>
                <p style={cardTextStyle}>Consulte e cadastre os imunizantes disponíveis para aplicação.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/veterinario/relatorio')}>
                <h3 style={{...cardTitleStyle, color: isEscuro ? '#4dd0e1' : '#17a2b8'}}>📊 Relatórios de Vacinação</h3>
                <p style={cardTextStyle}>Extraia relatórios e consulte o histórico de vacinas aplicadas.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/veterinario/atrasados')}>
                <h3 style={{...cardTitleStyle, color: isEscuro ? '#ff6b6b' : '#dc3545'}}>⚠️ Vacinas Atrasadas</h3>
                <p style={cardTextStyle}>Verifique rapidamente os pacientes com doses pendentes ou em atraso.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/veterinario/especies')}>
                <h3 style={cardTitleStyle}>🐾 Catálogo de Espécies</h3>
                <p style={cardTextStyle}>Gerencie as espécies e raças de animais cadastradas no sistema.</p>
              </div>
            </>
          )}

          {(perfilUsuario === 'GESTOR' || perfilUsuario === 'GESTOR_CLINICA') && (
            <>
              <div style={cardStyle} onClick={() => router.push('/gestor/dashboard')}>
                <h3 style={cardTitleStyle}>📈 Visão Geral (Métricas)</h3>
                <p style={cardTextStyle}>Acompanhe o desempenho e as estatísticas gerais de atendimento da clínica.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/gestor/relatorios')}>
                <h3 style={cardTitleStyle}>📑 Relatórios Avançados</h3>
                <p style={cardTextStyle}>Filtre e exporte dados estratégicos detalhados sobre as vacinações.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/gestor/equipe')}>
                <h3 style={cardTitleStyle}>👥 Gerenciar Equipe</h3>
                <p style={cardTextStyle}>Cadastre e edite os perfis dos médicos veterinários da sua clínica.</p>
              </div>
            </>
          )}

          {perfilUsuario === 'GOVERNO' && (
            <>
              <div style={cardStyle} onClick={() => router.push('/governo/dashboard')}>
                <h3 style={cardTitleStyle}>🦠 Monitoramento Epidemiológico</h3>
                <p style={cardTextStyle}>Acompanhe as métricas globais de vacinação e controle de endemias na sua região.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/governo/relatorios')}>
                <h3 style={cardTitleStyle}>📊 Relatórios Avançados</h3>
                <p style={cardTextStyle}>Gere documentos analíticos baseados nos dados sanitários unificados.</p>
              </div>
            </>
          )}

          {perfilUsuario === 'ADMINISTRADOR' && (
             <>
              <div style={cardStyle} onClick={() => router.push('/admin/clinicas')}>
                <h3 style={cardTitleStyle}>🏥 Gerenciar Clínicas</h3>
                <p style={cardTextStyle}>Cadastre e edite as clínicas que utilizam o sistema.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/admin/gestores')}>
                <h3 style={cardTitleStyle}>👔 Gestores de Clínica</h3>
                <p style={cardTextStyle}>Vincule contas de gestores às clínicas cadastradas.</p>
              </div>
              
              <div style={cardStyle} onClick={() => router.push('/admin/governo')}>
                <h3 style={cardTitleStyle}>🏛️ Acessos do Governo</h3>
                <p style={cardTextStyle}>Gerencie os perfis da Vigilância Sanitária e Órgãos Públicos.</p>
              </div>

              <div style={cardStyle} onClick={() => router.push('/admin/vacinas')}>
                <h3 style={cardTitleStyle}>💉 Catálogo de Vacinas</h3>
                <p style={cardTextStyle}>Gerencie a tabela base de vacinas e fabricantes para todo o sistema.</p>
              </div>

              <div style={cardStyle} onClick={() => router.push('/admin/especies')}>
                <h3 style={cardTitleStyle}>🐾 Catálogo de Espécies</h3>
                <p style={cardTextStyle}>Gerencie as espécies e raças de animais cadastradas no sistema.</p>
              </div>

              <div style={cardStyle} onClick={() => router.push('/admin/avisos')}>
                <h3 style={cardTitleStyle}>📢 Avisos Globais</h3>
                <p style={cardTextStyle}>Crie e gerencie os comunicados para os usuários da plataforma.</p>
              </div>

              <div style={cardStyle} onClick={() => router.push('/admin/auditoria')}>
                <h3 style={cardTitleStyle}>🔍 Logs de Auditoria</h3>
                <p style={cardTextStyle}>Acesse o histórico de ações realizadas no sistema.</p>
              </div>
             </>
          )}

        </div>
      </div>
    </LayoutPainel>
  );
}