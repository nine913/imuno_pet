"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    
    if (!usuarioString) {
      router.push('/');
    } else {
      setUsuario(JSON.parse(usuarioString));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('usuarioImunoPet');
    router.push('/');
  };

  if (!usuario) {
    return <h1 style={{ padding: '20px', fontFamily: 'Arial' }}>Carregando...</h1>;
  }

  const perfilUsuario = usuario.perfil.toUpperCase();

  return (
    <>
      <style>{`
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; margin: 0; padding: 20px; }
        .navbar { background-color: #0056b3; color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px; }
        .navbar button { background-color: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .navbar button:hover { background-color: #c82333; }
        .content { margin-top: 20px; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .btn-vet { background-color: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; margin-top: 10px; font-weight: bold; }
        .btn-vet:hover { background-color: #218838; }
        .btn-tutor { background-color: #17a2b8; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; margin-top: 10px; font-weight: bold; }
        .btn-tutor:hover { background-color: #138496; }
        .btn-gestor { background-color: #6610f2; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; margin-top: 10px; font-weight: bold; }
        .btn-gestor:hover { background-color: #520dc2; }
        .btn-governo { background-color: #fd7e14; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px; margin-top: 10px; font-weight: bold; }
        .btn-governo:hover { background-color: #eaa75a; }
      `}</style>

      <div className="navbar">
        <h2 style={{ margin: 0 }}>ImunoPet Brasil</h2>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <div className="content">
        <h1>Bem-vindo, {usuario.nome}! Você está logado como: {usuario.perfil}</h1>
        
        {perfilUsuario === 'TUTOR' && (
          <div>
            <h2>Painel do Tutor</h2>
            <p>Acesse as informações dos seus animais e carteiras de vacinação:</p>
            <button className="btn-tutor" onClick={() => router.push('/tutor/animais')}>Meus Pets e Vacinas</button>
          </div>
        )}

        {perfilUsuario === 'VETERINARIO' && (
          <div>
            <h2>Painel do Veterinário</h2>
            <p>Selecione uma ação abaixo:</p>
            <button className="btn-vet" onClick={() => router.push('/veterinario/buscar')}>Gerenciar Animais</button>
            <button className="btn-vet" onClick={() => router.push('/veterinario/tutores')}>Gerenciar Tutores</button>
            <button className="btn-vet" onClick={() => router.push('/veterinario/vacinas')}>Gerenciar Vacinas</button>
            <button className="btn-vet" onClick={() => router.push('/veterinario/relatorio')} style={{ backgroundColor: '#17a2b8' }}>Relatório de Vacinação</button>
            <button className="btn-vet" onClick={() => router.push('/veterinario/atrasados')} style={{ backgroundColor: '#dc3545' }}>Vacinas Atrasadas</button>
          </div>
        )}

        {(perfilUsuario === 'GESTOR' || perfilUsuario === 'GESTOR_CLINICA') && (
          <div>
            <h2>Painel do Gestor</h2>
            <p>Visão estratégica e administrativa da clínica:</p>
            <button className="btn-gestor" onClick={() => router.push('/gestor/dashboard')}>Visão Geral (Métricas)</button>
            <button className="btn-gestor" onClick={() => router.push('/gestor/relatorios')}>Relatórios Avançados</button>
            <button className="btn-gestor" onClick={() => router.push('/gestor/equipe')}>Gerenciar Equipe</button>
          </div>
        )}

        {perfilUsuario === 'GOVERNO' && (
          <div>
            <h2>Painel Governamental (Vigilância Sanitária)</h2>
            <p>Monitoramento epidemiológico e controle de endemias por região:</p>
            <button className="btn-governo" onClick={() => router.push('/governo/dashboard')}>Monitoramento Epidemiológico</button>
            <button className="btn-governo" onClick={() => router.push('/governo/relatorios')} style={{ backgroundColor: '#274aaa' }}>Relatórios Avançados</button>
          </div>
        )}
      </div>
    </>
  );
}