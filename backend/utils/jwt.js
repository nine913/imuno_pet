const jwt = require('jsonwebtoken');

const SEGREDO = process.env.JWT_SECRET;
const EXPIRA_EM = process.env.JWT_EXPIRES_IN || '8h';

if (!SEGREDO) {
  throw new Error('JWT_SECRET não configurado. Defina essa variável no .env antes de iniciar o servidor.');
}

function gerarToken(usuario) {
  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      perfil: usuario.perfil,
      id_clinica: usuario.id_clinica ?? null,
      id_especifico: usuario.id_especifico ?? null,
      nome: usuario.nome ?? null
    },
    SEGREDO,
    { expiresIn: EXPIRA_EM }
  );
}

function verificarToken(token) {
  return jwt.verify(token, SEGREDO);
}

module.exports = { gerarToken, verificarToken };
