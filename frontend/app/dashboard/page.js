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
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');
  
  const sombraEmoji = isEscuro ? 'drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.4))' : 'none';

  return (
    <LayoutPainel>
      <style>{`
        .premium-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: ${isEscuro ? '#475569' : '#cbd5e1'} !important;
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Bem-vindo ao Painel ImunoPet
          </h2>
          <p style={{ margin: 0, color: textSecundario, fontSize: '16px', maxWidth: '600px', lineHeight: '1.5' }}>
            Olá, <strong>{usuario.nome_completo || usuario.nome || 'Usuário'}</strong>. Selecione um dos atalhos abaixo para gerenciar suas tarefas e acessar as ferramentas do sistema.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          
          {perfilUsuario === 'TUTOR' && (
            <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/tutor/animais')}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#1e3a8a' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🐾</div>
              <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Meus Pets e Vacinas</h3>
              <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Acesse as informações dos seus animais e consulte as carteirinhas de vacinação digitais.</p>
            </div>
          )}

          {perfilUsuario === 'VETERINARIO' && (
            <>
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/veterinario/buscar')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#1e3a8a' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🐾</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Gerenciar Pacientes</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Busque, cadastre e edite os perfis dos animais atendidos na sua clínica.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/veterinario/tutores')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#3b2210' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>👤</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Gerenciar Tutores</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Acesse e gerencie o cadastro dos responsáveis pelos pacientes.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/veterinario/vacinas')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#064e3b' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>💉</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Catálogo de Vacinas</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Consulte e cadastre os imunizantes disponíveis para aplicação.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/veterinario/relatorio')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#083344' : '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>📊</div>
                <h3 style={{ color: isEscuro ? '#38bdf8' : '#0284c7', margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Relatórios Clínicos</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Extraia relatórios e consulte o histórico consolidado de vacinas aplicadas.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/veterinario/atrasados')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#450a0a' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>⚠️</div>
                <h3 style={{ color: isEscuro ? '#f87171' : '#dc2626', margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Vacinas Atrasadas</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Verifique rapidamente os pacientes com doses pendentes ou em atraso.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/veterinario/especies')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#1e293b' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🐈</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Catálogo de Espécies</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Gerencie as espécies e raças de animais disponíveis no sistema.</p>
              </div>
            </>
          )}

          {(perfilUsuario === 'GESTOR' || perfilUsuario === 'GESTOR_CLINICA') && (
            <>
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/gestor/dashboard')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#1e3a8a' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>📈</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Visão Estratégica</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Acompanhe o desempenho e as métricas de atendimento da sua clínica.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/gestor/relatorios')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#064e3b' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>📑</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Relatórios Avançados</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Filtre e exporte dados estratégicos detalhados sobre as vacinações.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/gestor/equipe')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#3b2210' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>👥</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Equipe Veterinária</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Gerencie o cadastro e acessos dos médicos veterinários da clínica.</p>
              </div>
            </>
          )}

          {perfilUsuario === 'GOVERNO' && (
            <>
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/governo/dashboard')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#451a03' : '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🦠</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Monitoramento Epidemiológico</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Painel visual para análise de dados de vacinação e controle de endemias.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/governo/relatorios')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#064e3b' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>📊</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Relatórios Consolidados</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Gere documentos analíticos baseados nos dados sanitários regionais unificados.</p>
              </div>
            </>
          )}

          {perfilUsuario === 'ADMINISTRADOR' && (
             <>
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/admin/clinicas')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#064e3b' : '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🏥</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Gerenciar Clínicas</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Cadastre e edite as clínicas e unidades de saúde que utilizam o sistema.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/admin/gestores')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#1e3a8a' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>👔</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Gestores de Clínica</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Vincule contas de gerência às unidades e clínicas cadastradas.</p>
              </div>
              
              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/admin/governo')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#3b2210' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🏛️</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Acessos do Governo</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Gerencie os perfis operacionais da Vigilância Sanitária e Órgãos Públicos.</p>
              </div>

              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/admin/vacinas')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#4c1d95' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>💉</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Catálogo Global de Vacinas</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Controle a tabela base de vacinas e fabricantes para todo o ecossistema.</p>
              </div>

              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/admin/especies')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#1e293b' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🐾</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Catálogo de Espécies</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Gerencie o cadastro mestre de espécies e raças de animais disponíveis.</p>
              </div>

              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/admin/avisos')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#083344' : '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>📢</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Avisos Globais</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Crie e gerencie os comunicados informativos para os usuários da plataforma.</p>
              </div>

              <div className="premium-card" style={{ backgroundColor: bgCard, border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '32px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onClick={() => router.push('/admin/auditoria')}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: isEscuro ? '#450a0a' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '20px', filter: sombraEmoji }}>🔍</div>
                <h3 style={{ color: headerColor, margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700' }}>Logs de Auditoria</h3>
                <p style={{ color: textSecundario, margin: 0, fontSize: '14px', lineHeight: '1.6' }}>Acesse o histórico de registro de ações e eventos realizados no sistema.</p>
              </div>
             </>
          )}

        </div>
      </div>
    </LayoutPainel>
  );
}