"use client";

import { apiFetch } from '../../lib/api';
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

  const carregarDados = async () => {
    try {
      const resAnimal = await apiFetch(`/detalhes-animal/${idAnimal}`);
      if (resAnimal.ok) setAnimal(await resAnimal.json());

      const resVacinas = await apiFetch('/vacinas');
      if (resVacinas.ok) setVacinas(await resVacinas.json());
    } catch (e) {}
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinaliza que já passamos da hidratação (evita mismatch de SSR); é o próprio propósito deste effect
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- busca dados do animal/vacinas assim que a sessão e o id da URL são conhecidos; padrão de data fetching documentado pelo React
      carregarDados();
    }
  }, [usuario, idAnimal]);

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
      setMsg({ texto: 'A data do agendamento (pendente) não pode estar no passado.', cor: '#ef4444' });
      return;
    }

    if (formDados.status === 'APLICADA' && formDados.data_aplicacao > dataHoje) {
      setMsg({ texto: 'A data de aplicação não pode estar no futuro.', cor: '#ef4444' });
      return;
    }

    if (formDados.status === 'APLICADA' && formDados.data_proxima_dose && formDados.data_proxima_dose < formDados.data_aplicacao) {
      setMsg({ texto: 'A data de vencimento não pode ser menor que a data de aplicação.', cor: '#ef4444' });
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

      const res = await apiFetch('/registrar-vacina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const dados = await res.json();
      
      if (res.ok) {
        setMsg({ texto: 'Registro salvo com sucesso!', cor: '#10b981' });
        setTimeout(() => router.push(`/veterinario/historico?id=${idAnimal}`), 2000);
      } else {
        setMsg({ texto: dados.erro || 'Erro ao registrar.', cor: '#ef4444' });
      }
    } catch (err) {
      setMsg({ texto: 'Erro de conexão.', cor: '#ef4444' });
    }
  };

  if (!isMounted || !usuario) return null;

  const isEscuro = tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#0f172a';
  const textSecundario = isEscuro ? '#94a3b8' : '#64748b';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#f8fafc';
  const headerColor = altoContraste ? '#ffcc00' : (isEscuro ? '#60a5fa' : '#2563eb');
  
  const infoCardBg = isEscuro ? '#1e1e1e' : '#f8fafc';
  const aplicanteBoxBg = isEscuro ? '#1e3a8a' : '#eff6ff';
  const aplicanteBoxBorder = isEscuro ? '#1e40af' : '#bfdbfe';
  const aplicanteBoxText = isEscuro ? '#bfdbfe' : '#1e40af';

  const sombraEmoji = isEscuro ? 'drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.4))' : 'none';

  return (
    <LayoutPainel>
      <style>{`
        .premium-input:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
        }
        .premium-btn {
          transition: all 0.2s ease;
        }
        .premium-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto', color: textColor, fontFamily: '"Inter", sans-serif' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '32px' }}>
          <button className="premium-btn" style={{ padding: '10px 16px', color: '#475569', border: `1px solid ${borderColor}`, borderRadius: '10px', cursor: 'pointer', fontSize: '14px', backgroundColor: bgCard, fontWeight: '600' }} onClick={() => router.back()}>
            ← Voltar
          </button>
          <h2 style={{ color: headerColor, margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Registrar Imunização</h2>
        </div>
        
        <div style={{ background: bgCard, padding: '32px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: altoContraste ? '2px solid #ffcc00' : `1px solid ${borderColor}` }}>

          {animal && (
            <div style={{ backgroundColor: infoCardBg, padding: '20px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isEscuro ? '#334155' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', filter: sombraEmoji }}>
                🐾
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', color: textColor, fontSize: '18px', fontWeight: '700' }}>{animal.nome_animal}</p>
                <p style={{ margin: '0 0 4px 0', color: textSecundario, fontSize: '14px' }}><strong>Espécie/Raça:</strong> {animal.especie} - {animal.raca || 'N/I'}</p>
                <p style={{ margin: 0, color: textSecundario, fontSize: '14px' }}><strong>Tutor:</strong> {animal.nome_tutor}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Situação do Registro:</label>
              <select className="premium-input" value={formDados.status} onChange={handleStatusChange} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                <option value="APLICADA">✅ Vacina Aplicada (Registrar agora)</option>
                <option value="PENDENTE">📅 Pendente (Agendar próxima dose)</option>
              </select>
            </div>

            {formDados.status === 'APLICADA' && (
              <div style={{ backgroundColor: aplicanteBoxBg, padding: '16px', borderRadius: '10px', border: `1px solid ${aplicanteBoxBorder}`, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px' }}>👨‍⚕️</span>
                <span style={{ color: aplicanteBoxText, fontSize: '14px', lineHeight: '1.5' }}>
                  <strong>Aplicante logado:</strong> {usuario.email} 
                  <br/>
                  O sistema vinculará o seu perfil profissional a esta aplicação.
                </span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Selecione a Vacina:</label>
              <select className="premium-input" value={formDados.id_vacina} onChange={handleVacinaChange} required style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}>
                <option value="">Escolha no catálogo...</option>
                {vacinas.map(v => (
                  <option key={v.id_vacina} value={v.id_vacina}>
                    {v.nome_vacina} {v.fabricante ? `(${v.fabricante})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {formDados.status === 'APLICADA' && (
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>Data da Aplicação:</label>
                <input 
                  type="date" 
                  className="premium-input"
                  value={formDados.data_aplicacao} 
                  onChange={handleDataAplicacaoChange} 
                  required 
                  max={dataHoje}
                  style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', color: textSecundario, fontSize: '13px' }}>
                {formDados.status === 'APLICADA' ? 'Data da Próxima Dose (Revacinação):' : 'Data Agendada (Próxima Dose):'}
              </label>
              <input 
                type="date" 
                className="premium-input"
                value={formDados.data_proxima_dose} 
                onChange={e => setFormDados({...formDados, data_proxima_dose: e.target.value})} 
                required 
                min={formDados.status === 'PENDENTE' ? dataHoje : (formDados.data_aplicacao || '')}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${borderColor}`, borderRadius: '10px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor, fontSize: '14px', outline: 'none', transition: 'all 0.2s' }} 
              />
            </div>

            <button type="submit" className="premium-btn" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', marginTop: '16px', fontSize: '16px', width: '100%' }}>
              Salvar Registro Médico
            </button>
          </form>

          {msg.texto && (
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: msg.cor === '#10b981' ? (isEscuro ? '#064e3b' : '#d1fae5') : (isEscuro ? '#7f1d1d' : '#fee2e2'), color: msg.cor === '#10b981' ? (isEscuro ? '#34d399' : '#047857') : (isEscuro ? '#fca5a5' : '#b91c1c'), textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
              {msg.texto}
            </div>
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}

export default function VacinarAnimal() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px', fontFamily: '"Inter", sans-serif', color: '#64748b' }}>Carregando formulário médico...</div>}>
      <FormularioVacina />
    </Suspense>
  );
}