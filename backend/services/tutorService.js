const db = require('../db'); // Pool de conexão com MySQL (promises)
const bcrypt = require('bcrypt'); // Hash de senha

// Busca tutores (mínimo de campos)
async function buscarTutores() {
  const [tutores] = await db.query('SELECT id_usuario, nome_completo, cpf FROM tutor');
  return tutores;
}

// Lista tutores com busca por termo (nome/cpf/email)
async function listarTutores(queryParams) {
  const termo = queryParams.termo ? `%${queryParams.termo}%` : '%';
  const id_clinica = queryParams.id_clinica;

  let sql = `
    SELECT DISTINCT t.id_tutor, t.id_usuario, t.nome_completo, t.cpf, t.telefone, t.estado, t.cidade, t.bairro, u.email
    FROM tutor t
    JOIN usuario u ON t.id_usuario = u.id_usuario
  `;
  
  const params = [termo, termo, termo];

  if (id_clinica && id_clinica !== 'undefined') {
    sql += `
      JOIN animal a ON t.id_tutor = a.id_tutor
      JOIN registro_vacinacao rv ON a.id_animal = rv.id_animal
      WHERE (t.nome_completo LIKE ? OR t.cpf LIKE ? OR u.email LIKE ?)
      AND rv.id_clinica = ?
    `;
    params.push(id_clinica);
  } else {
    sql += ` WHERE (t.nome_completo LIKE ? OR t.cpf LIKE ? OR u.email LIKE ?)`;
  }

  sql += ` ORDER BY t.nome_completo ASC`;

  const [tutores] = await db.query(sql, params);
  return tutores;
}

// Edita dados do tutor
async function editarTutorDados(id_tutor, dados) {
  const { nome_completo, telefone, estado, cidade, bairro } = dados;

  await db.query(`
    UPDATE tutor SET nome_completo = ?, telefone = ?, estado = ?, cidade = ?, bairro = ? WHERE id_tutor = ?
  `, [nome_completo, telefone, estado, cidade, bairro, id_tutor]);
}

// Deleta tutor caso não exista animal vinculado
async function deletarTutor(id_tutor) {
  // Verifica se existem animais associados ao tutor
  const [animais] = await db.query('SELECT COUNT(*) AS total FROM animal WHERE id_tutor = ?', [id_tutor]);

  // Se houver animais, impede exclusão
  if (animais[0].total > 0) {
    const error = new Error('Não é possível excluir. Este tutor possui animais vinculados.');
    error.status = 400;
    throw error;
  }

  // Busca id_usuario para deletar a conta em usuario
  const [tutor] = await db.query('SELECT id_usuario FROM tutor WHERE id_tutor = ?', [id_tutor]);
  if (tutor.length === 0) {
    const error = new Error('Tutor não encontrado');
    error.status = 404;
    throw error;
  }

  const id_usuario = tutor[0].id_usuario;

  // Deleta tutor e depois a entrada em usuario
  await db.query('DELETE FROM tutor WHERE id_tutor = ?', [id_tutor]);
  await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario]);
}

// Cadastra tutor e pet (cria usuário, cria tutor e cria animal)
async function cadastrarTutorPet(data) {
  const {
    nome_completo,
    cpf,
    email,
    senha,
    telefone,
    estado,
    cidade,
    bairro,
    nome_animal,
    especie,
    raca,
    data_nascimento
  } = data;

  // Valida email único
  const [usuarioExistente] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (usuarioExistente.length > 0) {
    const error = new Error('E-mail já cadastrado!');
    error.status = 400;
    throw error;
  }

  // Valida CPF único
  const [cpfExistente] = await db.query('SELECT * FROM tutor WHERE cpf = ?', [cpf]);
  if (cpfExistente.length > 0) {
    const error = new Error('CPF já cadastrado!');
    error.status = 400;
    throw error;
  }

  // Hash da senha e criação do usuário (perfil TUTOR)
  const hashSenha = await bcrypt.hash(senha, 10);
  const [resultUsuario] = await db.query(
    'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "TUTOR")',
    [email, hashSenha]
  );

  const id_usuario = resultUsuario.insertId;

  // Cria o tutor vinculado ao usuário
  const [resultTutor] = await db.query(
    'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro]
  );

  const id_tutor = resultTutor.insertId;

  // Cria o animal vinculado ao tutor
  await db.query(
    'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
    [id_tutor, nome_animal, especie, raca, data_nascimento]
  );
}

// Retorna animais de um tutor via id_usuario
async function getTutorAnimais(id_usuario) {
  // Recupera id_tutor a partir do id_usuario
  const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
  if (tutor.length === 0) {
    const error = new Error('Tutor não encontrado');
    error.status = 404;
    throw error;
  }

  const id_tutor = tutor[0].id_tutor;

  // Busca animais do tutor
  const [animais] = await db.query(
    'SELECT id_animal, nome, especie, raca, data_nascimento FROM animal WHERE id_tutor = ?',
    [id_tutor]
  );

  return animais;
}

// Gera alertas de vacina atrasada para o tutor
async function getTutorAlertas(id_usuario) {
  // Recupera id_tutor a partir do id_usuario
  const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
  if (tutor.length === 0) {
    const error = new Error('Tutor não encontrado');
    error.status = 404;
    throw error;
  }

  const id_tutor = tutor[0].id_tutor;

  // Data de hoje (YYYY-MM-DD)
  const hoje = new Date().toISOString().split('T')[0];

  // Atualiza registros pendentes para 'ATRASADA' quando passou a data_proxima_dose
  await db.query(`
    UPDATE registro_vacinacao 
    SET status = 'ATRASADA' 
    WHERE data_proxima_dose < ? AND status = 'PENDENTE'
  `, [hoje]);

  // Busca alertas de PENDENTE/ATRASADA
  const [alertas] = await db.query(`
    SELECT v.nome_vacina, rv.data_proxima_dose, rv.status, a.nome as nome_animal
    FROM registro_vacinacao rv
    JOIN vacina v ON rv.id_vacina = v.id_vacina
    JOIN animal a ON rv.id_animal = a.id_animal
    WHERE a.id_tutor = ? AND rv.status IN ('PENDENTE', 'ATRASADA')
    ORDER BY rv.data_proxima_dose ASC
  `, [id_tutor]);

  return alertas;
}

module.exports = {
  buscarTutores,
  listarTutores,
  editarTutorDados,
  deletarTutor,
  cadastrarTutorPet,
  getTutorAnimais,
  getTutorAlertas
};
