"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LayoutPainel from '../../components/LayoutPainel';

function FormularioVacina() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idAnimal = searchParams.get('id');
  const dataHoje = new Date().toISOString().split('T')[0];
  
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const [tema, setTema] = useState('claro');
  const [altoContraste, setAltoContraste] = useState(false);

  const [animal, setAnimal] = useState(null);
  const [vacinas, setVacinas] = useState([]);
  
  const [formDados, setFormDados] = useState({
    id_vacina: '',
    status: 'APLICADA',
    data_aplicacao: dataHoje,
    data_proxima_dose: ''
  });
  
  const [msg, setMsg] = useState({ texto: '', cor: '' });

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('usuarioImunoPet');
    if (saved) {
      const user = JSON.parse(saved);
      setUsuario(user);

      const configSalvas = localStorage.getItem(`imunoPetConfig_${user.id_usuario}`);
      if (configSalvas) {
        const config = JSON.parse(configSalvas);
        setTema(config.tema || 'claro');
        setAltoContraste(config.altoContraste || false);
      }
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (usuario && idAnimal) {
      carregarDados();
    }
  }, [usuario, idAnimal]);

  const carregarDados = async () => {
    try {
      const resAnimal = await fetch(`http://localhost:3000/detalhes-animal/${idAnimal}`);
      if (resAnimal.ok) setAnimal(await resAnimal.json());

      const resVacinas = await fetch('http://localhost:3000/vacinas');
      if (resVacinas.ok) setVacinas(await resVacinas.json());
    } catch (e) {}
  };

  const recalcularProximaDose = (idVacina, dataBase) => {
    if (!idVacina || !dataBase) return '';
    const vacinaObj = vacinas.find(v => String(v.id_vacina) === String(idVacina));
    if (vacinaObj && vacinaObj.intervalo_doses_dias) {
      const dataApp = new Date(dataBase);
      dataApp.setDate(dataApp.getDate() + vacinaObj.intervalo_doses_dias);
      return dataApp.toISOString().split('T')[0];
    }
    return '';
  };

  const handleStatusChange = (e) => {
    const novoStatus = e.target.value;
    setFormDados({
      ...formDados,
      status: novoStatus,
      data_aplicacao: novoStatus === 'APLICADA' ? dataHoje : '',
      data_proxima_dose: ''
    });
  };

  const handleVacinaChange = (e) => {
    const idVacinaSelecionada = e.target.value;
    let proximaDose = formDados.data_proxima_dose;
    
    if (formDados.status === 'APLICADA') {
      proximaDose = recalcularProximaDose(idVacinaSelecionada, formDados.data_aplicacao);
    }

    setFormDados({
      ...formDados,
      id_vacina: idVacinaSelecionada,
      data_proxima_dose: proximaDose
    });
  };

  const handleDataAplicacaoChange = (e) => {
    const novaData = e.target.value;
    let proximaDose = formDados.data_proxima_dose;
    
    if (formDados.status === 'APLICADA') {
      proximaDose = recalcularProximaDose(formDados.id_vacina, novaData);
    }

    setFormDados({
      ...formDados,
      data_aplicacao: novaData,
      data_proxima_dose: proximaDose
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formDados.status === 'PENDENTE' && formDados.data_proxima_dose < dataHoje) {
      setMsg({ texto: 'A data do agendamento (pendente) não pode estar no passado.', cor: 'red' });
      return;
    }

    if (formDados.status === 'APLICADA' && formDados.data_aplicacao > dataHoje) {
      setMsg({ texto: 'A data de aplicação não pode estar no futuro.', cor: 'red' });
      return;
    }

    if (formDados.status === 'APLICADA' && formDados.data_proxima_dose && formDados.data_proxima_dose < formDados.data_aplicacao) {
      setMsg({ texto: 'A data de vencimento não pode ser menor que a data de aplicação.', cor: 'red' });
      return;
    }

    try {
      const payload = {
        id_animal: idAnimal,
        id_vacina: formDados.id_vacina,
        id_clinica: usuario.id_clinica || null,
        id_usuario: usuario.id_usuario,
        data_aplicacao: formDados.status === 'APLICADA' ? formDados.data_aplicacao : null,
        data_proxima_dose: formDados.data_proxima_dose,
        status: formDados.status,
        id_usuario_log: usuario.id_usuario 
      };

      const res = await fetch('http://localhost:3000/registrar-vacina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const dados = await res.json();
      
      if (res.ok) {
        setMsg({ texto: 'Registro salvo com sucesso!', cor: 'green' });
        setTimeout(() => router.push(`/veterinario/historico?id=${idAnimal}`), 2000);
      } else {
        setMsg({ texto: dados.erro || 'Erro ao registrar.', cor: 'red' });
      }
    } catch (err) {
      setMsg({ texto: 'Erro de conexão.', cor: 'red' });
    }
  };

  if (!isMounted || !usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e1e1e' : '#ffffff';
  const textColor = isEscuro ? '#fdfdfd' : '#000000';
  const textSecundario = isEscuro ? '#cccccc' : '#333333';
  const borderColor = isEscuro ? '#444444' : '#e3e3e3';
  const inputBg = isEscuro ? '#2d2d2d' : '#ffffff';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#66b2ff' : '#0056b3');
  
  const infoCardBg = isEscuro ? '#2d2d2d' : '#e9ecef';
  const infoCardBorder = isEscuro ? '#66b2ff' : '#0056b3';
  const aplicanteBoxBg = isEscuro ? '#003366' : '#cce5ff';
  const aplicanteBoxBorder = isEscuro ? '#004085' : '#b8daff';
  const aplicanteBoxText = isEscuro ? '#99ccff' : '#004085';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', color: textColor }}>
        <button style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold', fontSize: 'inherit' }} onClick={() => router.back()}>Voltar</button>
        
        <div style={{ background: bgCard, padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: altoContraste ? '3px solid #ffcc00' : `1px solid ${borderColor}` }}>
          <h2 style={{ color: headerColor, marginTop: 0, marginBottom: '20px' }}>Registrar Vacinação ou Agendamento</h2>

          {animal && (
            <div style={{ backgroundColor: infoCardBg, padding: '15px', borderRadius: '4px', marginBottom: '20px', borderLeft: `4px solid ${infoCardBorder}` }}>
              <p style={{ margin: '5px 0', color: textSecundario }}><strong>Paciente:</strong> {animal.nome_animal}</p>
              <p style={{ margin: '5px 0', color: textSecundario }}><strong>Espécie:</strong> {animal.especie} | <strong>Raça:</strong> {animal.raca || 'Não informada'}</p>
              <p style={{ margin: '5px 0', color: textSecundario }}><strong>Tutor Responsável:</strong> {animal.nome_tutor}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            
            <label style={{ fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Situação do Registro:</label>
            <select value={formDados.status} onChange={handleStatusChange} required style={{ width: '100%', padding: '10px', margin: '8px 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
              <option value="APLICADA">✅ Vacina Aplicada (Registrar agora)</option>
              <option value="PENDENTE">📅 Pendente (Agendar próxima dose)</option>
            </select>

            {formDados.status === 'APLICADA' && (
              <div style={{ backgroundColor: aplicanteBoxBg, padding: '10px', borderRadius: '4px', marginBottom: '15px', border: `1px solid ${aplicanteBoxBorder}` }}>
                <span style={{ color: aplicanteBoxText }}>
                  <strong>Aplicante logado:</strong> {usuario.email} 
                  <br/>
                  <small style={{ fontSize: '0.85em' }}>O sistema vinculará o seu perfil como o profissional responsável</small>
                </span>
              </div>
            )}

            <label style={{ fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Selecione a Vacina:</label>
            <select value={formDados.id_vacina} onChange={handleVacinaChange} required style={{ width: '100%', padding: '10px', margin: '8px 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }}>
              <option value="">Escolha no catálogo...</option>
              {vacinas.map(v => (
                <option key={v.id_vacina} value={v.id_vacina}>
                  {v.nome_vacina} {v.fabricante ? `(${v.fabricante})` : ''}
                </option>
              ))}
            </select>

            {formDados.status === 'APLICADA' && (
              <>
                <label style={{ fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>Data da Aplicação:</label>
                <input 
                  type="date" 
                  value={formDados.data_aplicacao} 
                  onChange={handleDataAplicacaoChange} 
                  required 
                  max={dataHoje}
                  style={{ width: '100%', padding: '10px', margin: '8px 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
                />
              </>
            )}

            <label style={{ fontWeight: 'bold', color: textSecundario, marginBottom: '5px' }}>
              {formDados.status === 'APLICADA' ? 'Data da Próxima Dose (Revacinação):' : 'Data Agendada (Próxima Dose):'}
            </label>
            <input 
              type="date" 
              value={formDados.data_proxima_dose} 
              onChange={e => setFormDados({...formDados, data_proxima_dose: e.target.value})} 
              required 
              min={formDados.status === 'PENDENTE' ? dataHoje : (formDados.data_aplicacao || '')}
              style={{ width: '100%', padding: '10px', margin: '8px 0 15px 0', border: `1px solid ${borderColor}`, borderRadius: '4px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: 'inherit' }} 
            />

            <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: 'inherit' }}>Salvar Registro</button>
          </form>

          {msg.texto && <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: msg.cor }}>{msg.texto}</div>}
        </div>
      </div>
    </LayoutPainel>
  );
}

export default function VacinarAnimal() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Carregando formulário...</div>}>
      <FormularioVacina />
    </Suspense>
  );
}