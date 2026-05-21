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
        const termo = req.query.termo ? `%${req.query.termo}%` : '%';
        const vacina = req.query.vacina ? `%${req.query.vacina}%` : '';
        const status = req.query.status || '';

        let query = `
            SELECT DISTINCT a.id_animal, a.nome as nome_animal, a.especie, a.raca, t.nome_completo as nome_tutor, t.cpf
            FROM animal a
            JOIN tutor t ON a.id_tutor = t.id_tutor
            LEFT JOIN registro_vacinacao rv ON a.id_animal = rv.id_animal
            LEFT JOIN vacina v ON rv.id_vacina = v.id_vacina
            WHERE (a.nome LIKE ? OR t.cpf LIKE ? OR t.nome_completo LIKE ?)
        `;
        const params = [termo, termo, termo];

        if (vacina) {
            query += ` AND v.nome_vacina LIKE ?`;
            params.push(vacina);
        }
        
        if (status) {
            query += ` AND rv.status = ?`;
            params.push(status);
        }

        const [animais] = await db.query(query, params);
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

app.get('/listar-tutores', async (req, res) => {
    try {
        const termo = req.query.termo || '';
        const busca = `%${termo}%`;
        const [tutores] = await db.query(`
            SELECT t.id_tutor, t.id_usuario, t.nome_completo, t.cpf, t.telefone, t.estado, t.cidade, t.bairro, u.email
            FROM tutor t
            JOIN usuario u ON t.id_usuario = u.id_usuario
            WHERE t.nome_completo LIKE ? OR t.cpf LIKE ? OR u.email LIKE ?
        `, [busca, busca, busca]);
        res.status(200).json(tutores);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar tutores' });
    }
});

app.put('/editar-tutor-dados/:id_tutor', async (req, res) => {
    try {
        const { id_tutor } = req.params;
        const { nome_completo, telefone, estado, cidade, bairro } = req.body;
        
        await db.query(`
            UPDATE tutor SET nome_completo = ?, telefone = ?, estado = ?, cidade = ?, bairro = ? WHERE id_tutor = ?
        `, [nome_completo, telefone, estado, cidade, bairro, id_tutor]);
        
        res.status(200).json({ mensagem: 'Dados do tutor atualizados com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar tutor' });
    }
});

app.delete('/deletar-tutor/:id_tutor', async (req, res) => {
    try {
        const { id_tutor } = req.params;
        
        const [animais] = await db.query('SELECT COUNT(*) AS total FROM animal WHERE id_tutor = ?', [id_tutor]);
        
        if (animais[0].total > 0) {
            return res.status(400).json({ erro: 'Não é possível excluir. Este tutor possui animais vinculados.' });
        }

        const [tutor] = await db.query('SELECT id_usuario FROM tutor WHERE id_tutor = ?', [id_tutor]);
        
        if (tutor.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }
        
        const id_usuario = tutor[0].id_usuario;

        await db.query('DELETE FROM tutor WHERE id_tutor = ?', [id_tutor]);
        await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);

        res.status(200).json({ mensagem: 'Tutor excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir tutor' });
    }
});

app.get('/vacinas', async (req, res) => {
    try {
        const termo = req.query.termo ? `%${req.query.termo}%` : '%';
        const [vacinas] = await db.query(`
            SELECT id_vacina, nome_vacina, doencas_prevenidas, fabricante, intervalo_dose_dias 
            FROM vacina 
            WHERE nome_vacina LIKE ? OR doencas_prevenidas LIKE ? OR fabricante LIKE ?
        `, [termo, termo, termo]);
        res.status(200).json(vacinas);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar vacinas' });
    }
});

app.put('/editar-vacina/:id_vacina', async (req, res) => {
    try {
        const { id_vacina } = req.params;
        const { nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias } = req.body;
        await db.query(
            'UPDATE vacina SET nome_vacina = ?, doencas_prevenidas = ?, fabricante = ?, intervalo_doses_dias = ? WHERE id_vacina = ?',
            [nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias, id_vacina]
        );
        res.status(200).json({ mensagem: 'Vacina atualizada com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar vacina' });
    }
});

app.delete('/deletar-vacina/:id_vacina', async (req, res) => {
    try {
        const { id_vacina } = req.params;
        await db.query('DELETE FROM registro_vacinacao WHERE id_vacina = ?', [id_vacina]);
        await db.query('DELETE FROM vacina WHERE id_vacina = ?', [id_vacina]);
        res.status(200).json({ mensagem: 'Vacina excluída com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir vacina' });
    }
});

app.get('/historico-pet/:id_animal', async (req, res) => {
    try {
        const { id_animal } = req.params;
        const termo = req.query.termo ? `%${req.query.termo}%` : '%';
        const status = req.query.status || '';

        let query = `
            SELECT rv.id_registro, v.nome_vacina, v.doencas_prevenidas, rv.data_aplicacao, rv.data_proxima_dose, rv.status
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            WHERE rv.id_animal = ? AND v.nome_vacina LIKE ?
        `;
        const params = [id_animal, termo];

        if (status) {
            query += ` AND rv.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY rv.data_aplicacao DESC`;

        const [historico] = await db.query(query, params);
        res.status(200).json(historico);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar histórico' });
    }
});


app.delete('/deletar-registro-vacina/:id_registro', async (req, res) => {
    try {
        const { id_registro } = req.params;
        await db.query('DELETE FROM registro_vacinacao WHERE id_registro = ?', [id_registro]);
        res.status(200).json({ mensagem: 'Registro de vacina excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir registro de vacina' });
    }
});

app.get('/relatorio-vacinas', async (req, res) => {
    try {
        const dataInicio = req.query.inicio || '2000-01-01';
        const dataFim = req.query.fim || '2100-12-31';
        const status = req.query.status || '';
        const especie = req.query.especie || '';

        let query = `
            SELECT v.nome_vacina, rv.data_aplicacao, rv.data_proxima_dose, rv.status, 
                   a.nome as nome_animal, a.especie, t.nome_completo as nome_tutor, t.telefone
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?)
        `;
        
        const params = [dataInicio, dataFim, dataInicio, dataFim];

        if (status) {
            query += ` AND rv.status = ?`;
            params.push(status);
        }
        
        if (especie) {
            query += ` AND a.especie = ?`;
            params.push(especie);
        }

        query += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;

        const [relatorio] = await db.query(query, params);
        res.status(200).json(relatorio);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao gerar relatório detalhado' });
    }
});

app.put('/editar-registro-vacina/:id_registro', async (req, res) => {
    try {
        const { id_registro } = req.params;
        const { id_vacina, status, data_aplicacao, data_proxima_dose } = req.body;
        
        await db.query(`
            UPDATE registro_vacinacao 
            SET id_vacina = ?, status = ?, data_aplicacao = ?, data_proxima_dose = ? 
            WHERE id_registro = ?
        `, [id_vacina, status, data_aplicacao, data_proxima_dose, id_registro]);
        
        res.status(200).json({ mensagem: 'Registro de vacina atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar registro de vacina' });
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
});