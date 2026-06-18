const governoService = require('../services/governoService');
const logger = require('../services/logger');

async function dadosEpidemiologicos(req, res) {
  try {
    const { id_usuario_log } = req.query;
    const resultado = await governoService.dadosEpidemiologicos(req.query);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'VISUALIZAR_DASHBOARD', 'Acessou mapa epidemiológico.');
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({
      erro: error.message || 'Erro ao buscar dados epidemiologicos'
    });
  }
}

async function relatoriosAvancados(req, res) {
  try {
    const { id_usuario_log } = req.query;
    const resultado = await governoService.relatoriosAvancados(req.query);

    if (id_usuario_log) {
      await logger.registrarLog(id_usuario_log, 'EMITIR_RELATORIO', 'Emissão de relatório cruzado de zoonoses.');
    }
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({
      erro: error.message || 'Erro ao gerar relatorio avancado do governo'
    });
  }
}

module.exports = {
  dadosEpidemiologicos,
  relatoriosAvancados
};