const gestorService = require('../services/gestorService');

async function dadosDashboard(req, res) {
  try {
    const resultado = await gestorService.dadosDashboard(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function relatoriosAvancados(req, res) {
  try {
    const resultado = await gestorService.relatoriosAvancados(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function veterinariosLista(req, res) {
  try {
    const resultado = await gestorService.veterinariosLista(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function cadastrarVet(req, res) {
  try {
    await gestorService.cadastrarVet(req.body);
    res.status(201).json({ mensagem: 'Veterinário cadastrado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function editarVet(req, res) {
  try {
    await gestorService.editarVet(req.params.id_veterinario, req.body);
    res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ erro: error.message || 'Erro interno' });
  }
}

async function deletarVet(req, res) {
  try {
    await gestorService.deletarVet(req.params.id_veterinario);
    res.status(200).json({ mensagem: 'Veterinário excluído com sucesso' });
  } catch (error) {
    console.error(error);
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