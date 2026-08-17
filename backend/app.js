const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const db = require('./db');
const { autenticar, autorizar } = require('./middleware/auth');
const { rotaNaoEncontrada, tratarErro } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const vacinaRoutes = require('./routes/vacinaRoutes');
const governoRoutes = require('./routes/governoRoutes');
const gestorRoutes = require('./routes/gestorRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const origensPermitidas = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

app.use(cors({
  origin(origem, callback) {
    // Requisições sem header Origin (ex.: apps mobile, curl, arquivo HTML aberto localmente) são permitidas.
    if (!origem || origensPermitidas.includes(origem)) {
      return callback(null, true);
    }
    return callback(new Error('Origem não autorizada pelo CORS.'));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/', authRoutes);
app.use('/', petRoutes);
app.use('/', tutorRoutes);
app.use('/', vacinaRoutes);
app.use('/', governoRoutes);
app.use('/', gestorRoutes);
app.use('/admin', adminRoutes);

app.get('/veterinarios', autenticar, autorizar('VETERINARIO', 'GESTOR_CLINICA', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const { id_clinica } = req.query;
    let query = `
            SELECT id_veterinario, nome_completo
            FROM veterinario
        `;
    let params = [];

    if (id_clinica && id_clinica !== 'undefined') {
      query += ` WHERE id_clinica = ?`;
      params.push(id_clinica);
    }

    const [veterinarios] = await db.query(query, params);

    res.status(200).json(veterinarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar veterinarios' });
  }
});

// Avisos são exibidos publicamente (inclusive na tela de login, antes da autenticação).
app.get('/avisos-ativos', async (req, res) => {
  try {
    const [avisos] = await db.query(
      "SELECT * FROM aviso WHERE status = 'ATIVO' ORDER BY data_criacao DESC"
    );
    res.status(200).json(avisos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar avisos.' });
  }
});

app.get('/avisos', async (req, res) => {
  try {
    const [avisos] = await db.query(
      "SELECT * FROM aviso WHERE status = 'ATIVO' ORDER BY data_criacao DESC"
    );
    res.status(200).json(avisos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar avisos' });
  }
});

app.use(rotaNaoEncontrada);
app.use(tratarErro);

module.exports = app;
