"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FormularioVacina() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idAnimal = searchParams.get('id');
  const dataHoje = new Date().toISOString().split('T')[0];
  
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState(null);

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
      setUsuario(JSON.parse(saved));
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

  return (
    <div style={styles.container}>
      <button style={styles.btnVoltar} onClick={() => router.back()}>Voltar</button>
      
      <h2 style={styles.h2}>Registrar Vacinação ou Agendamento</h2>

      {animal && (
        <div style={styles.infoCard}>
          <p style={{ margin: '5px 0', color: '#333' }}><strong>Paciente:</strong> {animal.nome_animal}</p>
          <p style={{ margin: '5px 0', color: '#333' }}><strong>Espécie:</strong> {animal.especie} | <strong>Raça:</strong> {animal.raca || 'Não informada'}</p>
          <p style={{ margin: '5px 0', color: '#333' }}><strong>Tutor Responsável:</strong> {animal.nome_tutor}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.formContainer}>
        
        <label style={styles.label}>Situação do Registro:</label>
        <select value={formDados.status} onChange={handleStatusChange} required style={styles.input}>
          <option value="APLICADA">✅ Vacina Aplicada (Registrar agora)</option>
          <option value="PENDENTE">📅 Pendente (Agendar próxima dose)</option>
        </select>

        {formDados.status === 'APLICADA' && (
          <div style={styles.aplicanteBox}>
            <span style={{ fontSize: '14px', color: '#004085' }}>
              <strong>Aplicante logado:</strong> {usuario.email} 
              <br/>
              <small>(O sistema vinculará o seu perfil como o profissional responsável)</small>
            </span>
          </div>
        )}

        <label style={styles.label}>Selecione a Vacina:</label>
        <select value={formDados.id_vacina} onChange={handleVacinaChange} required style={styles.input}>
          <option value="">Escolha no catálogo...</option>
          {vacinas.map(v => (
            <option key={v.id_vacina} value={v.id_vacina}>
              {v.nome_vacina} {v.fabricante ? `(${v.fabricante})` : ''}
            </option>
          ))}
        </select>

        {formDados.status === 'APLICADA' && (
          <>
            <label style={styles.label}>Data da Aplicação:</label>
            <input 
              type="date" 
              value={formDados.data_aplicacao} 
              onChange={handleDataAplicacaoChange} 
              required 
              max={dataHoje}
              style={styles.input} 
            />
          </>
        )}

        <label style={styles.label}>
          {formDados.status === 'APLICADA' ? 'Data da Próxima Dose (Revacinação):' : 'Data Agendada (Próxima Dose):'}
        </label>
        <input 
          type="date" 
          value={formDados.data_proxima_dose} 
          onChange={e => setFormDados({...formDados, data_proxima_dose: e.target.value})} 
          required 
          min={formDados.status === 'PENDENTE' ? dataHoje : (formDados.data_aplicacao || '')}
          style={styles.input} 
        />

        <button type="submit" style={styles.btnAcao}>Salvar Registro</button>
      </form>

      {msg.texto && <div style={{ textAlign: 'center', marginTop: '15px', fontWeight: 'bold', color: msg.cor }}>{msg.texto}</div>}
    </div>
  );
}

export default function VacinarAnimal() {
  return (
    <div style={styles.body}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>Carregando formulário...</div>}>
        <FormularioVacina />
      </Suspense>
    </div>
  );
}

const styles = {
  body: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f9', margin: 0, padding: '20px', minHeight: '100vh' },
  container: { maxWidth: '600px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  h2: { color: '#000000', marginTop: 0, marginBottom: '20px' },
  infoCard: { backgroundColor: '#e9ecef', padding: '15px', borderRadius: '4px', marginBottom: '20px', borderLeft: '4px solid #0056b3' },
  aplicanteBox: { backgroundColor: '#cce5ff', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #b8daff' },
  formContainer: { display: 'flex', flexDirection: 'column' },
  btnVoltar: { backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', margin: '8px 0 15px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', color: '#333' },
  label: { fontWeight: 'bold', color: '#333', fontSize: '14px' },
  btnAcao: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }
};