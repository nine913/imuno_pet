const express = require('express');
const {
  buscarTutores,
  listarTutores,
  editarTutorDados,
  deletarTutor,
  cadastrarTutorPet,
  getTutorAnimais,
  getTutorAlertas
} = require('../controllers/tutorController');

const router = express.Router();

router.get('/tutores', buscarTutores);
router.get('/listar-tutores', listarTutores);
router.put('/editar-tutor-dados/:id_tutor', editarTutorDados);
router.delete('/deletar-tutor/:id_tutor', deletarTutor);
router.post('/cadastrar-tutor-pet', cadastrarTutorPet);
router.get('/tutor/animais/:id_usuario', getTutorAnimais);
router.get('/tutor/alertas/:id_usuario', getTutorAlertas);

module.exports = router;
