const express = require('express');
const petController = require('../controllers/petController');
const router = express.Router();

router.post('/cadastrar-tutor', petController.cadastrarTutor);
router.post('/cadastrar-pet', petController.criarPet);
router.post('/cadastrar-animal', petController.cadastrarAnimalVet);
router.get('/buscar-animais', petController.buscarAnimais);
router.get('/animais', petController.buscarAnimais);
router.get('/detalhes-animal/:id_animal', petController.detalhesAnimal);
router.put('/editar-pet-tutor/:id_animal', petController.editarPetTutor);
router.put('/editar-animal/:id', petController.editarAnimalSimples);
router.delete('/deletar-animal/:id_animal', petController.deletarAnimal);
router.get('/relatorio-vacinas', petController.relatorioVacinas);

module.exports = router;