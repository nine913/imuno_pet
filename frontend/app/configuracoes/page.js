"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutPainel from '../components/LayoutPainel';
import { apiFetch } from '../lib/api';
import { CONFIG_PADRAO, obterConfiguracoes, salvarConfiguracoes } from '../lib/configuracoes';

export default function Configuracoes() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', cor: '' });
  const [config, setConfig] = useState(CONFIG_PADRAO);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mensagemSenha, setMensagemSenha] = useState({ texto: '', cor: '' });
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioImunoPet');
    if (!usuarioString) {
      router.push('/');
      return;
    }

    const user = JSON.parse(usuarioString);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza a sessão salva em localStorage (sistema externo, só existe no cliente) na montagem; padrão seguro para SSR
    setUsuario(user);
    setConfig(obterConfiguracoes(user.id_usuario));
  }, [router]);

  const atualizarConfig = (campo, valor) => {
    setConfig((atual) => ({ ...atual, [campo]: valor }));
  };

  const salvarPreferencias = (e) => {
    e.preventDefault();
    salvarConfiguracoes(usuario.id_usuario, config);
    setMensagem({ texto: 'Preferências salvas com sucesso! Atualizando...', cor: '#059669' });

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const enviarAlteracaoSenha = async (e) => {
    e.preventDefault();
    setMensagemSenha({ texto: '', cor: '' });

    if (novaSenha.length < 6) {
      setMensagemSenha({ texto: 'A nova senha deve possuir no mínimo 6 caracteres.', cor: '#dc2626' });
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      setMensagemSenha({ texto: 'A confirmação não corresponde à nova senha.', cor: '#dc2626' });
      return;
    }

    setAlterandoSenha(true);
    try {
      const res = await apiFetch('/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha_atual: senhaAtual, nova_senha: novaSenha })
      });
      const dados = await res.json();

      if (res.ok) {
        setMensagemSenha({ texto: dados.mensagem, cor: '#059669' });
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarNovaSenha('');
      } else {
        setMensagemSenha({ texto: dados.erro || 'Erro ao alterar a senha.', cor: '#dc2626' });
      }
    } catch (error) {
      setMensagemSenha({ texto: 'Erro de conexão com o servidor.', cor: '#dc2626' });
    } finally {
      setAlterandoSenha(false);
    }
  };

  if (!usuario) return null;

  const isEscuro = config.tema === 'escuro';
  const bgCard = isEscuro ? '#1e293b' : '#ffffff';
  const textColor = isEscuro ? '#f8fafc' : '#1e293b';
  const labelColor = isEscuro ? '#94a3b8' : '#475569';
  const borderColor = isEscuro ? '#334155' : '#e2e8f0';
  const inputBg = isEscuro ? '#0f172a' : '#ffffff';
  const headerColor = config.altoContraste ? '#fbbf24' : (isEscuro ? '#60a5fa' : '#2563eb');
  const boxSombra = isEscuro ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
  const secaoBg = isEscuro ? '#0f172a' : '#f8fafc';

  const estiloInput = { width: '100%', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: inputBg, color: textColor, fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
  const estiloLabel = { display: 'block', fontWeight: '600', marginBottom: '8px', color: labelColor, fontSize: '14px' };
  const estiloSecao = { padding: '24px', borderRadius: '12px', marginBottom: '24px', border: `1px solid ${borderColor}`, backgroundColor: secaoBg };
  const estiloTituloSecao = { color: headerColor, marginTop: 0, fontSize: '18px', fontWeight: '700', marginBottom: '20px' };
  const estiloCheckboxLinha = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' };
  const estiloCheckbox = { width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563eb', flexShrink: 0 };

  const nomeExibicao = usuario.nome_completo || usuario.nome || 'Usuário';

  return (
    <LayoutPainel>
      <div style={{ padding: '40px', maxWidth: '800px', margin: 'auto', color: textColor }}>

        <div style={{ background: bgCard, padding: '40px', borderRadius: '16px', boxShadow: boxSombra, border: config.altoContraste ? '3px solid #fbbf24' : `1px solid ${borderColor}`, marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, color: headerColor, marginBottom: '30px', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Ajustes e Configurações
          </h2>

          <div style={estiloSecao}>
            <h3 style={estiloTituloSecao}>👤 Conta</h3>
            <p style={{ margin: '0 0 8px 0', color: textColor, fontSize: '15px' }}><strong>Nome:</strong> {nomeExibicao}</p>
            <p style={{ margin: 0, color: textColor, fontSize: '15px' }}><strong>Perfil:</strong> {usuario.perfil?.replace('_', ' ')}</p>
          </div>

          <form onSubmit={enviarAlteracaoSenha}>
            <div style={estiloSecao}>
              <h3 style={estiloTituloSecao}>🔒 Segurança — Alterar Senha</h3>

              <label style={estiloLabel} htmlFor="senhaAtual">Senha atual:</label>
              <input id="senhaAtual" type="password" required autoComplete="current-password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} style={{ ...estiloInput, marginBottom: '16px' }} />

              <label style={estiloLabel} htmlFor="novaSenha">Nova senha:</label>
              <input id="novaSenha" type="password" required minLength={6} autoComplete="new-password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} style={{ ...estiloInput, marginBottom: '16px' }} />

              <label style={estiloLabel} htmlFor="confirmarNovaSenha">Confirmar nova senha:</label>
              <input id="confirmarNovaSenha" type="password" required minLength={6} autoComplete="new-password" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} style={estiloInput} />

              <button type="submit" disabled={alterandoSenha} style={{ marginTop: '20px', backgroundColor: '#2563eb', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '8px', cursor: alterandoSenha ? 'default' : 'pointer', fontSize: '15px', fontWeight: '600', opacity: alterandoSenha ? 0.7 : 1 }}>
                {alterandoSenha ? 'Alterando...' : 'Alterar senha'}
              </button>

              {mensagemSenha.texto && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: mensagemSenha.cor === '#059669' ? (isEscuro ? 'rgba(5, 150, 105, 0.2)' : '#d1fae5') : (isEscuro ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2'), color: mensagemSenha.cor, fontWeight: '600', fontSize: '14px' }}>
                  {mensagemSenha.texto}
                </div>
              )}
            </div>
          </form>

          <form onSubmit={salvarPreferencias}>
            <div style={estiloSecao}>
              <h3 style={estiloTituloSecao}>🎨 Aparência</h3>

              <label style={estiloLabel}>Tema do Sistema:</label>
              <select value={config.tema} onChange={(e) => atualizarConfig('tema', e.target.value)} style={{ ...estiloInput, marginBottom: '20px' }}>
                <option value="claro">Modo Claro (Padrão)</option>
                <option value="escuro">Modo Escuro (Dark Mode)</option>
              </select>

              <label style={estiloLabel}>Tamanho da Fonte:</label>
              <select value={config.fonte} onChange={(e) => atualizarConfig('fonte', e.target.value)} style={estiloInput}>
                <option value="14px">Pequeno (14px)</option>
                <option value="16px">Normal (16px)</option>
                <option value="18px">Grande (18px)</option>
                <option value="20px">Muito Grande (20px)</option>
              </select>
            </div>

            <div style={estiloSecao}>
              <h3 style={estiloTituloSecao}>♿ Acessibilidade</h3>

              <div style={estiloCheckboxLinha}>
                <input type="checkbox" checked={config.altoContraste} onChange={(e) => atualizarConfig('altoContraste', e.target.checked)} id="contraste" style={estiloCheckbox} />
                <label htmlFor="contraste" style={{ cursor: 'pointer', fontWeight: '600', color: textColor, fontSize: '15px' }}>Ativar Modo de Alto Contraste</label>
              </div>

              <div style={estiloCheckboxLinha}>
                <input type="checkbox" checked={config.reduzirAnimacoes} onChange={(e) => atualizarConfig('reduzirAnimacoes', e.target.checked)} id="reduzirAnimacoes" style={estiloCheckbox} />
                <label htmlFor="reduzirAnimacoes" style={{ cursor: 'pointer', fontWeight: '600', color: textColor, fontSize: '15px' }}>Reduzir animações e efeitos de movimento</label>
              </div>

              <div style={estiloCheckboxLinha}>
                <input type="checkbox" checked={config.espacamentoAmpliado} onChange={(e) => atualizarConfig('espacamentoAmpliado', e.target.checked)} id="espacamento" style={estiloCheckbox} />
                <label htmlFor="espacamento" style={{ cursor: 'pointer', fontWeight: '600', color: textColor, fontSize: '15px' }}>Ampliar espaçamento entre linhas e palavras</label>
              </div>

              <div style={{ ...estiloCheckboxLinha, marginBottom: 0 }}>
                <input type="checkbox" checked={config.destacarFoco} onChange={(e) => atualizarConfig('destacarFoco', e.target.checked)} id="destacarFoco" style={estiloCheckbox} />
                <label htmlFor="destacarFoco" style={{ cursor: 'pointer', fontWeight: '600', color: textColor, fontSize: '15px' }}>Destacar foco de navegação por teclado</label>
              </div>
            </div>

            <div style={{ ...estiloSecao, marginBottom: '30px' }}>
              <h3 style={estiloTituloSecao}>🔔 Alertas e Notificações</h3>

              <div style={estiloCheckboxLinha}>
                <input type="checkbox" checked={config.notificacoesEmail} onChange={(e) => atualizarConfig('notificacoesEmail', e.target.checked)} id="notifEmail" style={estiloCheckbox} />
                <label htmlFor="notifEmail" style={{ cursor: 'pointer', color: textColor, fontWeight: '500', fontSize: '15px' }}>Receber relatórios e alertas por E-mail</label>
              </div>

              <div style={{ ...estiloCheckboxLinha, marginBottom: 0 }}>
                <input type="checkbox" checked={config.notificacoesWhatsapp} onChange={(e) => atualizarConfig('notificacoesWhatsapp', e.target.checked)} id="notifWpp" style={estiloCheckbox} />
                <label htmlFor="notifWpp" style={{ cursor: 'pointer', color: textColor, fontWeight: '500', fontSize: '15px' }}>Ativar lembretes de vacinas via WhatsApp</label>
              </div>
              <p style={{ margin: '16px 0 0 0', color: labelColor, fontSize: '13px', fontStyle: 'italic' }}>
                Preferência salva para uso futuro — o envio automático ainda não está implementado no sistema.
              </p>
            </div>

            <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', width: '100%', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
              Salvar Preferências
            </button>
          </form>

          {mensagem.texto && (
            <div style={{ textAlign: 'center', marginTop: '24px', padding: '12px', borderRadius: '8px', backgroundColor: mensagem.cor === '#059669' ? (isEscuro ? 'rgba(5, 150, 105, 0.2)' : '#d1fae5') : (isEscuro ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2'), color: mensagem.cor, fontWeight: '600', fontSize: '15px' }}>
              {mensagem.texto}
            </div>
          )}
        </div>
      </div>
    </LayoutPainel>
  );
}
