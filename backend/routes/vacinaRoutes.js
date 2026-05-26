const express = require('express');
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

const router = express.Router();

router.post('/registrar-vacina', registrarVacina);
router.post('/cadastrar-vacina', cadastrarVacina);
router.get('/vacinas', buscarVacinas);
router.put('/editar-vacina/:id_vacina', editarVacina);
router.delete('/deletar-vacina/:id_vacina', deletarVacina);
router.get('/historico-pet/:id_animal', historicoPet);
router.delete('/deletar-registro-vacina/:id_registro', deletarRegistroVacina);
router.get('/relatorio-vacinas', relatorioVacinas);
router.put('/editar-registro-vacina/:id_registro', editarRegistroVacina);
router.get('/animais-atrasados', animaisAtrasados);

module.exports = router;
