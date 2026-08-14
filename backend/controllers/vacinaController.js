const vacinaService = require('../services/vacinaService');
const logger = require('../services/logger');

async function registrarVacina(req, res) {
  try {
    // O aplicante é sempre o profissional autenticado, nunca um valor vindo do cliente.
    req.body.id_usuario = req.user.id_usuario;

    await vacinaService.registrarVacina(req.body);
    await logger.registrarLog(req.user.id_usuario, 'APLICAR_VACINA', `Vacina registrada para o paciente ID ${req.body.id_animal}.`);
    res.status(201).json({ mensagem: 'Vacina registrada com sucesso' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao registrar vacina' });
  }
}

async function cadastrarVacina(req, res) {
  try {
    await vacinaService.cadastrarVacina(req.body);
    await logger.registrarLog(req.user.id_usuario, 'CADASTRAR_VACINA', `Vacina do fabricante ${req.body.fabricante} adicionada ao sistema.`);
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
    await vacinaService.editarVacina(req.params.id_vacina, req.body);
    await logger.registrarLog(req.user.id_usuario, 'EDITAR_VACINA', `Dados da vacina ID ${req.params.id_vacina} atualizados.`);
    res.status(200).json({ mensagem: 'Vacina atualizada com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar vacina' });
  }
}

async function deletarVacina(req, res) {
  try {
    await vacinaService.deletarVacina(req.params.id_vacina);
    await logger.registrarLog(req.user.id_usuario, 'EXCLUIR_VACINA', `Vacina ID ${req.params.id_vacina} excluída.`);
    res.status(200).json({ mensagem: 'Vacina excluída com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir vacina' });
  }
}

async function historicoPet(req, res) {
  try {
    // Um tutor só pode ver o histórico de um animal que é seu.
    if (req.user.perfil === 'TUTOR') {
      const pertence = await vacinaService.animalPertenceATutor(req.params.id_animal, req.user.id_usuario);
      if (!pertence) {
        return res.status(403).json({ erro: 'Você não tem permissão para acessar este histórico.' });
      }
    }

    const historico = await vacinaService.historicoPet(req.params.id_animal, req.query);
    await logger.registrarLog(req.user.id_usuario, 'EMITIR_CARTEIRA', `Histórico/Carteira do animal ID ${req.params.id_animal} acessada.`);
    res.status(200).json(historico);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar historico' });
  }
}

async function deletarRegistroVacina(req, res) {
  try {
    await vacinaService.deletarRegistroVacina(req.params.id_registro);
    await logger.registrarLog(req.user.id_usuario, 'EXCLUIR_REGISTRO_VACINA', `Aplicação ID ${req.params.id_registro} deletada.`);
    res.status(200).json({ mensagem: 'Registro de vacina excluído com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir registro de vacina' });
  }
}

async function relatorioVacinas(req, res) {
  try {
    const relatorio = await vacinaService.relatorioVacinas(req.query);
    await logger.registrarLog(req.user.id_usuario, 'EMITIR_RELATORIO', 'Relatório detalhado de vacinação gerado.');
    res.status(200).json(relatorio);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao gerar relatório detalhado' });
  }
}

async function editarRegistroVacina(req, res) {
  try {
    req.body.id_usuario = req.user.id_usuario;
    await vacinaService.editarRegistroVacina(req.params.id_registro, req.body);
    await logger.registrarLog(req.user.id_usuario, 'EDITAR_REGISTRO_VACINA', `Aplicação ID ${req.params.id_registro} alterada.`);
    res.status(200).json({ mensagem: 'Registro de vacina atualizado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar registro de vacina' });
  }
}

async function animaisAtrasados(req, res) {
  try {
    const atrasados = await vacinaService.animaisAtrasados(req.query);
    await logger.registrarLog(req.user.id_usuario, 'GERAR_RELATORIO', 'Relatório de animais em atraso gerado.');
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
