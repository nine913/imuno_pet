const express = require('express');
const {
  criarPet,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  deletarAnimal
} = require('../controllers/petController');

const router = express.Router();

router.post('/cadastrar-pet', criarPet);
router.get('/buscar-animais', buscarAnimais);
router.get('/detalhes-animal/:id_animal', detalhesAnimal);
router.put('/editar-pet-tutor/:id_animal', editarPetTutor);
router.delete('/deletar-animal/:id_animal', deletarAnimal);

module.exports = router;
