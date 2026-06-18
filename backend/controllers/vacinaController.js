const vacinaService = require('../services/vacinaService');
const logger = require('../services/logger');

async function registrarVacina(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await vacinaService.registrarVacina(req.body);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'APLICAR_VACINA', `Vacina registrada para o paciente ID ${req.body.id_animal}.`);
    }
    res.status(201).json({ mensagem: 'Vacina registrada com sucesso' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao registrar vacina' });
  }
}

async function cadastrarVacina(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await vacinaService.cadastrarVacina(req.body);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'CADASTRAR_VACINA', `Vacina do fabricante ${req.body.fabricante} adicionada ao sistema.`);
    }
    res.status(201).json({ mensagem: 'Vacina cadastrada com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao cadastrar vacina' });
  }
}

async function buscarVacinas(req, res) {
  try {
    const vacinas = await vacinaService.buscarVacinas(req.query);
    res.status(200).json(vacinas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar vacinas' });
  }
}

async function editarVacina(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await vacinaService.editarVacina(req.params.id_vacina, req.body);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EDITAR_VACINA', `Dados da vacina ID ${req.params.id_vacina} atualizados.`);
    }
    res.status(200).json({ mensagem: 'Vacina atualizada com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar vacina' });
  }
}

async function deletarVacina(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await vacinaService.deletarVacina(req.params.id_vacina);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EXCLUIR_VACINA', `Vacina ID ${req.params.id_vacina} excluída.`);
    }
    res.status(200).json({ mensagem: 'Vacina excluída com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir vacina' });
  }
}

async function historicoPet(req, res) {
  try {
    const { id_usuario_log } = req.query;
    const historico = await vacinaService.historicoPet(req.params.id_animal, req.query);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EMITIR_CARTEIRA', `Histórico/Carteira do animal ID ${req.params.id_animal} acessada.`);
    }
    res.status(200).json(historico);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar historico' });
  }
}

async function deletarRegistroVacina(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await vacinaService.deletarRegistroVacina(req.params.id_registro);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EXCLUIR_REGISTRO_VACINA', `Aplicação ID ${req.params.id_registro} deletada.`);
    }
    res.status(200).json({ mensagem: 'Registro de vacina excluído com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir registro de vacina' });
  }
}

async function relatorioVacinas(req, res) {
  try {
    const { id_usuario_log } = req.query;
    const relatorio = await vacinaService.relatorioVacinas(req.query);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EMITIR_RELATORIO', 'Relatório detalhado de vacinação gerado.');
    }
    res.status(200).json(relatorio);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao gerar relatório detalhado' });
  }
}

async function editarRegistroVacina(req, res) {
  try {
    const id_usuario_log = req.body.id_usuario_log || req.query.id_usuario_log;
    await vacinaService.editarRegistroVacina(req.params.id_registro, req.body);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EDITAR_REGISTRO_VACINA', `Aplicação ID ${req.params.id_registro} alterada.`);
    }
    res.status(200).json({ mensagem: 'Registro de vacina atualizado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar registro de vacina' });
  }
}

async function animaisAtrasados(req, res) {
  try {
    const { id_usuario_log } = req.query;
    const atrasados = await vacinaService.animaisAtrasados(req.query);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'GERAR_RELATORIO', 'Relatório de animais em atraso gerado.');
    }
    res.status(200).json(atrasados);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar vacinas atrasadas' });
  }
}

module.exports = {
  registrarVacina,
  cadastrarVacina,
  buscarVacinas,
  editarVacina,
  deletarVacina,
  historicoPet,
  deletarRegistroVacina,
  relatorioVacinas,
  editarRegistroVacina,
  animaisAtrasados
};