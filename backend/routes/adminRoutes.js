const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticar, autorizar } = require('../middleware/auth');

// Todo o namespace /admin exige perfil ADMINISTRADOR.
router.use(autenticar, autorizar('ADMINISTRADOR'));

router.get('/clinicas', adminController.listarClinicas);
router.get('/clinicas/:id', adminController.obterClinicaPorId);
router.post('/cadastrar-clinica', adminController.cadastrarClinica);
router.put('/editar-clinica/:id', adminController.editarClinica);
router.delete('/deletar-clinica/:id', adminController.deletarClinica);
router.get('/gestores', adminController.listarGestores);
router.post('/cadastrar-gestor', adminController.cadastrarGestor);
router.put('/editar-gestor/:id', adminController.editarGestor);
router.delete('/deletar-gestor/:id', adminController.deletarGestor);
router.get('/orgaos', adminController.listarOrgaos);
router.post('/cadastrar-orgao', adminController.cadastrarOrgao);
router.put('/editar-orgao/:id', adminController.editarOrgao);
router.delete('/deletar-orgao/:id', adminController.deletarOrgao);
router.get('/estatisticas', adminController.obterEstatisticas);
router.get('/vacinas', adminController.listarVacinas);
router.post('/cadastrar-vacina', adminController.cadastrarVacina);
router.put('/editar-vacina/:id', adminController.editarVacina);
router.delete('/deletar-vacina/:id', adminController.deletarVacina);
router.get('/especies', adminController.listarEspecies);
router.post('/cadastrar-especie', adminController.cadastrarEspecie);
router.delete('/deletar-especie/:id', adminController.deletarEspecie);
router.get('/racas', adminController.listarRacas);
router.post('/cadastrar-raca', adminController.cadastrarRaca);
router.delete('/deletar-raca/:id', adminController.deletarRaca);
router.get('/avisos', adminController.listarAvisos);
router.post('/cadastrar-aviso', adminController.cadastrarAviso);
router.put('/editar-aviso/:id', adminController.editarAviso);
router.delete('/deletar-aviso/:id', adminController.deletarAviso);
router.get('/logs', adminController.listarLogs);

module.exports = router;