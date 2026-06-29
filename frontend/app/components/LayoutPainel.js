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

  if (!usuario) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando sistema...</div>;

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
      { nome: 'Relatórios', rota: '/veterinario/relatorio', icone: '📊' },
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
      { nome: 'Epidemiologia', rota: '/governo/relatorios', icone: '🦠' }
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
  const mainBgColor = isTemaEscuro ? '#121212' : '#f4f4f9';
  const mainTextColor = isTemaEscuro ? '#fdfdfd' : '#333333';
  const sidebarWidth = menuExpandido ? '260px' : '70px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: mainBgColor, color: mainTextColor, fontFamily: 'Arial, sans-serif', fontSize: configuracoes.fonte }}>
      
      <nav style={{ width: sidebarWidth, backgroundColor: '#001f3f', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', zIndex: 1000, transition: 'width 0.3s ease' }}>
        
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: menuExpandido ? 'space-between' : 'center' }}>
          {menuExpandido && <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#ffffff', whiteSpace: 'nowrap' }}>ImunoPet</h2>}
          <button 
            onClick={() => setMenuExpandido(!menuExpandido)} 
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: 0 }}
          >
            ☰
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', overflowX: 'hidden' }}>
          {linksMenu.map((link, index) => {
            const isAtivo = pathname === link.rota || pathname.startsWith(link.rota + '/');
            return (
              <div 
                key={index} 
                onClick={() => router.push(link.rota)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: menuExpandido ? 'flex-start' : 'center', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: isAtivo ? '#0056b3' : 'transparent', color: isAtivo ? 'white' : '#cbd5e1' }}
                title={!menuExpandido ? link.nome : ''}
              >
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center', marginRight: menuExpandido ? '12px' : '0' }}>{link.icone}</span>
                {menuExpandido && <span style={{ fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap' }}>{link.nome}</span>}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
          {menuExpandido ? (
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
            <button title="Sair" style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'center' }} onClick={handleLogout}>
              🚪
            </button>
          )}
        </div>
      </nav>

      <main style={{ marginLeft: sidebarWidth, flex: 1, minHeight: '100vh', width: `calc(100% - ${sidebarWidth})`, transition: 'all 0.3s ease' }}>
        {children}
      </main>
    </div>
  );
}