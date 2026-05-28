const express = require('express'); // Express para criação do Router

// Importa handlers (controllers) do módulo Pet
const {
  criarPet,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  deletarAnimal
} = require('../controllers/petController');

const router = express.Router(); // Router isolado para as rotas de Pet

// POST /cadastrar-pet -> criar pet
router.post('/cadastrar-pet', criarPet);

// GET /buscar-animais -> buscar lista de animais
router.get('/buscar-animais', buscarAnimais);

// GET /detalhes-animal/:id_animal -> detalhes do animal por id
router.get('/detalhes-animal/:id_animal', detalhesAnimal);

// PUT /editar-pet-tutor/:id_animal -> editar pet (tutor) por id do animal
router.put('/editar-pet-tutor/:id_animal', editarPetTutor);

// DELETE /deletar-animal/:id_animal -> deletar animal por id
router.delete('/deletar-animal/:id_animal', deletarAnimal);

module.exports = router; // exporta o router para ser montado no backend/index.js
