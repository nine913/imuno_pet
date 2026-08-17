const express = require('express'); // Express para criação do Router

// Importa handlers (controllers) do módulo Vacina
const {
  registrarVacina,
  cadastrarVacina,
  buscarVacinas,
  editarVacina,
  deletarVacina,
  historicoPet,
  deletarRegistroVacina,
  relatorioVacinas,
  editarRegistroVacina,
  animaisAtrasados
} = require('../controllers/vacinaController');

const { autenticar, autorizar, forcarClinicaDoUsuario } = require('../middleware/auth');

const router = express.Router(); // Router isolado para as rotas de Vacina

const EQUIPE_CLINICA = autorizar('VETERINARIO', 'GESTOR_CLINICA', 'ADMINISTRADOR');

// POST /registrar-vacina -> registra um registro de vacinação
router.post('/registrar-vacina', autenticar, EQUIPE_CLINICA, forcarClinicaDoUsuario, registrarVacina);

// POST /cadastrar-vacina -> cadastra uma vacina (tabela vacina)
router.post('/cadastrar-vacina', autenticar, EQUIPE_CLINICA, cadastrarVacina);

// GET /vacinas -> lista o catálogo de vacinas (pode ter filtros via query). Leitura também
// usada pelo governo para popular filtros de relatórios epidemiológicos.
router.get('/vacinas', autenticar, autorizar('VETERINARIO', 'GESTOR_CLINICA', 'GOVERNO', 'ADMINISTRADOR'), buscarVacinas);

// PUT /editar-vacina/:id_vacina -> atualiza dados da vacina
router.put('/editar-vacina/:id_vacina', autenticar, EQUIPE_CLINICA, editarVacina);

// DELETE /deletar-vacina/:id_vacina -> remove a vacina
router.delete('/deletar-vacina/:id_vacina', autenticar, EQUIPE_CLINICA, deletarVacina);

// GET /historico-pet/:id_animal -> histórico do pet (equipe da clínica, ou o próprio tutor do animal)
router.get('/historico-pet/:id_animal', autenticar, autorizar('VETERINARIO', 'GESTOR_CLINICA', 'ADMINISTRADOR', 'TUTOR'), forcarClinicaDoUsuario, historicoPet);

// DELETE /deletar-registro-vacina/:id_registro -> remove registro de vacinação
router.delete('/deletar-registro-vacina/:id_registro', autenticar, EQUIPE_CLINICA, deletarRegistroVacina);

// GET /relatorio-vacinas -> relatório detalhado (filtros via query)
router.get('/relatorio-vacinas', autenticar, EQUIPE_CLINICA, forcarClinicaDoUsuario, relatorioVacinas);

// PUT /editar-registro-vacina/:id_registro -> edita registro de vacinação
router.put('/editar-registro-vacina/:id_registro', autenticar, EQUIPE_CLINICA, editarRegistroVacina);

// GET /animais-atrasados -> lista pets com vacinas atrasadas
router.get('/animais-atrasados', autenticar, EQUIPE_CLINICA, forcarClinicaDoUsuario, animaisAtrasados);

module.exports = router; // exporta o router para ser montado no backend/index.js
