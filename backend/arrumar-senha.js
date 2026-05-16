const bcrypt = require('bcrypt');
const db = require('./db');

async function arrumarSenhas() {
    const hash = await bcrypt.hash('a', 10);
    await db.query('UPDATE usuario SET senha = ?', [hash]);
    console.log('Senhas atualizadas com sucesso');
    process.exit();
}

arrumarSenhas();