const petService = require('../services/petService'); // Service com regras/queries do Pet

// Controller: cria um pet a partir dos dados do body
async function criarPet(req, res) {
  try {
    // req.body: dados enviados no POST (ex: nome, especie, etc.)
    await petService.criarPet(req.body);

    // 201 = recurso criado com sucesso
    res.status(201).json({ mensagem: 'Pet cadastrado com sucesso!' });
  } catch (error) {
    // Se o service lançar um erro com status, usa; senão, 500
    const status = error.status || 500;

    // Se existir message, usa; senão, mensagem padrão
    const mensagem = error.message || 'Erro interno ao cadastrar pet';

    res.status(status).json({ erro: mensagem });
  }
}

// Controller: busca lista de animais conforme filtros na querystring
async function buscarAnimais(req, res) {
  try {
    // req.query: filtros enviados via URL
    const animais = await petService.buscarAnimais(req.query);

    res.status(200).json(animais);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar animais' });
  }
}

// Controller: busca detalhes de um animal pelo id (params)
async function detalhesAnimal(req, res) {
  try {
    // req.params.id_animal: parte da rota /detalhes-animal/:id_animal
    const animal = await petService.detalhesAnimal(req.params.id_animal);

    // Se não existir no banco, retorna 404
    if (!animal) {
      return res.status(404).json({ erro: 'Animal não encontrado' });
    }

    res.status(200).json(animal);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar detalhes' });
  }
}

// Controller: edita dados do pet associado a um tutor (id + body)
async function editarPetTutor(req, res) {
  try {
    // req.params.id_animal: id do animal na rota
    // req.body: novos dados
    await petService.editarPetTutor(req.params.id_animal, req.body);

    res.status(200).json({ mensagem: 'Dados updated com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar dados' });
  }
}

// Controller: deleta um animal pelo id
async function deletarAnimal(req, res) {
  try {
    // req.params.id_animal: id do animal na rota
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
