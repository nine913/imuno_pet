const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { autenticar, autorizar, exigirPropriaClinica } = require('../middleware/auth');

// Espécies, raças e vacinas são catálogos compartilhados: veterinários e gestores de clínica
// também os consultam (formulários de cadastro de pet/vacina) e, no caso de espécies/raças e do
// cadastro de novas vacinas, também os mantêm (telas espelhadas em /veterinario/especies e
// /veterinario/cadastrar-vacina). Apenas editar/excluir vacina do catálogo global e as rotas de
// clínicas, gestores, órgãos, avisos e logs permanecem exclusivas do ADMINISTRADOR.
const PERFIS_CATALOGO_LEITURA = ['VETERINARIO', 'GESTOR_CLINICA', 'GOVERNO', 'ADMINISTRADOR'];
const PERFIS_CATALOGO_GERENCIAR = ['VETERINARIO', 'GESTOR_CLINICA', 'ADMINISTRADOR'];

router.use(autenticar);

router.get('/especies', autorizar(...PERFIS_CATALOGO_LEITURA), adminController.listarEspecies);
router.post('/cadastrar-especie', autorizar(...PERFIS_CATALOGO_GERENCIAR), adminController.cadastrarEspecie);
router.delete('/deletar-especie/:id', autorizar(...PERFIS_CATALOGO_GERENCIAR), adminController.deletarEspecie);

router.get('/racas', autorizar(...PERFIS_CATALOGO_LEITURA), adminController.listarRacas);
router.post('/cadastrar-raca', autorizar(...PERFIS_CATALOGO_GERENCIAR), adminController.cadastrarRaca);
router.delete('/deletar-raca/:id', autorizar(...PERFIS_CATALOGO_GERENCIAR), adminController.deletarRaca);

router.get('/vacinas', autorizar(...PERFIS_CATALOGO_LEITURA), adminController.listarVacinas);
router.post('/cadastrar-vacina', autorizar(...PERFIS_CATALOGO_GERENCIAR), adminController.cadastrarVacina);
router.put('/editar-vacina/:id', autorizar('ADMINISTRADOR'), adminController.editarVacina);
router.delete('/deletar-vacina/:id', autorizar('ADMINISTRADOR'), adminController.deletarVacina);

// Consulta de uma clínica específica: o gestor pode ver a própria clínica; o administrador, qualquer uma.
router.get(
  '/clinicas/:id',
  autorizar('GESTOR_CLINICA', 'ADMINISTRADOR'),
  exigirPropriaClinica('id'),
  adminController.obterClinicaPorId
);

// Demais rotas administrativas (clínicas, gestores, órgãos, avisos, logs) exigem ADMINISTRADOR.
router.use(autorizar('ADMINISTRADOR'));

router.get('/clinicas', adminController.listarClinicas);
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
router.get('/avisos', adminController.listarAvisos);
router.post('/cadastrar-aviso', adminController.cadastrarAviso);
router.put('/editar-aviso/:id', adminController.editarAviso);
router.delete('/deletar-aviso/:id', adminController.deletarAviso);
router.get('/logs', adminController.listarLogs);

module.exports = router;
