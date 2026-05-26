const express = require('express');
const {
  dadosEpidemiologicos,
  relatoriosAvancados
} = require('../controllers/governoController');

const router = express.Router();

router.get('/governo/dados-epidemiologicos', dadosEpidemiologicos);
router.get('/governo/relatorios-avancados', relatoriosAvancados);

module.exports = router;
