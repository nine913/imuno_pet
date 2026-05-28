const express = require('express'); // Express para criação do Router

// Importa handlers (controllers) do módulo Gestor
const {
  dadosDashboard,
  relatoriosAvancados,
  veterinariosLista,
  cadastrarVet,
  editarVet,
  deletarVet
} = require('../controllers/gestorController');

const router = express.Router(); // Router isolado para as rotas de Gestor

// GET /gestor/dados-dashboard -> dados para o dashboard do gestor
router.get('/gestor/dados-dashboard', dadosDashboard);

// GET /gestor/relatorios-avancados -> relatório avançado
router.get('/gestor/relatorios-avancados', relatoriosAvancados);

// GET /gestor/veterinarios-lista -> lista veterinários
router.get('/gestor/veterinarios-lista', veterinariosLista);

// POST /gestor/cadastrar-vet -> cadastra veterinário
router.post('/gestor/cadastrar-vet', cadastrarVet);

// PUT /gestor/editar-vet/:id_veterinario -> edita veterinário por id
router.put('/gestor/editar-vet/:id_veterinario', editarVet);

// DELETE /gestor/deletar-vet/:id_veterinario -> remove veterinário por id
router.delete('/gestor/deletar-vet/:id_veterinario', deletarVet);

module.exports = router; // exporta o router para ser montado no backend/index.js
