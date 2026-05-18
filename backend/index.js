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

    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.post('/cadastrar-pet', async (req, res) => {
  try {
    const { id_usuario, nome, especie, raca, data_nascimento } = req.body;

    const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
    
    if (tutor.length === 0) {
      return res.status(404).json({ erro: 'Tutor não encontrado' });
    }

    const id_tutor = tutor[0].id_tutor;

    await db.query(
      'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
      [id_tutor, nome, especie, raca, data_nascimento]
    );

    res.status(201).json({ mensagem: 'Pet cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.get('/buscar-animais', async (req, res) => {
    try {
        const termo = req.query.termo || '';
        const busca = `%${termo}%`;
        const [animais] = await db.query(`
            SELECT a.id_animal, a.nome as nome_animal, a.especie, a.raca, t.nome_completo as nome_tutor, t.cpf
            FROM animal a
            JOIN tutor t ON a.id_tutor = t.id_tutor
            WHERE a.nome LIKE ? OR t.cpf LIKE ? OR t.nome_completo LIKE ?
        `, [busca, busca, busca]);
        res.status(200).json(animais);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar animais' });
    }
});

app.get('/detalhes-animal/:id_animal', async (req, res) => {
    try {
        const { id_animal } = req.params;
        const [dados] = await db.query(`
            SELECT a.id_animal, a.nome as nome_animal, a.especie, a.raca, a.data_nascimento,
                   t.id_tutor, t.nome_completo as nome_tutor, t.telefone, t.estado, t.cidade, t.bairro
            FROM animal a
            JOIN tutor t ON a.id_tutor = t.id_tutor
            WHERE a.id_animal = ?
        `, [id_animal]);

        if (dados.length === 0) {
            return res.status(404).json({ erro: 'Animal não encontrado' });
        }
        res.status(200).json(dados[0]);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar detalhes' });
    }
});

app.put('/editar-pet-tutor/:id_animal', async (req, res) => {
    try {
        const { id_animal } = req.params;
        const { nome_animal, especie, raca, data_nascimento, id_tutor, telefone, estado, city, cidade, bairro } = req.body;

        await db.query(`
            UPDATE animal SET nome = ?, especie = ?, raca = ?, data_nascimento = ? WHERE id_animal = ?
        `, [nome_animal, especie, raca, data_nascimento, id_animal]);

        await db.query(`
            UPDATE tutor SET telefone = ?, estado = ?, cidade = ?, bairro = ? WHERE id_tutor = ?
        `, [telefone, estado, city || cidade, bairro, id_tutor]);

        res.status(200).json({ mensagem: 'Dados updated com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar dados' });
    }
});


app.get('/vacinas-pet/:id_animal', async (req, res) => {
  try {
    const { id_animal } = req.params;

    const [vacinas] = await db.query(
      `SELECT v.nome_vacina, v.doencas_prevenidas, v.intervalo_doses_dias, rv.data_aplicacao, rv.data_proxima_dose, rv.status 
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

app.get('/vacinas', async (req, res) => {
    try {
        const [vacinas] = await db.query('SELECT id_vacina, nome_vacina, doencas_prevenidas, intervalo_doses_dias FROM vacina');
        res.status(200).json(vacinas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar vacinas' });
    }
});

app.post('/registrar-vacina', async (req, res) => {
    try {
        const { id_animal, id_vacina, data_aplicacao, data_proxima_dose, status } = req.body;
        await db.query(`
            INSERT INTO registro_vacinacao (id_animal, id_vacina, data_aplicacao, data_proxima_dose, status)
            VALUES (?, ?, ?, ?, ?)
        `, [id_animal, id_vacina, data_aplicacao || null, data_proxima_dose || null, status]);
        res.status(201).json({ mensagem: 'Registro salvo com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao registrar vacina' });
    }
});

app.post('/cadastrar-vacina', async (req, res) => {
    try {
        const { nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias } = req.body;

        await db.query(
            'INSERT INTO vacina (nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias) VALUES (?, ?, ?, ?)',
            [nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias]
        );
        res.status(201).json({ mensagem: 'Vacina cadastrada com sucesso!' });
    } catch (error) {
        
        res.status(500).json({ erro: 'Erro ao cadastrar vacina' });
    }
});


app.get('/tutores', async (req, res) => {
  try {
    const [tutores] = await db.query('SELECT id_usuario, nome_completo, cpf FROM tutor');
    res.status(200).json(tutores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tutores' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
});