"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

export default function VetVacinas() {
  const [usuario, setUsuario] = useState(null);
  const [vacinas, setVacinas] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');

  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editDados, setEditDados] = useState({
    id_vacina: '', nome_vacina: '', doencas_prevenidas: '', fabricante: '', tipo_dose: '', intervalo_doses_dias: ''
  });
  const [mensagemEditar, setMensagemEditar] = useState({ texto: '', cor: '' });

  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [vacinaParaExcluir, setVacinaParaExcluir] = useState(null);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }
    const user = JSON.parse(usuarioString);
    if (user.perfil !== 'VETERINARIO' && user.perfil !== 'GESTOR_CLINICA' && user.perfil !== 'ADMINISTRADOR') {
      router.push('/dashboard');
      return;
    }
    setUsuario(user);

    const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
    if (configSalvas) {
      const config = JSON.parse(configSalvas);
      setTema(config.tema || 'claro');
      setAltoContraste(config.altoContraste || false);
    }

    realizarBusca('');
  }, [router]);

  const realizarBusca = async (termo = termoBusca) => {
    try {
      const url = `http://localhost:3000/vacinas?termo=${encodeURIComponent(termo)}`;
      const resposta = await fetch(url);
      if (resposta.ok) {
        setVacinas(await resposta.json());
      } else {
        setVacinas([]);
      }
    } catch (erro) {}
  };

  const abrirModalEditar = (vacina) => {
    const valorIntervalo = vacina.intervalo_doses_dias || vacina.intervalo_doses_dias || 0;
    setEditDados({
      id_vacina: vacina.id_vacina,
      nome_vacina: vacina.nome_vacina,
      doencas_prevenidas: vacina.doencas_prevenidas,
      fabricante: vacina.fabricante || '',
      tipo_dose: valorIntervalo > 0 ? 'intervalo' : 'unica',
      intervalo_doses_dias: valorIntervalo > 0 ? valorIntervalo : ''
    });
    setMensagemEditar({ texto: '', cor: '' });
    setModalEditarOpen(true);
  };

  const handleTipoDoseChange = (e) => {
    const value = e.target.value;
    setEditDados({
      ...editDados,
      tipo_dose: value,
      intervalo_doses_dias: value === 'intervalo' ? editDados.intervalo_doses_dias : ''
    });
  };

  const handleIntervaloChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setEditDados({ ...editDados, intervalo_doses_dias: v });
  };

  const submitEditar = async (e) => {
    e.preventDefault();
    const payload = {
      nome_vacina: editDados.nome_vacina,
      doencas_prevenidas: editDados.doencas_prevenidas,
      fabricante: editDados.fabricante,
      intervalo_doses_dias: editDados.tipo_dose === 'intervalo' ? editDados.intervalo_doses_dias : 0,
      id_usuario_log: usuario.id_usuario
    };

    try {
      const resposta = await fetch(`http://localhost:3000/editar-vacina/${editDados.id_vacina}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resposta.json();
      if (resposta.ok) {
        setMensagemEditar({ texto: dados.mensagem || 'Salvo com sucesso!', cor: 'green' });
        setTimeout(() => {
          setModalEditarOpen(false);
          realizarBusca();
        }, 1500);
      } else {
        setMensagemEditar({ texto: dados.erro, cor: 'red' });
      }
    } catch (erro) {
      setMensagemEditar({ texto: 'Erro ao salvar alterações.', cor: 'red' });
    }
  };

  const confirmarExclusao = async () => {
    if (!vacinaParaExcluir) return;
    try {
      const resposta = await fetch(`http://localhost:3000/deletar-vacina/${vacinaParaExcluir}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario_log: usuario.id_usuario })
      });
      if (resposta.ok) {
        setModalExclusaoOpen(false);
        realizarBusca();
      }
    } catch (erro) {}
  };

  if (!usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: textColor }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: '0', color: headerColor }}>Consultar Vacinas</h2>
          <button style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => router.push('/veterinario/cadastrar-vacina')}>
            + Cadastrar Nova Vacina
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="text" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && realizarBusca()} placeholder="Pesquisar por nome, doenças ou fabricante..." style={{ width: '100%', padding: '10px', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, margin: 0, flex: 1, fontSize: 'inherit' }} />
          <button style={{ padding: '10px 15px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', margin: 0, width: 'auto', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => realizarBusca()}>Pesquisar</button>
        </div>

        <div>
          {vacinas.length === 0 ? <p style={{ color: textSecundario }}>Nenhuma vacina encontrada.</p> : vacinas.map(v => {
            const valorIntervalo = v.intervalo_doses_dias || v.intervalo_doses_dias || 0;
            const textoIntervalo = valorIntervalo > 0 ? `${valorIntervalo} dias` : 'Dose Única';
            
            return (
              <div key={v.id_vacina} style={{ border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '8px', marginTop: '15px', backgroundColor: bgCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', color: headerColor }}>💉 {v.nome_vacina}</h3>
                  <p style={{ margin: '5px 0', color: textSecundario }}><strong>Previne:</strong> {v.doencas_prevenidas}</p>
                  <p style={{ margin: '5px 0', color: textSecundario }}><strong>Fabricante:</strong> {v.fabricante} | <strong>Intervalo:</strong> {textoIntervalo}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', minWidth: '150px' }}>
                  <button style={{ padding: '10px 15px', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', backgroundColor: '#ffc107', fontSize: 'inherit' }} onClick={() => abrirModalEditar(v)}>✏️ Editar</button>
                  <button style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', backgroundColor: '#dc3545', fontSize: 'inherit' }} onClick={() => { setVacinaParaExcluir(v.id_vacina); setModalExclusaoOpen(true); }}>🗑️ Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalEditarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Editar Vacina</h3>
            <form onSubmit={submitEditar}>
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Nome da Vacina:</label>
              <input type="text" value={editDados.nome_vacina} onChange={e => setEditDados({...editDados, nome_vacina: e.target.value})} required style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Doenças Prevenidas:</label>
              <textarea value={editDados.doencas_prevenidas} onChange={e => setEditDados({...editDados, doencas_prevenidas: e.target.value})} rows="3" required style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit', resize: 'vertical' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Fabricante:</label>
              <input type="text" value={editDados.fabricante} onChange={e => setEditDados({...editDados, fabricante: e.target.value})} style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Tipo de Dose:</label>
              <select value={editDados.tipo_dose} onChange={handleTipoDoseChange} required style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
                <option value="unica">Dose Única</option>
                <option value="intervalo">Múltiplas Doses (Com Intervalo)</option>
              </select>

              {editDados.tipo_dose === 'intervalo' && (
                <>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: textSecundario, textAlign: 'left' }}>Intervalo entre doses (em dias):</label>
                  <input type="number" value={editDados.intervalo_doses_dias} onChange={handleIntervaloChange} min="0" required style={{ padding: '10px', margin: '0 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', width: '100%', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} />
                </>
              )}
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold', backgroundColor: '#28a745', flex: 1, margin: 0, fontSize: 'inherit' }}>Salvar Alterações</button>
                <button type="button" onClick={() => setModalEditarOpen(false)} style={{ padding: '10px 15px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#6c757d', flex: 1, margin: 0, width: 'auto', fontSize: 'inherit' }}>Cancelar</button>
              </div>
            </form>
            {mensagemEditar.texto && <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: mensagemEditar.cor }}>{mensagemEditar.texto}</div>}
          </div>
        </div>
      )}

      {modalExclusaoOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: bgCard, padding: '20px', borderRadius: '8px', width: '300px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', border: altoContraste ? '2px solid #dc3545' : `1px solid ${borderColor}`, color: textColor }}>
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>Atenção!</h3>
            <p style={{ color: textSecundario }}>Deseja excluir esta vacina? Isso apagará este registro de todos os animais vacinados com ela.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button style={{ backgroundColor: '#dc3545', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={confirmarExclusao}>Sim, Excluir</button>
              <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => setModalExclusaoOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </LayoutPainel>
  );
}