const express = require('express'); // Express para criação do Router

// Importa handlers (controllers) do módulo Governo
const {
  dadosEpidemiologicos,
  relatoriosAvancados
} = require('../controllers/governoController');

const router = express.Router(); // Router isolado para as rotas de Governo

// GET /governo/dados-epidemiologicos -> dados epidemiológicos
router.get('/governo/dados-epidemiologicos', dadosEpidemiologicos);

// GET /governo/relatorios-avancados -> relatórios avançados do governo
router.get('/governo/relatorios-avancados', relatoriosAvancados);

module.exports = router; // exporta o router para ser montado no backend/index.js
