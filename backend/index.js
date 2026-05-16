const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    res.status(200).json({
      mensagem: 'Login efetuado com sucesso',
      perfil: usuario.perfil,
      id_usuario: usuario.id_usuario
    });

  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.post('/cadastro', async (req, res) => {
  try {
    const { nome_completo, email, senha, cpf, telefone, estado, cidade, bairro } = req.body;

    const [usuariosExistentes] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuariosExistentes.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }

    const [tutoresExistentes] = await db.query('SELECT * FROM tutor WHERE cpf = ?', [cpf]);
    if (tutoresExistentes.length > 0) {
      return res.status(400).json({ erro: 'CPF já cadastrado' });
    }

    const hashSenha = await bcrypt.hash(senha, 10);

    const [resultadoUsuario] = await db.query(
      'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, ?)',
      [email, hashSenha, 'TUTOR']
    );

    const idUsuario = resultadoUsuario.insertId;

    await db.query(
      'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [idUsuario, nome_completo, cpf, telefone, estado, cidade, bairro]
    );

    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.get('/meus-pets/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;

    const [pets] = await db.query(
      `SELECT a.id_animal, a.nome, a.especie, a.raca, a.data_nascimento 
       FROM animal a
       JOIN tutor t ON a.id_tutor = t.id_tutor
       WHERE t.id_usuario = ?`,
      [id_usuario]
    );

app.get('/vacinas-pet/:id_animal', async (req, res) => {
  try {
    const { id_animal } = req.params;

    const [vacinas] = await db.query(
      `SELECT v.nome_vacina, v.doencas_prevenidas, rv.data_aplicacao, rv.data_proxima_dose, rv.status 
       FROM registro_vacinacao rv
       JOIN vacina v ON rv.id_vacina = v.id_vacina
       WHERE rv.id_animal = ?`,
      [id_animal]
    );

    res.status(200).json(vacinas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});