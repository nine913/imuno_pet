const governoService = require('../services/governoService'); // Service com regras/consultas do governo

async function dadosEpidemiologicos(req, res) {
  try {
    // req.query: filtros/parâmetros enviados na URL (ex: /... ?inicio=...&fim=...)
    const resultado = await governoService.dadosEpidemiologicos(req.query);

    // 200 = retorno com os dados epidemiológicos
    res.status(200).json(resultado);
  } catch (error) {
    // Usa status do erro se existir, senão 500 (erro interno)
    res.status(error.status || 500).json({
      erro: error.message || 'Erro ao buscar dados epidemiologicos'
    });
  }
}

async function relatoriosAvancados(req, res) {
  try {
    // req.query: filtros/parâmetros para o relatório
    const resultado = await governoService.relatoriosAvancados(req.query);

    // 200 = retorno com os dados do relatório
    res.status(200).json(resultado);
  } catch (error) {
    // 500 fallback + mensagem padrão caso error.message não exista
    res.status(error.status || 500).json({
      erro: error.message || 'Erro ao gerar relatorio avancado do governo'
    });
  }
}

module.exports = {
  dadosEpidemiologicos,
  relatoriosAvancados
};
