const gestorService = require('../services/gestorService');
const logger = require('../services/logger');

async function dadosDashboard(req, res) {
  try {
    const { id_usuario_log } = req.query;
    const resultado = await gestorService.dadosDashboard(req.query);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'VISUALIZAR_DASHBOARD', 'Gestor visualizou os indicadores da clínica.');
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function relatoriosAvancados(req, res) {
  try {
    const { id_usuario_log } = req.query;
    const resultado = await gestorService.relatoriosAvancados(req.query);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EMITIR_RELATORIO', 'Gestor emitiu um relatório avançado.');
    }
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
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await gestorService.cadastrarVet(req.body);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'CADASTRAR_VETERINARIO', `Novo veterinário (${req.body.nome_completo}) cadastrado na clínica.`);
    }
    res.status(201).json({ mensagem: 'Veterinário cadastrado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function editarVet(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await gestorService.editarVet(req.params.id_veterinario, req.body);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EDITAR_VETERINARIO', `Dados do veterinário ID ${req.params.id_veterinario} atualizados.`);
    }
    res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function deletarVet(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await gestorService.deletarVet(req.params.id_veterinario);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EXCLUIR_VETERINARIO', `Veterinário ID ${req.params.id_veterinario} removido da equipe.`);
    }
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