const tutorService = require('../services/tutorService'); // Service com regras/queries do Tutor

// GET: retorna todos os tutores
async function buscarTutores(req, res) {
  try {
    // Este endpoint não usa filtros: chama o service diretamente
    const tutores = await tutorService.buscarTutores();
    res.status(200).json(tutores);
  } catch (error) {
    // Erro genérico de busca
    res.status(500).json({ erro: 'Erro ao buscar tutores' });
  }
}

// GET: retorna tutores filtrados por termo (query string)
async function listarTutores(req, res) {
  try {
    // req.query.termo pode vir da URL; se não existir, usa ''
    const termo = req.query.termo || '';
    const tutores = await tutorService.listarTutores(termo);
    res.status(200).json(tutores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tutores' });
  }
}

// PUT: edita dados do tutor (id vem de params e dados vêm do body)
async function editarTutorDados(req, res) {
  try {
    // req.params.id_tutor: id da rota
    // req.body: novos campos do tutor
    await tutorService.editarTutorDados(req.params.id_tutor, req.body);
    res.status(200).json({ mensagem: 'Dados do tutor atualizados com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar tutor' });
  }
}

// DELETE: remove tutor (id vem de params)
async function deletarTutor(req, res) {
  try {
    await tutorService.deletarTutor(req.params.id_tutor);
    res.status(200).json({ mensagem: 'Tutor excluído com sucesso!' });
  } catch (error) {
    // Se o error tiver status/message vindos do service, usa; senão, fallback
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir tutor' });
  }
}

// POST: cadastra tutor e pet (dados vêm do body)
async function cadastrarTutorPet(req, res) {
  try {
    await tutorService.cadastrarTutorPet(req.body);
    res.status(201).json({ mensagem: 'Tutor e Pet cadastrados com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao cadastrar tutor e pet no sistema.' });
  }
}

// GET: lista animais de um tutor usando id_usuario (params)
async function getTutorAnimais(req, res) {
  try {
    const animais = await tutorService.getTutorAnimais(req.params.id_usuario);
    res.status(200).json(animais);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar animais do tutor' });
  }
}

// GET: lista alertas de vacinação para um tutor usando id_usuario (params)
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
  cadastrarTutorPet,
  getTutorAnimais,
  getTutorAlertas
};
