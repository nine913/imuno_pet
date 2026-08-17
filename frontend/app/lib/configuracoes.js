export const CONFIG_PADRAO = {
  tema: 'claro',
  fonte: '16px',
  altoContraste: false,
  reduzirAnimacoes: false,
  espacamentoAmpliado: false,
  destacarFoco: false,
  notificacoesEmail: true,
  notificacoesWhatsapp: true
};

function chaveConfig(id_usuario) {
  return `imunoPetConfig_${id_usuario}`;
}

export function obterConfiguracoes(id_usuario) {
  if (typeof window === 'undefined' || !id_usuario) return { ...CONFIG_PADRAO };
  const salvas = localStorage.getItem(chaveConfig(id_usuario));
  if (!salvas) return { ...CONFIG_PADRAO };
  try {
    return { ...CONFIG_PADRAO, ...JSON.parse(salvas) };
  } catch {
    return { ...CONFIG_PADRAO };
  }
}

export function salvarConfiguracoes(id_usuario, configuracoes) {
  if (typeof window === 'undefined' || !id_usuario) return;
  localStorage.setItem(chaveConfig(id_usuario), JSON.stringify(configuracoes));
}
