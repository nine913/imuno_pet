const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
const petRoutes = require('./routes/petRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const vacinaRoutes = require('./routes/vacinaRoutes');
const governoRoutes = require('./routes/governoRoutes');
const gestorRoutes = require('./routes/gestorRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', petRoutes);
app.use('/', tutorRoutes);
app.use('/', vacinaRoutes);
app.use('/', governoRoutes);
app.use('/', gestorRoutes);

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

        let id_clinica = null;
        let id_especifico = null;
        let nome_usuario = '';

        if (usuario.perfil === 'VETERINARIO') {
            const [vet] = await db.query('SELECT id_veterinario, id_clinica, nome_completo FROM veterinario WHERE id_usuario = ?', [usuario.id_usuario]);
            if (vet.length > 0) {
                id_clinica = vet[0].id_clinica;
                id_especifico = vet[0].id_veterinario;
                nome_usuario = vet[0].nome_completo;
            }
        } else if (usuario.perfil === 'GESTOR_CLINICA') {
            const [gestor] = await db.query('SELECT id_gestor, id_clinica, nome_completo FROM gestor WHERE id_usuario = ?', [usuario.id_usuario]);
            if (gestor.length > 0) {
                id_clinica = gestor[0].id_clinica;
                id_especifico = gestor[0].id_gestor;
                nome_usuario = gestor[0].nome_completo;
            }
        } else if (usuario.perfil === 'TUTOR') {
            const [tutor] = await db.query('SELECT id_tutor, nome_completo FROM tutor WHERE id_usuario = ?', [usuario.id_usuario]);
            if (tutor.length > 0) {
                id_especifico = tutor[0].id_tutor;
                nome_usuario = tutor[0].nome_completo;
            }
        }

        res.status(200).json({
            mensagem: 'Login efetuado com sucesso',
            perfil: usuario.perfil,
            id_usuario: usuario.id_usuario,
            id_clinica: id_clinica,
            id_especifico: id_especifico,
            nome: nome_usuario
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

app.delete('/deletar-animal/:id_animal', async (req, res) => {
    try {
        const { id_animal } = req.params;
        await db.query('DELETE FROM registro_vacinacao WHERE id_animal = ?', [id_animal]);
        await db.query('DELETE FROM animal WHERE id_animal = ?', [id_animal]);
        res.status(200).json({ mensagem: 'Animal excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir animal' });
    }
});

app.post('/cadastrar-tutor-pet', async (req, res) => {
    try {
        const { 
            nome_completo, cpf, email, senha, telefone, estado, cidade, bairro,
            nome_animal, especie, raca, data_nascimento
        } = req.body;

        const [usuarioExistente] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (usuarioExistente.length > 0) {
            return res.status(400).json({ erro: 'E-mail já cadastrado!' });
        }

        const [cpfExistente] = await db.query('SELECT * FROM tutor WHERE cpf = ?', [cpf]);
        if (cpfExistente.length > 0) {
            return res.status(400).json({ erro: 'CPF já cadastrado!' });
        }

        const [resultUsuario] = await db.query(
            'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "TUTOR")', 
            [email, senha]
        );
        const id_usuario = resultUsuario.insertId;

        const [resultTutor] = await db.query(
            'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro]
        );
        const id_tutor = resultTutor.insertId;

        await db.query(
            'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
            [id_tutor, nome_animal, especie, raca, data_nascimento]
        );

        res.status(201).json({ mensagem: 'Tutor e Pet cadastrados com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar tutor e pet no sistema.' });
    }
});

app.get('/tutor/animais/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        
        const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
        
        if (tutor.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }
        
        const id_tutor = tutor[0].id_tutor;
        
        const [animais] = await db.query(
            'SELECT id_animal, nome, especie, raca, data_nascimento FROM animal WHERE id_tutor = ?', 
            [id_tutor]
        );
        
        res.status(200).json(animais);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar animais do tutor' });
    }
});

app.get('/animais-atrasados', async (req, res) => {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        
        await db.query(`
            UPDATE registro_vacinacao 
            SET status = 'ATRASADA' 
            WHERE data_proxima_dose < ? AND status = 'PENDENTE'
        `, [hoje]);

        const [atrasados] = await db.query(`
            SELECT rv.id_registro, v.nome_vacina, rv.data_proxima_dose, 
                   a.nome as nome_animal, a.especie, t.nome_completo as nome_tutor, t.telefone
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            WHERE rv.status = 'ATRASADA'
            ORDER BY rv.data_proxima_dose ASC
        `);
        res.status(200).json(atrasados);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar vacinas atrasadas' });
    }
});

app.get('/tutor/alertas/:id_usuario', async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
        
        if (tutor.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }
        const id_tutor = tutor[0].id_tutor;
        const hoje = new Date().toISOString().split('T')[0];
        
        await db.query(`
            UPDATE registro_vacinacao 
            SET status = 'ATRASADA' 
            WHERE data_proxima_dose < ? AND status = 'PENDENTE'
        `, [hoje]);

        const [alertas] = await db.query(`
            SELECT v.nome_vacina, rv.data_proxima_dose, rv.status, a.nome as nome_animal
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            JOIN animal a ON rv.id_animal = a.id_animal
            WHERE a.id_tutor = ? AND rv.status IN ('PENDENTE', 'ATRASADA')
            ORDER BY rv.data_proxima_dose ASC
        `, [id_tutor]);
        res.status(200).json(alertas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar alertas' });
    }
});

app.get('/veterinarios', async (req, res) => {
    try {
        const [veterinarios] = await db.query(`
            SELECT id_veterinario, nome_completo 
            FROM veterinario
        `);
        res.status(200).json(veterinarios);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar veterinarios' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
});
