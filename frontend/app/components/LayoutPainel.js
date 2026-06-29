"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function LayoutPainel({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);
  const [configuracoes, setConfiguracoes] = useState({ tema: 'claro', fonte: '16px', altoContraste: false });
  const [menuExpandido, setMenuExpandido] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      const user = JSON.parse(saved);
      setUsuario(user);

      const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
      if (configSalvas) {
        setConfiguracoes(JSON.parse(configSalvas));
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handleLogout = async () => {
    if (usuario) {
      try {
        await fetch('http://localhost:3000/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: usuario.id_usuario })
        });
      } catch (error) {}
    }
    localStorage.removeItem('usuarioImunoPet');
    router.push('/');
  };

  if (!usuario) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: '"Inter", sans-serif', color: '#1e293b' }}>Carregando sistema...</div>;

  const perfil = usuario.perfil.toUpperCase();
  let linksMenu = [];

  if (perfil === 'TUTOR') {
    linksMenu = [
      { nome: 'Menu Inicial', rota: '/dashboard', icone: '🏠' },
      { nome: 'Meus Pets', rota: '/tutor/animais', icone: '🐾' }
    ];
  } else if (perfil === 'VETERINARIO') {
    linksMenu = [
      { nome: 'Menu Inicial', rota: '/dashboard', icone: '🏠' },
      { nome: 'Pacientes', rota: '/veterinario/buscar', icone: '🐾' },
      { nome: 'Tutores', rota: '/veterinario/tutores', icone: '👤' },
      { nome: 'Vacinas', rota: '/veterinario/vacinas', icone: '💉' },
      { nome: 'Relatórios', rota: '/veterinario/relatorio', icone: '📑' },
      { nome: 'Atrasados', rota: '/veterinario/atrasados', icone: '⚠️' },
      { nome: 'Espécies', rota: '/veterinario/especies', icone: '🐈' }
    ];
  } else if (perfil === 'GESTOR' || perfil === 'GESTOR_CLINICA') {
    linksMenu = [
      { nome: 'Menu Inicial', rota: '/dashboard', icone: '🏠' },
      { nome: 'Métricas', rota: '/gestor/dashboard', icone: '📈' },
      { nome: 'Relatórios', rota: '/gestor/relatorios', icone: '📑' },
      { nome: 'Equipe', rota: '/gestor/equipe', icone: '👥' }
    ];
  } else if (perfil === 'GOVERNO') {
    linksMenu = [
      { nome: 'Menu Inicial', rota: '/dashboard', icone: '🏠' },
      { nome: 'Epidemiologia', rota: '/governo/dashboard', icone: '🦠' },
      { nome: 'Relatórios', rota: '/governo/relatorios', icone: '📑' }
    ];
  } else if (perfil === 'ADMINISTRADOR') {
    linksMenu = [
      { nome: 'Menu Inicial', rota: '/dashboard', icone: '🏠' },
      { nome: 'Clínicas', rota: '/admin/clinicas', icone: '🏥' },
      { nome: 'Gestores', rota: '/admin/gestores', icone: '👔' },
      { nome: 'Governo', rota: '/admin/governo', icone: '🏛️' },
      { nome: 'Vacinas', rota: '/admin/vacinas', icone: '💉' },
      { nome: 'Espécies', rota: '/admin/especies', icone: '🐾' },
      { nome: 'Avisos', rota: '/admin/avisos', icone: '📢' },
      { nome: 'Auditoria', rota: '/admin/auditoria', icone: '🔍' }
    ];
  }

  linksMenu.push({ nome: 'Configurações', rota: '/configuracoes', icone: '⚙️' });

  const nomeExibicao = usuario.nome_completo || usuario.nome || 'Usuário';
  const isTemaEscuro = configuracoes.tema === 'escuro';
  const mainBgColor = isTemaEscuro ? '#0f172a' : '#f8fafc';
  const mainTextColor = isTemaEscuro ? '#f8fafc' : '#1e293b';
  const sidebarWidth = menuExpandido ? '280px' : '80px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: mainBgColor, color: mainTextColor, fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontSize: configuracoes.fonte }}>
      
      <nav style={{ width: sidebarWidth, backgroundColor: isTemaEscuro ? '#1e293b' : '#0f172a', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, boxShadow: '4px 0 15px rgba(0,0,0,0.05)', zIndex: 1000, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: menuExpandido ? 'space-between' : 'center', minHeight: '85px', boxSizing: 'border-box' }}>
          {menuExpandido && (
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', background: 'linear-gradient(to right, #60a5fa, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
              ImunoPet
            </h2>
          )}
          <button 
            onClick={() => setMenuExpandido(!menuExpandido)} 
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          >
            ☰
          </button>
        </div>

        <div style={{ flex: 1, padding: '24px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', overflowX: 'hidden' }}>
          {linksMenu.map((link, index) => {
            const isAtivo = pathname === link.rota || pathname.startsWith(link.rota + '/');
            return (
              <div 
                key={index} 
                onClick={() => router.push(link.rota)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: menuExpandido ? 'flex-start' : 'center', 
                  padding: '14px', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease', 
                  backgroundColor: isAtivo ? '#2563eb' : 'transparent', 
                  color: isAtivo ? '#ffffff' : '#94a3b8',
                  boxShadow: isAtivo ? '0 4px 6px -1px rgba(37, 99, 235, 0.3)' : 'none'
                }}
                title={!menuExpandido ? link.nome : ''}
              >
                <span style={{ fontSize: '20px', width: '24px', textAlign: 'center', marginRight: menuExpandido ? '16px' : '0' }}>{link.icone}</span>
                {menuExpandido && <span style={{ fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap' }}>{link.nome}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
          {menuExpandido ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', marginRight: '12px', textTransform: 'uppercase', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {nomeExibicao.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#f8fafc' }}>{nomeExibicao}</span>
                  <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderRadius: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{perfil.replace('_', ' ')}</span>
                </div>
              </div>
              <button style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }} onClick={handleLogout}>
                Sair do Sistema
              </button>
            </>
          ) : (
            <button title="Sair" style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'center', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)' }} onClick={handleLogout}>
              🚪
            </button>
          )}
        </div>
      </nav>

      <main style={{ marginLeft: sidebarWidth, flex: 1, minHeight: '100vh', width: `calc(100% - ${sidebarWidth})`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {children}
      </main>
    </div>
  );
}