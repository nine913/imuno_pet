const express = require('express'); // Express para criação do Router

// Importa handlers (controllers) do módulo Tutor
const {
  buscarTutores,
  listarTutores,
  editarTutorDados,
  deletarTutor,
  cadastrarTutorPet,
  getTutorAnimais,
  getTutorAlertas
} = require('../controllers/tutorController');

const router = express.Router(); // Router isolado para as rotas de Tutor

// GET /tutores -> busca todos os tutores
router.get('/tutores', buscarTutores);

// GET /listar-tutores -> busca tutores com filtro por termo (?termo=...)
router.get('/listar-tutores', listarTutores);

// PUT /editar-tutor-dados/:id_tutor -> edita dados do tutor
router.put('/editar-tutor-dados/:id_tutor', editarTutorDados);

// DELETE /deletar-tutor/:id_tutor -> exclui o tutor pelo id
router.delete('/deletar-tutor/:id_tutor', deletarTutor);

// POST /cadastrar-tutor-pet -> cadastra tutor e pet juntos
router.post('/cadastrar-tutor-pet', cadastrarTutorPet);

// GET /tutor/animais/:id_usuario -> lista animais do tutor
router.get('/tutor/animais/:id_usuario', getTutorAnimais);

// GET /tutor/alertas/:id_usuario -> lista alertas do tutor
router.get('/tutor/alertas/:id_usuario', getTutorAlertas);

module.exports = router; // exporta o router para ser montado no backend/index.js
