const mysql = require('mysql2');
const dotenv = require('dotenv');

// Carrega variáveis do arquivo .env (DB_HOST, DB_USER, etc.)
dotenv.config();

// Cria um "pool" de conexões para reutilizar conexões ao banco
// (evita abrir/fechar conexão a cada requisição)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Aguarda uma conexão disponível quando o pool estiver ocupado
  waitForConnections: true,

  // Limite máximo de conexões simultâneas
  connectionLimit: 10,

  // 0 = sem limite explícito para filas (requests aguardam conexão)
  queueLimit: 0
});

// Converte o pool para usar API com Promises (async/await)
const promisePool = pool.promise();

// Exporta o pool prometizado para ser usado nas queries
module.exports = promisePool;
