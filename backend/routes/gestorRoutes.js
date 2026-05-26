const express = require('express');
const {
  dadosDashboard,
  relatoriosAvancados,
  veterinariosLista,
  cadastrarVet,
  editarVet,
  deletarVet
} = require('../controllers/gestorController');

const router = express.Router();

router.get('/gestor/dados-dashboard', dadosDashboard);
router.get('/gestor/relatorios-avancados', relatoriosAvancados);
router.get('/gestor/veterinarios-lista', veterinariosLista);
router.post('/gestor/cadastrar-vet', cadastrarVet);
router.put('/gestor/editar-vet/:id_veterinario', editarVet);
router.delete('/gestor/deletar-vet/:id_veterinario', deletarVet);

module.exports = router;
