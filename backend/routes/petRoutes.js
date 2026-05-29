const express = require('express');
const petController = require('../controllers/petController');
const router = express.Router();


router.post('/cadastrar-pet', petController.criarPet);
router.get('/buscar-animais', petController.buscarAnimais);
router.get('/animais', petController.buscarAnimais);
router.get('/detalhes-animal/:id_animal', petController.detalhesAnimal);
router.put('/editar-pet-tutor/:id_animal', petController.editarPetTutor);
router.put('/editar-animal/:id', petController.editarAnimalSimples);
router.delete('/deletar-animal/:id_animal', petController.deletarAnimal);


module.exports = router;