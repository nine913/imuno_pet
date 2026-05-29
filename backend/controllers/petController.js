const petService = require('../services/petService');

const criarPet = async (req, res) => {
  try {
    await petService.criarPet(req.body);
    res.status(201).json({ mensagem: 'Pet criado com sucesso!' });
  } catch (error) {
    if (error.status === 404) {
      res.status(404).json({ erro: error.message });
    } else {
      res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
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
    res.status(200).json({ mensagem: 'Atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar dados.' });
  }
};

const editarAnimalSimples = async (req, res) => {
  try {
    const { id } = req.params;
    await petService.editarAnimalSimples(id, req.body);
    res.status(200).json({ mensagem: 'Animal updated com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar animal.' });
  }
};

const deletarAnimal = async (req, res) => {
  try {
    await petService.deletarAnimal(req.params.id_animal);
    res.status(200).json({ mensagem: 'Deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar animal.' });
  }
};

module.exports = {
  criarPet,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  editarAnimalSimples,
  deletarAnimal
};