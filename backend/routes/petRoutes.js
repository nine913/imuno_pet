const express = require('express');
const petController = require('../controllers/petController');
const { autenticar, autorizar, forcarClinicaDoUsuario } = require('../middleware/auth');
const router = express.Router();

const EQUIPE_CLINICA = autorizar('VETERINARIO', 'GESTOR_CLINICA', 'ADMINISTRADOR');

router.post('/cadastrar-tutor', autenticar, EQUIPE_CLINICA, petController.cadastrarTutor);
// Auto-cadastro de um novo pet pelo próprio tutor, ou cadastro assistido pela equipe da clínica.
router.post('/cadastrar-pet', autenticar, autorizar('TUTOR', 'VETERINARIO', 'GESTOR_CLINICA', 'ADMINISTRADOR'), petController.criarPet);
router.post('/cadastrar-animal', autenticar, EQUIPE_CLINICA, petController.cadastrarAnimalVet);
router.get('/buscar-animais', autenticar, EQUIPE_CLINICA, forcarClinicaDoUsuario, petController.buscarAnimais);
router.get('/animais', autenticar, EQUIPE_CLINICA, forcarClinicaDoUsuario, petController.buscarAnimais);
router.get('/detalhes-animal/:id_animal', autenticar, EQUIPE_CLINICA, petController.detalhesAnimal);
router.put('/editar-pet-tutor/:id_animal', autenticar, EQUIPE_CLINICA, petController.editarPetTutor);
router.put('/editar-animal/:id', autenticar, EQUIPE_CLINICA, petController.editarAnimalSimples);
router.delete('/deletar-animal/:id_animal', autenticar, EQUIPE_CLINICA, petController.deletarAnimal);
router.get('/relatorio-vacinas', autenticar, EQUIPE_CLINICA, forcarClinicaDoUsuario, petController.relatorioVacinas);

module.exports = router;