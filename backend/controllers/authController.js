const crypto = require('crypto');
const authService = require('../services/authService');
const logger = require('../services/logger');
const { gerarToken } = require('../utils/jwt');
const {
  NOME_COOKIE_TOKEN,
  NOME_COOKIE_CSRF,
  opcoesCookieToken,
  opcoesCookieCsrf
} = require('../utils/cookies');

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const dadosUsuario = await authService.autenticar(email, senha);
    const token = gerarToken(dadosUsuario);
    const csrfToken = crypto.randomBytes(32).toString('hex');

    await logger.registrarLog(dadosUsuario.id_usuario, 'LOGIN', 'Usuário realizou login no sistema.');

    res.cookie(NOME_COOKIE_TOKEN, token, opcoesCookieToken());
    res.cookie(NOME_COOKIE_CSRF, csrfToken, opcoesCookieCsrf());

    res.status(200).json({
      mensagem: 'Login efetuado com sucesso',
      ...dadosUsuario
    });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.status ? error.message : 'Erro interno do servidor' });
  }
}

async function logout(req, res) {
  try {
    await logger.registrarLog(req.user.id_usuario, 'LOGOUT', 'Usuário saiu do sistema.');
    res.clearCookie(NOME_COOKIE_TOKEN, { path: '/' });
    res.clearCookie(NOME_COOKIE_CSRF, { path: '/' });
    res.status(200).json({ mensagem: 'Logout registrado com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar logout.' });
  }
}

async function alterarSenha(req, res) {
  try {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ erro: 'Informe a senha atual e a nova senha.' });
    }
    if (nova_senha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve possuir no mínimo 6 caracteres.' });
    }

    await authService.alterarSenha(req.user.id_usuario, senha_atual, nova_senha);
    await logger.registrarLog(req.user.id_usuario, 'ALTERAR_SENHA', 'Usuário alterou a própria senha.');

    res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.status ? error.message : 'Erro ao alterar a senha.' });
  }
}

async function cadastro(req, res) {
  try {
    const { nome_completo, email, senha, cpf, telefone, estado, cidade, bairro } = req.body;
    if (!nome_completo || !email || !senha || !cpf || !estado || !cidade || !bairro) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve possuir no mínimo 6 caracteres.' });
    }

    const idUsuario = await authService.cadastrarTutorPublico(req.body);
    await logger.registrarLog(idUsuario, 'CADASTRAR_TUTOR', 'Tutor realizou auto-cadastro no sistema.');

    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.status ? error.message : 'Erro interno do servidor' });
  }
}

async function solicitarRedefinicaoSenha(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ erro: 'Informe o e-mail da conta.' });
    }

    await authService.solicitarRedefinicaoSenha(email);

    // Resposta sempre genérica: não revela se o e-mail existe ou não no sistema.
    res.status(200).json({
      mensagem: 'Se este e-mail estiver cadastrado, enviaremos um link de redefinição de senha.'
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar a solicitação.' });
  }
}

async function confirmarRedefinicaoSenha(req, res) {
  try {
    const { token, nova_senha } = req.body;
    if (!nova_senha || nova_senha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha deve possuir no mínimo 6 caracteres.' });
    }

    const idUsuario = await authService.confirmarRedefinicaoSenha(token, nova_senha);
    await logger.registrarLog(idUsuario, 'REDEFINIR_SENHA', 'Senha redefinida via link de e-mail.');

    res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.status ? error.message : 'Erro ao redefinir a senha.' });
  }
}

module.exports = { login, logout, cadastro, alterarSenha, solicitarRedefinicaoSenha, confirmarRedefinicaoSenha };
