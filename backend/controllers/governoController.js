const governoService = require('../services/governoService');

async function dadosEpidemiologicos(req, res) {
  try {
    const resultado = await governoService.dadosEpidemiologicos(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar dados epidemiologicos' });
  }
}

async function relatoriosAvancados(req, res) {
  try {
    const resultado = await governoService.relatoriosAvancados(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao gerar relatorio avancado do governo' });
  }
}

module.exports = {
  dadosEpidemiologicos,
  relatoriosAvancados
};
