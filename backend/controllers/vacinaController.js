const vacinaService = require('../services/vacinaService');

async function registrarVacina(req, res) {
  try {
    await vacinaService.registrarVacina(req.body);
    res.status(201).json({ mensagem: 'Vacina registrada com sucesso' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao registrar vacina' });
  }
}

async function cadastrarVacina(req, res) {
  try {
    await vacinaService.cadastrarVacina(req.body);
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
    res.status(200).json({ mensagem: 'Vacina atualizada com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar vacina' });
  }
}

async function deletarVacina(req, res) {
  try {
    await vacinaService.deletarVacina(req.params.id_vacina);
    res.status(200).json({ mensagem: 'Vacina excluída com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir vacina' });
  }
}

async function historicoPet(req, res) {
  try {
    const historico = await vacinaService.historicoPet(req.params.id_animal, req.query);
    res.status(200).json(historico);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar historico' });
  }
}

async function deletarRegistroVacina(req, res) {
  try {
    await vacinaService.deletarRegistroVacina(req.params.id_registro);
    res.status(200).json({ mensagem: 'Registro de vacina excluído com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir registro de vacina' });
  }
}

async function relatorioVacinas(req, res) {
  try {
    const relatorio = await vacinaService.relatorioVacinas(req.query);
    res.status(200).json(relatorio);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao gerar relatório detalhado' });
  }
}

async function editarRegistroVacina(req, res) {
  try {
    await vacinaService.editarRegistroVacina(req.params.id_registro, req.body);
    res.status(200).json({ mensagem: 'Registro de vacina atualizado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar registro de vacina' });
  }
}

async function animaisAtrasados(req, res) {
  try {
    const atrasados = await vacinaService.animaisAtrasados();
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
