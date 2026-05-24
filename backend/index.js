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

app.post('/registrar-vacina', async (req, res) => {
    try {
        const { id_animal, id_vacina, data_aplicacao, data_proxima_dose, status, id_veterinario } = req.body;
        
        await db.query(`
            INSERT INTO registro_vacinacao (id_animal, id_vacina, data_aplicacao, data_proxima_dose, status, id_veterinario)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [id_animal, id_vacina, data_aplicacao, data_proxima_dose, status, id_veterinario]);
        
        res.status(201).json({ mensagem: 'Vacina registrada com sucesso' });
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
            SELECT id_vacina, nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias 
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
            SELECT rv.id_registro, v.id_vacina, v.nome_vacina, v.doencas_prevenidas, rv.data_aplicacao, rv.data_proxima_dose, rv.status, rv.id_veterinario
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
        res.status(500).json({ erro: 'Erro ao buscar historico' });
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
                   a.nome as nome_animal, a.especie, a.raca, t.nome_completo as nome_tutor, t.telefone
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
        const { id_vacina, status, data_aplicacao, data_proxima_dose, id_veterinario } = req.body;
        
        await db.query(`
            UPDATE registro_vacinacao 
            SET id_vacina = ?, status = ?, data_aplicacao = ?, data_proxima_dose = ?, id_veterinario = ? 
            WHERE id_registro = ?
        `, [id_vacina, status, data_aplicacao, data_proxima_dose, id_veterinario, id_registro]);
        
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

app.get('/gestor/dados-dashboard', async (req, res) => {
    try {
        const inicio = req.query.inicio || '2000-01-01';
        const fim = req.query.fim || '2100-12-31';
        
        const paramsGeral = [inicio, fim, inicio, fim];
        const condicaoDatas = `(data_aplicacao BETWEEN ? AND ? OR data_proxima_dose BETWEEN ? AND ?)`;

        const queryKpis = `
            SELECT 
                SUM(CASE WHEN status = 'APLICADA' THEN 1 ELSE 0 END) as total_aplicadas,
                SUM(CASE WHEN status = 'ATRASADA' THEN 1 ELSE 0 END) as total_atrasadas,
                SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as total_pendentes,
                COUNT(DISTINCT id_animal) as total_animais
            FROM registro_vacinacao
            WHERE ${condicaoDatas}
        `;
        const [kpis] = await db.query(queryKpis, paramsGeral);

        const paramsAplicadas = [inicio, fim];
        const condicaoAplicadas = `rv.status = 'APLICADA' AND rv.data_aplicacao BETWEEN ? AND ?`;

        const queryTopVacinas = `
            SELECT v.nome_vacina, COUNT(rv.id_registro) as quantidade
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            WHERE ${condicaoAplicadas}
            GROUP BY v.id_vacina, v.nome_vacina
            ORDER BY quantidade DESC
            LIMIT 5
        `;
        const [vacinasAplicadas] = await db.query(queryTopVacinas, paramsAplicadas);

        const queryEvolucao = `
            SELECT DATE_FORMAT(data_aplicacao, '%Y-%m') as mes, COUNT(id_registro) as quantidade
            FROM registro_vacinacao rv
            WHERE ${condicaoAplicadas}
            GROUP BY mes
            ORDER BY mes ASC
            LIMIT 6
        `;
        const [atendimentosMes] = await db.query(queryEvolucao, paramsAplicadas);

        const queryVets = `
            SELECT vet.nome_completo, COUNT(rv.id_registro) as quantidade
            FROM registro_vacinacao rv
            JOIN veterinario vet ON rv.id_veterinario = vet.id_veterinario
            WHERE ${condicaoAplicadas}
            GROUP BY vet.id_veterinario, vet.nome_completo
            ORDER BY quantidade DESC
        `;
        const [aplicacoesVet] = await db.query(queryVets, paramsAplicadas);

        res.status(200).json({
            kpis: kpis[0],
            vacinasAplicadas,
            atendimentosMes,
            aplicacoesVet
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar dados do gestor' });
    }
});

app.get('/gestor/relatorios-avancados', async (req, res) => {
    try {
        const dataInicio = req.query.inicio || '2000-01-01';
        const dataFim = req.query.fim || '2100-12-31';
        const id_vacina = req.query.vacina || '';
        const especie = req.query.especie || '';
        const bairro = req.query.bairro || '';
        const status = req.query.status || '';
        const aplicante = req.query.aplicante || '';

        let query = `
            SELECT rv.data_aplicacao, rv.data_proxima_dose, rv.status, v.nome_vacina, 
                   a.nome as nome_animal, a.especie, a.raca, 
                   t.nome_completo as nome_tutor, t.bairro, t.cidade, t.telefone,
                   vet.nome_completo as nome_vet, vet.crmv as crmv_vet
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            LEFT JOIN veterinario vet ON rv.id_veterinario = vet.id_veterinario
            WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?)
        `;
        const params = [dataInicio, dataFim, dataInicio, dataFim];

        if (id_vacina) {
            query += ` AND rv.id_vacina = ?`;
            params.push(id_vacina);
        }
        if (especie) {
            query += ` AND a.especie = ?`;
            params.push(especie);
        }
        if (bairro) {
            query += ` AND t.bairro LIKE ?`;
            params.push(`%${bairro}%`);
        }
        if (status) {
            query += ` AND rv.status = ?`;
            params.push(status);
        }
        if (aplicante) {
            query += ` AND rv.id_veterinario = ?`;
            params.push(aplicante);
        }

        query += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;

        const [relatorio] = await db.query(query, params);
        res.status(200).json(relatorio);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao gerar relatorio avancado' });
    }
});

app.get('/governo/dados-epidemiologicos', async (req, res) => {
    try {
        const inicio = req.query.inicio || '2000-01-01';
        const fim = req.query.fim || '2100-12-31';
        const especie = req.query.especie || '';
        const localidade = req.query.localidade || '';

        let paramsRisco = [inicio, fim, inicio, fim];
        let condicaoRisco = `WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?)`;

        if (especie) {
            condicaoRisco += ` AND a.especie = ?`;
            paramsRisco.push(especie);
        }
        if (localidade) {
            condicaoRisco += ` AND (t.cidade LIKE ? OR t.bairro LIKE ?)`;
            paramsRisco.push(`%${localidade}%`, `%${localidade}%`);
        }

        const queryRisco = `
            SELECT t.bairro, t.cidade,
                   SUM(CASE WHEN rv.status = 'APLICADA' THEN 1 ELSE 0 END) as total_aplicadas,
                   SUM(CASE WHEN rv.status = 'ATRASADA' THEN 1 ELSE 0 END) as total_atrasadas,
                   SUM(CASE WHEN rv.status = 'PENDENTE' THEN 1 ELSE 0 END) as total_pendentes
            FROM registro_vacinacao rv
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            ${condicaoRisco}
            GROUP BY t.cidade, t.bairro
            ORDER BY total_atrasadas DESC
        `;
        const [riscoRegiao] = await db.query(queryRisco, paramsRisco);

        let paramsGeral = [inicio, fim];
        let condicaoGeral = `WHERE rv.status = 'APLICADA' AND rv.data_aplicacao BETWEEN ? AND ?`;
        
        if (localidade) {
            condicaoGeral += ` AND (t.cidade LIKE ? OR t.bairro LIKE ?)`;
            paramsGeral.push(`%${localidade}%`, `%${localidade}%`);
        }
        if (especie) {
            condicaoGeral += ` AND a.especie = ?`;
            paramsGeral.push(especie);
        }

        const queryEspecie = `
            SELECT a.especie, COUNT(rv.id_registro) as total_vacinados
            FROM registro_vacinacao rv
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            ${condicaoGeral}
            GROUP BY a.especie
            ORDER BY total_vacinados DESC
        `;
        const [coberturaEspecie] = await db.query(queryEspecie, paramsGeral);

        const queryEvolucao = `
            SELECT DATE_FORMAT(rv.data_aplicacao, '%Y-%m') AS mes, COUNT(rv.id_registro) AS quantidade
            FROM registro_vacinacao rv
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            ${condicaoGeral}
            GROUP BY mes
            ORDER BY mes ASC
        `;
        const [evolucaoTemporal] = await db.query(queryEvolucao, paramsGeral);

        const queryTopVacinas = `
            SELECT v.nome_vacina, COUNT(rv.id_registro) AS quantidade
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            ${condicaoGeral}
            GROUP BY v.id_vacina, v.nome_vacina
            ORDER BY quantidade DESC
            LIMIT 5
        `;
        const [topVacinas] = await db.query(queryTopVacinas, paramsGeral);

        res.status(200).json({ riscoRegiao, coberturaEspecie, evolucaoTemporal, topVacinas });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar dados epidemiologicos' });
    }
});

app.get('/governo/relatorios-avancados', async (req, res) => {
    try {
        const dataInicio = req.query.inicio || '2000-01-01';
        const dataFim = req.query.fim || '2100-12-31';
        const id_vacina = req.query.vacina || '';
        const especie = req.query.especie || '';
        const bairro = req.query.bairro || '';
        const status = req.query.status || '';

        let query = `
            SELECT rv.data_aplicacao, rv.data_proxima_dose, rv.status, v.nome_vacina, 
                   a.nome as nome_animal, a.especie, a.raca, 
                   t.nome_completo as nome_tutor, t.bairro, t.cidade, t.telefone
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?)
        `;
        const params = [dataInicio, dataFim, dataInicio, dataFim];

        if (id_vacina) {
            query += ` AND rv.id_vacina = ?`;
            params.push(id_vacina);
        }
        if (especie) {
            query += ` AND a.especie = ?`;
            params.push(especie);
        }
        if (bairro) {
            query += ` AND t.bairro LIKE ?`;
            params.push(`%${bairro}%`);
        }
        if (status) {
            query += ` AND rv.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;

        const [relatorio] = await db.query(query, params);
        res.status(200).json(relatorio);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao gerar relatorio avancado do governo' });
    }
});

app.get('/gestor/veterinarios', async (req, res) => {
    try {
        const termo = req.query.termo ? `%${req.query.termo}%` : '%';
        const [vets] = await db.query('SELECT * FROM veterinario WHERE nome_completo LIKE ? OR crmv LIKE ?', [termo, termo]);
        res.status(200).json(vets);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao listar veterinários' });
    }
});

app.post('/gestor/cadastrar-vet', async (req, res) => {
    try {
        const { nome_completo, crmv, id_clinica } = req.body;
        await db.query('INSERT INTO veterinario (nome_completo, crmv, id_clinica) VALUES (?, ?, ?)', [nome_completo, crmv, id_clinica]);
        res.status(201).json({ mensagem: 'Veterinário cadastrado!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao cadastrar' });
    }
});

app.delete('/gestor/deletar-vet/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM veterinario WHERE id_veterinario = ?', [req.params.id]);
        res.status(200).json({ mensagem: 'Removido com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
});