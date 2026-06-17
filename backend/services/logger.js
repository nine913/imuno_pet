const db = require('../db');

async function registrarLog(id_usuario, acao, detalhes) {
  try {
    await db.query(
      'INSERT INTO log_auditoria (id_usuario, acao, detalhes) VALUES (?, ?, ?)',
      [id_usuario, acao, detalhes]
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports = { registrarLog };