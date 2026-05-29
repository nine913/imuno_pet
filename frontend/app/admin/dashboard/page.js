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
        carregarEstatisticas();
      }
    }
  }, [usuario, router]);

  const carregarEstatisticas = async () => {
    try {
      const resposta = await fetch('http://localhost:3000/admin/estatisticas');
      if (resposta.ok) {
        const dados = await resposta.json();
        setEstatisticas(dados);
      }
    } catch (erro) {
      console.error(erro);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioImunoPet');
    router.push('/');
  };

  if (!isMounted || !usuario) return null;

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <button style={styles.btnVoltar} onClick={handleLogout}>
          Sair
        </button>
        
        <h2 style={styles.h2}>Painel do Administrador (Super Admin)</h2>
        <p style={{ marginBottom: '30px', color: '#333' }}>
          Visão geral e gerenciamento estrutural da plataforma ImunoPet.
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
  container: { maxWidth: '900px', width: '100%', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginTop: '40px' },
  h2: { color: '#000000', marginTop: 0, fontSize: '28px' },
  btnVoltar: { backgroundColor: '#dc3545', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', fontWeight: 'bold' },
  kpiGrid: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  kpiCard: { flex: 1, minWidth: '150px', padding: '20px', borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  kpiTitle: { margin: 0, fontSize: '14px', textTransform: 'uppercase', color: 'white' },
  kpiValue: { margin: '10px 0 0 0', fontSize: '36px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fdfdfd', border: '1px solid #e3e3e3', borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s, boxShadow 0.2s' },
  cardTitle: { color: '#0056b3', margin: '0 0 10px 0', fontSize: '18px' },
  cardText: { color: '#333', margin: 0, fontSize: '14px', lineHeight: '1.5' }
};