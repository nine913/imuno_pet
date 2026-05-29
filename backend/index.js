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

// Middleware para permitir CORS
app.use(cors());

// Converte body JSON para req.body
app.use(express.json());

// Montagem das rotas baseadas em router (todas sob '/')
app.use('/', petRoutes);
app.use('/', tutorRoutes);
app.use('/', vacinaRoutes);
app.use('/', governoRoutes);
app.use('/', gestorRoutes);

// ========================
// Autenticação e cadastro
// ========================
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
            const [vet] = await db.query(
                'SELECT v.id_veterinario, v.id_clinica, v.nome_completo, c.status FROM veterinario v JOIN clinica c ON v.id_clinica = c.id_clinica WHERE v.id_usuario = ?',
                [usuario.id_usuario]
            );
            if (vet.length > 0) {
                if (vet[0].status === 'INATIVA') {
                    return res.status(403).json({ erro: 'Acesso bloqueado: Sua clínica está inativa no sistema.' });
                }
                id_clinica = vet[0].id_clinica;
                id_especifico = vet[0].id_veterinario;
                nome_usuario = vet[0].nome_completo;
            }
        } else if (usuario.perfil === 'GESTOR_CLINICA') {
            const [gestor] = await db.query(
                'SELECT g.id_gestor, g.id_clinica, g.nome_completo, c.status FROM gestor g JOIN clinica c ON g.id_clinica = c.id_clinica WHERE g.id_usuario = ?',
                [usuario.id_usuario]
            );
            if (gestor.length > 0) {
                if (gestor[0].status === 'INATIVA') {
                    return res.status(403).json({ erro: 'Acesso bloqueado: Sua clínica está inativa no sistema.' });
                }
                id_clinica = gestor[0].id_clinica;
                id_especifico = gestor[0].id_gestor;
                nome_usuario = gestor[0].nome_completo;
            }
        } else if (usuario.perfil === 'TUTOR') {
            const [tutor] = await db.query(
                'SELECT id_tutor, nome_completo FROM tutor WHERE id_usuario = ?',
                [usuario.id_usuario]
            );
            if (tutor.length > 0) {
                id_especifico = tutor[0].id_tutor;
                nome_usuario = tutor[0].nome_completo;
            }
        } else if (usuario.perfil === 'GOVERNO') {
            const [gov] = await db.query(
                'SELECT id_orgao, nome_instituicao FROM orgao_governamental WHERE id_usuario = ?',
                [usuario.id_usuario]
            );
            if (gov.length > 0) {
                id_especifico = gov[0].id_orgao;
                nome_usuario = gov[0].nome_instituicao;
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
    // Dados enviados no body
    const { nome_completo, email, senha, cpf, telefone, estado, cidade, bairro } = req.body;

    // Valida duplicidade de email
    const [usuariosExistentes] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (usuariosExistentes.length > 0) {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }

    // Valida duplicidade de CPF para tutor
    const [tutoresExistentes] = await db.query('SELECT * FROM tutor WHERE cpf = ?', [cpf]);
    if (tutoresExistentes.length > 0) {
      return res.status(400).json({ erro: 'CPF já cadastrado' });
    }

    // Gera hash da senha antes de salvar no banco
    const hashSenha = await bcrypt.hash(senha, 10);

    // Cria usuário no banco com perfil fixo 'TUTOR'
    const [resultadoUsuario] = await db.query(
      'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, ?)',
      [email, hashSenha, 'TUTOR']
    );

    // id do usuário recém-criado (FK para tabela tutor)
    const idUsuario = resultadoUsuario.insertId;

    // Cria registro do tutor relacionado ao usuário
    await db.query(
      'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [idUsuario, nome_completo, cpf, telefone, estado, cidade, bairro]
    );

    res.status(201).json({ mensagem: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

app.put('/redefinir-senha', async (req, res) => {
    try {
        const { email, nova_senha } = req.body;

        if (!email || !nova_senha) {
            return res.status(400).json({ erro: 'E-mail e nova senha são obrigatórios.' });
        }

        const [usuario] = await db.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);

        if (usuario.length === 0) {
            return res.status(404).json({ erro: 'E-mail não encontrado no sistema.' });
        }

        const hashNovaSenha = await bcrypt.hash(nova_senha, 10);

        await db.query('UPDATE usuario SET senha = ? WHERE email = ?', [hashNovaSenha, email]);

        res.status(200).json({ mensagem: 'Senha redefinida com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno do servidor ao redefinir senha.' });
    }
});

app.delete('/deletar-animal/:id_animal', async (req, res) => {
    try {
        // id_animal vem da URL (params)
        const { id_animal } = req.params;

        // Remove dependentes primeiro (registro_vacinacao) para evitar inconsistência
        await db.query('DELETE FROM registro_vacinacao WHERE id_animal = ?', [id_animal]);

        // Depois remove o animal em si
        await db.query('DELETE FROM animal WHERE id_animal = ?', [id_animal]);

        res.status(200).json({ mensagem: 'Animal excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao excluir animal' });
    }
});

app.post('/cadastrar-tutor-pet', async (req, res) => {
    try {
        // Dados enviados no body do POST
        const { 
            nome_completo, cpf, email, senha, telefone, estado, cidade, bairro,
            nome_animal, especie, raca, data_nascimento
        } = req.body;

        // Valida se email já está cadastrado
        const [usuarioExistente] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
        if (usuarioExistente.length > 0) {
            return res.status(400).json({ erro: 'E-mail já cadastrado!' });
        }

        // Valida se CPF já está cadastrado para tutor
        const [cpfExistente] = await db.query('SELECT * FROM tutor WHERE cpf = ?', [cpf]);
        if (cpfExistente.length > 0) {
            return res.status(400).json({ erro: 'CPF já cadastrado!' });
        }

        // Cria usuário com perfil "TUTOR"
        const [resultUsuario] = await db.query(
            'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "TUTOR")', 
            [email, senha]
        );
        const id_usuario = resultUsuario.insertId;

        // Cria tutor associado ao usuário
        const [resultTutor] = await db.query(
            'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro]
        );
        const id_tutor = resultTutor.insertId;

        // Cria animal associado ao tutor
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
        // id_usuario vem da URL (params)
        const { id_usuario } = req.params;
        
        // Busca o id_tutor equivalente para o id_usuario
        const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
        
        // Se não existir tutor para o usuário, retorna 404
        if (tutor.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }
        
        const id_tutor = tutor[0].id_tutor;
        
        // Busca pets (animais) relacionados ao id_tutor
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
        const { id_clinica } = req.query;
        
        // Data de hoje em formato YYYY-MM-DD (usado no UPDATE/SELECT)
        const hoje = new Date().toISOString().split('T')[0];

        // Atualiza registros pendentes que já passaram do prazo para "ATRASADA"
        await db.query(`
            UPDATE registro_vacinacao 
            SET status = 'ATRASADA' 
            WHERE data_proxima_dose < ? AND status = 'PENDENTE'
        `, [hoje]);

        let query = `
            SELECT rv.id_registro, v.nome_vacina, rv.data_proxima_dose, 
                   a.nome as nome_animal, a.especie, t.nome_completo as nome_tutor, t.telefone
            FROM registro_vacinacao rv
            JOIN vacina v ON rv.id_vacina = v.id_vacina
            JOIN animal a ON rv.id_animal = a.id_animal
            JOIN tutor t ON a.id_tutor = t.id_tutor
            WHERE rv.status = 'ATRASADA'
        `;
        let params = [];

        if (id_clinica) {
            query += ` AND rv.id_clinica = ?`;
            params.push(id_clinica);
        }

        query += ` ORDER BY rv.data_proxima_dose ASC`;

        // Consulta lista de atrasados com joins (vacina/animal/tutor)
        const [atrasados] = await db.query(query, params);
        res.status(200).json(atrasados);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar vacinas atrasadas' });
    }
});

app.get('/tutor/alertas/:id_usuario', async (req, res) => {
    try {
        // id_usuario vem da URL
        const { id_usuario } = req.params;

        // Busca o id_tutor para relacionar os alertas aos pets do tutor
        const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
        
        // Se não existir tutor, retorna 404
        if (tutor.length === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado' });
        }

        const id_tutor = tutor[0].id_tutor;

        // Data de hoje para atualização de status
        const hoje = new Date().toISOString().split('T')[0];
        
        // Atualiza pendentes vencidos para "ATRASADA"
        await db.query(`
            UPDATE registro_vacinacao 
            SET status = 'ATRASADA' 
            WHERE data_proxima_dose < ? AND status = 'PENDENTE'
        `, [hoje]);

        // Consulta alertas (pendente + atrasada) apenas dos animais do tutor
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
        const { id_clinica } = req.query;
        let query = `
            SELECT id_veterinario, nome_completo 
            FROM veterinario
        `;
        let params = [];

        if (id_clinica) {
            query += ` WHERE id_clinica = ?`;
            params.push(id_clinica);
        }

        // Lista todos os veterinários (id + nome)
        const [veterinarios] = await db.query(query, params);

        res.status(200).json(veterinarios);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar veterinarios' });
    }
});

app.get('/avisos-ativos', async (req, res) => {
    try {
        const [avisos] = await db.query("SELECT * FROM aviso WHERE status = 'ATIVO' ORDER BY data_criacao DESC");
        res.status(200).json(avisos);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar avisos.' });
    }
});

const adminRoutes = require('./routes/adminRoutes');

app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando perfeitamente na porta ${PORT}`);
});