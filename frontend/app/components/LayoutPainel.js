"use client";

import { apiFetch } from '../lib/api';
import { obterConfiguracoes } from '../lib/configuracoes';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function LayoutPainel({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [usuario, setUsuario] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usuarioImunoPet');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [configuracoes, setConfiguracoes] = useState(() => obterConfiguracoes(usuario?.id_usuario));

  const [menuExpandido, setMenuExpandido] = useState(() => {
    if (typeof window !== 'undefined') {
      const menuSalvo = localStorage.getItem('imunoPetMenuState');
      return menuSalvo !== null ? JSON.parse(menuSalvo) : true;
    }
    return true;
  });

  const [permitirAnimacao, setPermitirAnimacao] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinaliza que já passamos da hidratação (evita mismatch de SSR); é o próprio propósito deste effect
    setIsMounted(true);
    if (!usuario) {
      router.push('/');
    }

    const timer = setTimeout(() => setPermitirAnimacao(true), 50);

    document.body.style.backgroundColor = configuracoes.tema === 'escuro' ? '#121212' : '#f4f4f9';
    document.body.style.margin = '0';

    return () => clearTimeout(timer);
  }, [usuario, router, configuracoes.tema]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const sincronizar = () => setIsMobile(mediaQuery.matches);
    sincronizar();
    mediaQuery.addEventListener('change', sincronizar);
    return () => mediaQuery.removeEventListener('change', sincronizar);
  }, []);

  const alternarMenu = () => {
    if (isMobile) {
      setMenuMobileAberto(false);
      return;
    }
    const novoStatus = !menuExpandido;
    setMenuExpandido(novoStatus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('imunoPetMenuState', JSON.stringify(novoStatus));
    }
  };

  const irParaRota = (rota) => {
    router.push(rota);
    setMenuMobileAberto(false);
  };

  const handleLogout = async () => {
    if (usuario) {
      try {
        await apiFetch('/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: usuario.id_usuario })
        });
      } catch (error) {}
    }
    localStorage.removeItem('usuarioImunoPet');
    router.push('/');
  };

  if (!isMounted || !usuario) return null;

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
      { nome: 'Estatísticas', rota: '/admin/dashboard', icone: '📊' },
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
  const mainBgColor = isTemaEscuro ? '#121212' : '#f4f4f9';
  const mainTextColor = isTemaEscuro ? '#fdfdfd' : '#333333';
  const sidebarWidth = menuExpandido ? '260px' : '70px';
  const exibirRotulos = isMobile ? true : menuExpandido;

  const animacoesAtivas = permitirAnimacao && !configuracoes.reduzirAnimacoes;
  const transicaoSidebar = animacoesAtivas ? 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';

  return (
    <div suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', backgroundColor: mainBgColor, color: mainTextColor, fontFamily: '"Inter", Arial, sans-serif', fontSize: configuracoes.fonte }}>

      {/* Regras de acessibilidade aplicadas globalmente (toda página passa por este layout). */}
      <style>{`
        @keyframes subtleFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .page-content-animated {
          animation: subtleFade 0.2s ease-out forwards;
        }
        .link-hover:hover {
          background-color: rgba(255,255,255,0.05) !important;
          color: white !important;
        }
        .ip-mobile-topbar { display: none; }
        .ip-sidebar-backdrop { display: none; }
        @media (max-width: 768px) {
          .ip-sidebar {
            width: 260px !important;
            transform: translateX(${menuMobileAberto ? '0' : '-100%'});
            box-shadow: ${menuMobileAberto ? '4px 0 24px rgba(0,0,0,0.35)' : 'none'} !important;
          }
          .ip-main {
            margin-left: 0 !important;
            width: 100% !important;
            padding-top: 64px;
          }
          .ip-mobile-topbar { display: flex !important; }
          .ip-sidebar-backdrop {
            display: ${menuMobileAberto ? 'block' : 'none'};
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            z-index: 999;
          }
        }
        ${configuracoes.reduzirAnimacoes ? `
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
        .premium-card:hover {
          transform: none !important;
        }
        ` : ''}
        ${configuracoes.espacamentoAmpliado ? `
        body, main, main * {
          line-height: 1.8 !important;
          letter-spacing: 0.02em !important;
          word-spacing: 0.05em !important;
        }
        ` : ''}
        ${configuracoes.destacarFoco ? `
        *:focus, *:focus-visible {
          outline: 3px solid #2563eb !important;
          outline-offset: 3px !important;
        }
        ` : ''}
        ${configuracoes.altoContraste ? `
        body {
          filter: contrast(1.15) saturate(1.1);
        }
        ` : ''}
      `}</style>

      <div
        className="ip-sidebar-backdrop"
        onClick={() => setMenuMobileAberto(false)}
        aria-hidden="true"
      />

      <div
        className="ip-mobile-topbar"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '56px', backgroundColor: '#001f3f', color: 'white', alignItems: 'center', padding: '0 16px', gap: '12px', zIndex: 998, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}
      >
        <button
          onClick={() => setMenuMobileAberto(true)}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuMobileAberto}
          style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '4px', display: 'flex' }}
        >
          ☰
        </button>
        <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'bold' }}>ImunoPet</h2>
      </div>

      <nav className="ip-sidebar" style={{ width: sidebarWidth, backgroundColor: '#001f3f', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', zIndex: 1000, transition: transicaoSidebar }}>

        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: exibirRotulos ? 'space-between' : 'center', height: '70px', boxSizing: 'border-box' }}>
          {exibirRotulos && <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden' }}>ImunoPet</h2>}
          <button
            onClick={alternarMenu}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isMobile ? 'Fechar menu' : (menuExpandido ? 'Recolher menu' : 'Expandir menu')}
          >
            {isMobile ? '✕' : '☰'}
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', overflowX: 'hidden' }}>
          {linksMenu.map((link, index) => {
            const isAtivo = pathname === link.rota || pathname.startsWith(link.rota + '/');
            return (
              <div
                key={index}
                className={!isAtivo ? 'link-hover' : ''}
                onClick={() => irParaRota(link.rota)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    irParaRota(link.rota);
                  }
                }}
                aria-current={isAtivo ? 'page' : undefined}
                style={{ display: 'flex', alignItems: 'center', justifyContent: exibirRotulos ? 'flex-start' : 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: isAtivo ? '#0056b3' : 'transparent', color: isAtivo ? 'white' : '#cbd5e1' }}
                title={!exibirRotulos ? link.nome : ''}
              >
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', marginRight: exibirRotulos ? '12px' : '0', filter: isTemaEscuro ? 'drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.4))' : 'none' }}>{link.icone}</span>
                {exibirRotulos && <span style={{ fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap' }}>{link.nome}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
          {exibirRotulos ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', width: '100%' }}>
                <div style={{ width: '36px', height: '36px', backgroundColor: '#17a2b8', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', marginRight: '10px', textTransform: 'uppercase', flexShrink: 0 }}>
                  {nomeExibicao.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{nomeExibicao}</span>
                  <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 6px', backgroundColor: '#28a745', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{perfil.replace('_', ' ')}</span>
                </div>
              </div>
              <button style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background-color 0.2s', whiteSpace: 'nowrap' }} onClick={handleLogout}>
                🚪 Sair
              </button>
            </>
          ) : (
            <button title="Sair do sistema" style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'center' }} onClick={handleLogout}>
              🚪
            </button>
          )}
        </div>
      </nav>

      <main className="ip-main page-content-animated" style={{ marginLeft: sidebarWidth, flex: 1, minHeight: '100vh', width: `calc(100% - ${sidebarWidth})`, transition: transicaoSidebar }}>
        {children}
      </main>
    </div>
  );
}