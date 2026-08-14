const express = require('express'); // Express para criação do Router

// Importa handlers (controllers) do módulo Governo
const {
  dadosEpidemiologicos,
  relatoriosAvancados
} = require('../controllers/governoController');

const { autenticar, autorizar } = require('../middleware/auth');

const router = express.Router(); // Router isolado para as rotas de Governo

const ORGAO_GOVERNAMENTAL = autorizar('GOVERNO', 'ADMINISTRADOR');

// GET /governo/dados-epidemiologicos -> dados epidemiológicos
router.get('/governo/dados-epidemiologicos', autenticar, ORGAO_GOVERNAMENTAL, dadosEpidemiologicos);

// GET /governo/relatorios-avancados -> relatórios avançados do governo
router.get('/governo/relatorios-avancados', autenticar, ORGAO_GOVERNAMENTAL, relatoriosAvancados);

module.exports = router; // exporta o router para ser montado no backend/index.js
