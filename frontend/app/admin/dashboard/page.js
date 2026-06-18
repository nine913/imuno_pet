"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [estatisticas, setEstatisticas] = useState({
    total_clinicas: 0,
    total_usuarios: 0,
    total_vacinas: 0
  });

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      setUsuario(JSON.parse(saved));
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (usuario) {
      if (usuario.perfil.toUpperCase() !== 'ADMINISTRADOR') {
        router.push('/dashboard');
      } else {
        carregarEstatisticas(usuario.id_usuario);
      }
    }
  }, [usuario, router]);

  const carregarEstatisticas = async (userId) => {
    try {
      const resposta = await fetch(`http://localhost:3000/admin/estatisticas?id_usuario_log=${userId}`);
      if (resposta.ok) {
        const dados = await resposta.json();
        setEstatisticas(dados);
      }
    } catch (erro) {}
  };

  const handleLogout = async () => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    
    if (usuarioString) {
      const user = JSON.parse(usuarioString);
      try {
        await fetch('http://localhost:3000/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_usuario: user.id_usuario })
        });
      } catch (error) {}
    }

    localStorage.removeItem('usuarioImunoPet');
    router.push('/');
  };

  if (!isMounted || !usuario) return null;

  const nomeExibicao = usuario.nome_completo || usuario.nome || "Administrador";

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        
        <div style={styles.header}>
          <div>
            <h2 style={styles.h2}>Olá, {nomeExibicao}! 👋</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              Você está acessando o: <strong>Painel do Administrador (Super Admin)</strong>
            </p>
          </div>
          <button style={styles.btnSair} onClick={handleLogout}>
            Sair do Sistema
          </button>
        </div>

        <p style={{ marginBottom: '30px', color: '#333', fontSize: '16px' }}>
          Visão geral e gerenciamento estrutural da plataforma ImunoPet. Selecione um módulo:
        </p>

       <div style={styles.grid}>
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