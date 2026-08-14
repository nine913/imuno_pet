const tutorService = require('../services/tutorService');
const logger = require('../services/logger');

async function buscarTutores(req, res) {
  try {
    const tutores = await tutorService.buscarTutores();
    res.status(200).json(tutores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tutores' });
  }
}

const listarTutores = async (req, res) => {
  try {
    const tutores = await tutorService.listarTutores(req.query);
    res.status(200).json(tutores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tutores.' });
  }
};

async function editarTutorDados(req, res) {
  try {
    await tutorService.editarTutorDados(req.params.id_tutor, req.body);
    await logger.registrarLog(req.user.id_usuario, 'EDITAR_TUTOR', `Dados do tutor ID ${req.params.id_tutor} atualizados.`);
    res.status(200).json({ mensagem: 'Dados do tutor atualizados com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar tutor' });
  }
}

async function deletarTutor(req, res) {
  try {
    await tutorService.deletarTutor(req.params.id_tutor);
    await logger.registrarLog(req.user.id_usuario, 'EXCLUIR_TUTOR', `Tutor ID ${req.params.id_tutor} excluído.`);
    res.status(200).json({ mensagem: 'Tutor excluído com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir tutor' });
  }
}

async function getTutorAnimais(req, res) {
  try {
    const animais = await tutorService.getTutorAnimais(req.params.id_usuario);
    res.status(200).json(animais);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar animais do tutor' });
  }
}

async function getTutorAlertas(req, res) {
  try {
    const alertas = await tutorService.getTutorAlertas(req.params.id_usuario);
    res.status(200).json(alertas);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar alertas' });
  }
}

module.exports = {
  buscarTutores,
  listarTutores,
  editarTutorDados,
  deletarTutor,
  getTutorAnimais,
  getTutorAlertas
};
