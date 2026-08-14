const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

// Limita tentativas de login/cadastro para dificultar força bruta.
const limiteAutenticacao = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' }
});

// Limita solicitações de redefinição de senha (evita spam de e-mails / enumeração de contas).
const limiteRedefinirSenha = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas tentativas. Tente novamente mais tarde.' }
});

router.post('/login', limiteAutenticacao, authController.login);
router.post('/logout', autenticar, authController.logout);
router.post('/cadastro', limiteAutenticacao, authController.cadastro);

// Fluxo de redefinição de senha em 2 passos: solicitar (recebe link por e-mail) -> confirmar (com o token do link).
router.post('/solicitar-redefinicao-senha', limiteRedefinirSenha, authController.solicitarRedefinicaoSenha);
router.post('/confirmar-redefinicao-senha', limiteRedefinirSenha, authController.confirmarRedefinicaoSenha);

module.exports = router;
