const petService = require('../services/petService');
const logger = require('../services/logger');

const criarPet = async (req, res) => {
  try {
    // Um tutor só pode cadastrar pet na própria conta; a equipe da clínica pode informar o tutor.
    if (req.user.perfil === 'TUTOR') {
      req.body.id_usuario = req.user.id_usuario;
    }

    await petService.criarPet(req.body);
    await logger.registrarLog(req.user.id_usuario, 'CADASTRAR_ANIMAL', `Animal ${req.body.nome} cadastrado.`);
    res.status(201).json({ mensagem: 'Pet criado com sucesso!' });
  } catch (error) {
    if (error.status === 404) {
      res.status(404).json({ erro: error.message });
    } else {
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
  }
};

const cadastrarAnimalVet = async (req, res) => {
  try {
    await petService.cadastrarAnimalVet(req.body);
    await logger.registrarLog(req.user.id_usuario, 'CADASTRAR_ANIMAL_VET', `Paciente ${req.body.nome} cadastrado na clínica.`);
    res.status(201).json({ mensagem: 'Paciente cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar animal.' });
  }
};

const cadastrarTutor = async (req, res) => {
  try {
    await petService.cadastrarTutorEPet(req.body);
    await logger.registrarLog(req.user.id_usuario, 'CADASTRAR_TUTOR_PET', 'Tutor e Pet criados simultaneamente.');
    res.status(201).json({ mensagem: 'Tutor e Pet cadastrados com sucesso!' });
  } catch (error) {
    res.status(400).json({ erro: error.message || 'Erro interno' });
  }
};

const buscarAnimais = async (req, res) => {
  try {
    const animais = await petService.buscarAnimais(req.query);
    res.status(200).json(animais);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar animais.' });
  }
};

const detalhesAnimal = async (req, res) => {
  try {
    const dados = await petService.detalhesAnimal(req.params.id_animal);
    if (!dados) {
      return res.status(404).json({ erro: 'Animal não encontrado.' });
    }
    res.status(200).json(dados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar detalhes.' });
  }
};

const editarPetTutor = async (req, res) => {
  try {
    await petService.editarPetTutor(req.params.id_animal, req.body);
    await logger.registrarLog(req.user.id_usuario, 'EDITAR_ANIMAL', `Dados do animal ID ${req.params.id_animal} alterados.`);
    res.status(200).json({ mensagem: 'Atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar dados.' });
  }
};

const editarAnimalSimples = async (req, res) => {
  try {
    const { id } = req.params;
    await petService.editarAnimalSimples(id, req.body);
    await logger.registrarLog(req.user.id_usuario, 'EDITAR_ANIMAL', `Dados médicos do animal ID ${id} alterados.`);
    res.status(200).json({ mensagem: 'Animal atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar animal.' });
  }
};

const deletarAnimal = async (req, res) => {
  try {
    await petService.deletarAnimal(req.params.id_animal);
    await logger.registrarLog(req.user.id_usuario, 'EXCLUIR_ANIMAL', `Animal ID ${req.params.id_animal} foi excluído.`);
    res.status(200).json({ mensagem: 'Deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar animal.' });
  }
};

const relatorioVacinas = async (req, res) => {
  try {
    const dados = await petService.relatorioVacinasVet(req.query);
    await logger.registrarLog(req.user.id_usuario, 'EMITIR_RELATORIO', 'Relatório de vacinas emitido/visualizado.');
    res.status(200).json(dados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
};

module.exports = {
  criarPet,
  cadastrarAnimalVet,
  cadastrarTutor,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  editarAnimalSimples,
  deletarAnimal,
  relatorioVacinas
};
