"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function LayoutPainel({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);
  const [configuracoes, setConfiguracoes] = useState({ tema: 'claro', fonte: '16px', altoContraste: false });

  useEffect(() => {
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      setUsuario(JSON.parse(saved));
    } else {
      router.push('/');
    }

    const configSalvas = localStorage.getItem('imunoPetConfig');
    if (configSalvas) {
      setConfiguracoes(JSON.parse(configSalvas));
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
      { nome: 'Dashboard', rota: '/dashboard', icone: '🏠' },
      { nome: 'Meus Pets', rota: '/tutor/animais', icone: '🐾' }
    ];
  } else if (perfil === 'VETERINARIO') {
    linksMenu = [
      { nome: 'Dashboard', rota: '/dashboard', icone: '🏠' },
      { nome: 'Pacientes', rota: '/veterinario/buscar', icone: '🐾' },
      { nome: 'Tutores', rota: '/veterinario/tutores', icone: '👤' },
      { nome: 'Vacinas', rota: '/veterinario/vacinas', icone: '💉' },
      { nome: 'Relatórios', rota: '/veterinario/relatorio', icone: '📊' },
      { nome: 'Atrasados', rota: '/veterinario/atrasados', icone: '⚠️' },
      { nome: 'Espécies', rota: '/veterinario/especies', icone: '🐈' }
    ];
  } else if (perfil === 'GESTOR' || perfil === 'GESTOR_CLINICA') {
    linksMenu = [
      { nome: 'Dashboard', rota: '/dashboard', icone: '🏠' },
      { nome: 'Relatórios', rota: '/gestor/relatorios', icone: '📑' },
      { nome: 'Equipe', rota: '/gestor/equipe', icone: '👥' }
    ];
  } else if (perfil === 'GOVERNO') {
    linksMenu = [
      { nome: 'Painel Geral', rota: '/dashboard', icone: '🏠' },
      { nome: 'Epidemiologia', rota: '/governo/relatorios', icone: '🦠' }
    ];
  } else if (perfil === 'ADMINISTRADOR') {
    linksMenu = [
      { nome: 'Dashboard', rota: '/dashboard', icone: '🏠' },
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: mainBgColor, color: mainTextColor, fontFamily: 'Arial, sans-serif', fontSize: configuracoes.fonte }}>
      
      <nav style={styles.sidebar}>
        <div style={styles.logoArea}>
          <h2 style={styles.logoText}>ImunoPet</h2>
          <span style={styles.badgePerfil}>{perfil.replace('_', ' ')}</span>
        </div>

        <div style={styles.menuLinks}>
          {linksMenu.map((link, index) => {
            const isAtivo = pathname === link.rota || pathname.startsWith(link.rota + '/');
            return (
              <div 
                key={index} 
                onClick={() => router.push(link.rota)}
                style={{ ...styles.linkItem, backgroundColor: isAtivo ? '#0056b3' : 'transparent', color: isAtivo ? 'white' : '#cbd5e1' }}
              >
                <span style={styles.linkIcon}>{link.icone}</span>
                <span style={styles.linkText}>{link.nome}</span>
              </div>
            );
          })}
        </div>

        <div style={styles.footerArea}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{nomeExibicao.charAt(0)}</div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{nomeExibicao}</span>
              <span style={styles.userEmail}>{usuario.email || ''}</span>
            </div>
          </div>
          <button style={styles.btnSair} onClick={handleLogout}>
            🚪 Sair do Sistema
          </button>
        </div>
      </nav>

      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', width: 'calc(100% - 260px)' }}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  sidebar: { width: '260px', backgroundColor: '#001f3f', color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', left: 0, top: 0, boxShadow: '2px 0 10px rgba(0,0,0,0.1)', zIndex: 1000 },
  logoArea: { padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
  logoText: { margin: 0, fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px', color: '#ffffff' },
  badgePerfil: { display: 'inline-block', marginTop: '10px', padding: '4px 10px', backgroundColor: '#28a745', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' },
  menuLinks: { flex: 1, padding: '20px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' },
  linkItem: { display: 'flex', alignItems: 'center', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease' },
  linkIcon: { fontSize: '18px', marginRight: '12px', width: '24px', textAlign: 'center' },
  linkText: { fontSize: '15px', fontWeight: '500' },
  footerArea: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' },
  userInfo: { display: 'flex', alignItems: 'center', marginBottom: '15px' },
  avatar: { width: '36px', height: '36px', backgroundColor: '#17a2b8', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '16px', marginRight: '10px', textTransform: 'uppercase' },
  userDetails: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  userName: { fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' },
  userEmail: { fontSize: '12px', color: '#adb5bd', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' },
  btnSair: { width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background-color 0.2s' }
};