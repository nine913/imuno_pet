const express = require('express'); // Express para criação do Router

// Importa handlers (controllers) do módulo Tutor
const {
  buscarTutores,
  listarTutores,
  editarTutorDados,
  deletarTutor,
  getTutorAnimais,
  getTutorAlertas
} = require('../controllers/tutorController');

const { autenticar, autorizar, exigirProprioUsuario, forcarClinicaDoUsuario } = require('../middleware/auth');

const router = express.Router(); // Router isolado para as rotas de Tutor

const EQUIPE_CLINICA = autorizar('VETERINARIO', 'GESTOR_CLINICA', 'ADMINISTRADOR');

// GET /tutores -> busca todos os tutores (equipe da clínica)
router.get('/tutores', autenticar, EQUIPE_CLINICA, buscarTutores);

// GET /listar-tutores -> busca tutores com filtro por termo (?termo=...)
router.get('/listar-tutores', autenticar, EQUIPE_CLINICA, forcarClinicaDoUsuario, listarTutores);

// PUT /editar-tutor-dados/:id_tutor -> edita dados do tutor
router.put('/editar-tutor-dados/:id_tutor', autenticar, EQUIPE_CLINICA, editarTutorDados);

// DELETE /deletar-tutor/:id_tutor -> exclui o tutor pelo id
router.delete('/deletar-tutor/:id_tutor', autenticar, EQUIPE_CLINICA, deletarTutor);

// GET /tutor/animais/:id_usuario -> lista animais do tutor (somente o próprio tutor, ou admin)
router.get('/tutor/animais/:id_usuario', autenticar, autorizar('TUTOR', 'ADMINISTRADOR'), exigirProprioUsuario(), getTutorAnimais);

// GET /tutor/alertas/:id_usuario -> lista alertas do tutor (somente o próprio tutor, ou admin)
router.get('/tutor/alertas/:id_usuario', autenticar, autorizar('TUTOR', 'ADMINISTRADOR'), exigirProprioUsuario(), getTutorAlertas);

module.exports = router; // exporta o router para ser montado no backend/index.js
