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

const router = express.Router(); // Router isolado para as rotas de Vacina

// POST /registrar-vacina -> registra um registro de vacinação
router.post('/registrar-vacina', registrarVacina);

// POST /cadastrar-vacina -> cadastra uma vacina (tabela vacina)
router.post('/cadastrar-vacina', cadastrarVacina);

// GET /vacinas -> lista vacinas (pode ter filtros via query)
router.get('/vacinas', buscarVacinas);

// PUT /editar-vacina/:id_vacina -> atualiza dados da vacina
router.put('/editar-vacina/:id_vacina', editarVacina);

// DELETE /deletar-vacina/:id_vacina -> remove a vacina
router.delete('/deletar-vacina/:id_vacina', deletarVacina);

// GET /historico-pet/:id_animal -> histórico do pet (registros)
router.get('/historico-pet/:id_animal', historicoPet);

// DELETE /deletar-registro-vacina/:id_registro -> remove registro de vacinação
router.delete('/deletar-registro-vacina/:id_registro', deletarRegistroVacina);

// GET /relatorio-vacinas -> relatório detalhado (filtros via query)
router.get('/relatorio-vacinas', relatorioVacinas);

// PUT /editar-registro-vacina/:id_registro -> edita registro de vacinação
router.put('/editar-registro-vacina/:id_registro', editarRegistroVacina);

// GET /animais-atrasados -> lista pets com vacinas atrasadas
router.get('/animais-atrasados', animaisAtrasados);

module.exports = router; // exporta o router para ser montado no backend/index.js
