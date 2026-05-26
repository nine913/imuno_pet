const petService = require('../services/petService');

async function criarPet(req, res) {
  try {
    await petService.criarPet(req.body);
    res.status(201).json({ mensagem: 'Pet cadastrado com sucesso!' });
  } catch (error) {
    const status = error.status || 500;
    const mensagem = error.message || 'Erro interno ao cadastrar pet';
    res.status(status).json({ erro: mensagem });
  }
}

async function buscarAnimais(req, res) {
  try {
    const animais = await petService.buscarAnimais(req.query);
    res.status(200).json(animais);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar animais' });
  }
}

async function detalhesAnimal(req, res) {
  try {
    const animal = await petService.detalhesAnimal(req.params.id_animal);
    if (!animal) {
      return res.status(404).json({ erro: 'Animal não encontrado' });
    }
    res.status(200).json(animal);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar detalhes' });
  }
}

async function editarPetTutor(req, res) {
  try {
    await petService.editarPetTutor(req.params.id_animal, req.body);
    res.status(200).json({ mensagem: 'Dados updated com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar dados' });
  }
}

async function deletarAnimal(req, res) {
  try {
    await petService.deletarAnimal(req.params.id_animal);
    res.status(200).json({ mensagem: 'Animal excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir animal' });
  }
}

module.exports = {
  criarPet,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  deletarAnimal
};
