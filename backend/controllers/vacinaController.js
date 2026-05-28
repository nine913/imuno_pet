const vacinaService = require('../services/vacinaService'); // Service com regras/queries do módulo Vacina

// POST: registra um novo registro de vacinação (dados no body)
async function registrarVacina(req, res) {
  try {
    // req.body: campos da vacinação/registro
    await vacinaService.registrarVacina(req.body);
    // 201 = criado com sucesso
    res.status(201).json({ mensagem: 'Vacina registrada com sucesso' });
  } catch (error) {
    // Se existir status no erro, usa; senão, 500
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao registrar vacina' });
  }
}

// POST: cadastra uma vacina (dados no body)
async function cadastrarVacina(req, res) {
  try {
    await vacinaService.cadastrarVacina(req.body);
    res.status(201).json({ mensagem: 'Vacina cadastrada com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao cadastrar vacina' });
  }
}

// GET: busca lista de vacinas (filtros via query)
async function buscarVacinas(req, res) {
  try {
    // req.query: filtros opcionais para buscar vacinas
    const vacinas = await vacinaService.buscarVacinas(req.query);
    res.status(200).json(vacinas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar vacinas' });
  }
}

// PUT: atualiza uma vacina pelo id (id em params, dados no body)
async function editarVacina(req, res) {
  try {
    // req.params.id_vacina: id da vacina
    // req.body: novos dados
    await vacinaService.editarVacina(req.params.id_vacina, req.body);
    res.status(200).json({ mensagem: 'Vacina atualizada com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar vacina' });
  }
}

// DELETE: remove vacina pelo id (id em params)
async function deletarVacina(req, res) {
  try {
    await vacinaService.deletarVacina(req.params.id_vacina);
    res.status(200).json({ mensagem: 'Vacina excluída com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir vacina' });
  }
}

// GET: histórico de vacinação de um pet (id_animal em params + filtros na query)
async function historicoPet(req, res) {
  try {
    const historico = await vacinaService.historicoPet(req.params.id_animal, req.query);
    res.status(200).json(historico);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar historico' });
  }
}

// DELETE: remove um registro de vacinação pelo id (id_registro em params)
async function deletarRegistroVacina(req, res) {
  try {
    await vacinaService.deletarRegistroVacina(req.params.id_registro);
    res.status(200).json({ mensagem: 'Registro de vacina excluído com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir registro de vacina' });
  }
}

// GET: relatório detalhado de vacinas (filtros na query)
async function relatorioVacinas(req, res) {
  try {
    const relatorio = await vacinaService.relatorioVacinas(req.query);
    res.status(200).json(relatorio);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao gerar relatório detalhado' });
  }
}

// PUT: edita um registro de vacinação (id_registro em params, dados no body)
async function editarRegistroVacina(req, res) {
  try {
    await vacinaService.editarRegistroVacina(req.params.id_registro, req.body);
    res.status(200).json({ mensagem: 'Registro de vacina atualizado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar registro de vacina' });
  }
}

// GET: lista animais com vacinas atrasadas (sem params)
async function animaisAtrasados(req, res) {
  try {
    const atrasados = await vacinaService.animaisAtrasados(req.query);
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