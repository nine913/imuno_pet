const gestorService = require('../services/gestorService');
const logger = require('../services/logger');

async function dadosDashboard(req, res) {
  try {
    const resultado = await gestorService.dadosDashboard(req.query);
    await logger.registrarLog(req.user.id_usuario, 'VISUALIZAR_DASHBOARD', 'Gestor visualizou os indicadores da clínica.');
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function relatoriosAvancados(req, res) {
  try {
    const resultado = await gestorService.relatoriosAvancados(req.query);
    await logger.registrarLog(req.user.id_usuario, 'EMITIR_RELATORIO', 'Gestor emitiu um relatório avançado.');
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function veterinariosLista(req, res) {
  try {
    const resultado = await gestorService.veterinariosLista(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function cadastrarVet(req, res) {
  try {
    await gestorService.cadastrarVet(req.body);
    await logger.registrarLog(req.user.id_usuario, 'CADASTRAR_VETERINARIO', `Novo veterinário (${req.body.nome_completo}) cadastrado na clínica.`);
    res.status(201).json({ mensagem: 'Veterinário cadastrado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

// Um gestor só pode alterar/excluir veterinários da própria clínica (ADMINISTRADOR não tem essa restrição).
async function verificarPertenceAClinica(req, res) {
  if (req.user.perfil !== 'GESTOR_CLINICA') return true;
  const idClinicaDoVet = await gestorService.obterClinicaDoVet(req.params.id_veterinario);
  if (idClinicaDoVet !== req.user.id_clinica) {
    res.status(403).json({ erro: 'Você não tem permissão para alterar este veterinário.' });
    return false;
  }
  return true;
}

async function editarVet(req, res) {
  try {
    if (!(await verificarPertenceAClinica(req, res))) return;
    await gestorService.editarVet(req.params.id_veterinario, req.body);
    await logger.registrarLog(req.user.id_usuario, 'EDITAR_VETERINARIO', `Dados do veterinário ID ${req.params.id_veterinario} atualizados.`);
    res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function deletarVet(req, res) {
  try {
    if (!(await verificarPertenceAClinica(req, res))) return;
    await gestorService.deletarVet(req.params.id_veterinario);
    await logger.registrarLog(req.user.id_usuario, 'EXCLUIR_VETERINARIO', `Veterinário ID ${req.params.id_veterinario} removido da equipe.`);
    res.status(200).json({ mensagem: 'Veterinário excluído com sucesso' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

module.exports = {
  dadosDashboard,
  relatoriosAvancados,
  veterinariosLista,
  cadastrarVet,
  editarVet,
  deletarVet
};
