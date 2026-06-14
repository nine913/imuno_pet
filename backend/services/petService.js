const db = require('../db');
const bcrypt = require('bcrypt');

async function getTutorIdByUsuario(id_usuario) {
  const [tutor] = await db.query(
    'SELECT id_tutor FROM tutor WHERE id_usuario = ?',
    [id_usuario]
  );
  return tutor.length > 0 ? tutor[0].id_tutor : null;
}

async function criarPet(data) {
  const { id_usuario, nome, especie, raca, data_nascimento } = data;

  const id_tutor = await getTutorIdByUsuario(id_usuario);

  if (!id_tutor) {
    const error = new Error('Tutor não encontrado');
    error.status = 404;
    throw error;
  }

  await db.query(
    'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
    [id_tutor, nome, especie, raca, data_nascimento]
  );
}

async function cadastrarAnimalVet(data) {
  const { id_tutor, nome, especie, raca, data_nascimento, porte, fase_vida } = data;
  
  await db.query(
    'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento, porte, fase_vida) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id_tutor, nome, especie, raca || null, data_nascimento, porte, fase_vida]
  );
}

async function cadastrarTutorEPet(dados) {
  const { email, senha, nome_completo, cpf, telefone, estado, cidade, bairro, nome_pet, especie, raca, data_nascimento, porte, fase_vida } = dados;

  const [userExistente] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (userExistente.length > 0) throw new Error('E-mail já cadastrado no sistema.');

  const [cpfExistente] = await db.query('SELECT * FROM tutor WHERE cpf = ?', [cpf]);
  if (cpfExistente.length > 0) throw new Error('CPF já cadastrado em outra conta.');

  const hashSenha = await bcrypt.hash(senha, 10);

  const [resUser] = await db.query(
    'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "TUTOR")',
    [email, hashSenha]
  );
  
  const idUsuario = resUser.insertId;

  const [resTutor] = await db.query(
    'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [idUsuario, nome_completo, cpf, telefone, estado, cidade, bairro]
  );
  
  const idTutor = resTutor.insertId;

  await db.query(
    'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento, porte, fase_vida) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [idTutor, nome_pet, especie, raca || null, data_nascimento, porte, fase_vida]
  );
}

async function buscarAnimais(queryParams) {
  const termo = queryParams.termo ? `%${queryParams.termo}%` : '%';
  const vacina = queryParams.vacina ? `%${queryParams.vacina}%` : '';
  const status = queryParams.status || '';

  let query = `
    SELECT DISTINCT a.id_animal, a.nome, a.especie, a.raca, a.porte, a.fase_vida, t.nome_completo as nome_tutor, t.cpf, a.data_nascimento
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

  query += ` ORDER BY a.nome ASC`;

  const [animais] = await db.query(query, params);
  return animais;
}

async function detalhesAnimal(id_animal) {
  const [dados] = await db.query(`
    SELECT a.id_animal, a.nome as nome_animal, a.especie, a.raca, a.data_nascimento, a.porte, a.fase_vida,
           t.id_tutor, t.nome_completo as nome_tutor, t.telefone, t.estado, t.cidade, t.bairro
    FROM animal a
    JOIN tutor t ON a.id_tutor = t.id_tutor
    WHERE a.id_animal = ?
  `, [id_animal]);

  return dados.length > 0 ? dados[0] : null;
}

async function editarPetTutor(id_animal, dados) {
  const { nome_animal, especie, raca, data_nascimento, porte, fase_vida, id_tutor, telefone, estado, city, cidade, bairro } = dados;

  await db.query(
    `UPDATE animal SET nome = ?, especie = ?, raca = ?, data_nascimento = ?, porte = ?, fase_vida = ? WHERE id_animal = ?`,
    [nome_animal, especie, raca, data_nascimento, porte, fase_vida, id_animal]
  );

  await db.query(
    `UPDATE tutor SET telefone = ?, estado = ?, cidade = ?, bairro = ? WHERE id_tutor = ?`,
    [telefone, estado, city || cidade, bairro, id_tutor]
  );
}

async function editarAnimalSimples(id, dados) {
  const sql = `
    UPDATE animal 
    SET nome = ?, especie = ?, raca = ?, data_nascimento = ?, porte = ?, fase_vida = ? 
    WHERE id_animal = ?
  `;
  await db.query(sql, [dados.nome, dados.especie, dados.raca, dados.data_nascimento, dados.porte, dados.fase_vida, id]);
}

async function deletarAnimal(id_animal) {
  await db.query('DELETE FROM registro_vacinacao WHERE id_animal = ?', [id_animal]);
  await db.query('DELETE FROM animal WHERE id_animal = ?', [id_animal]);
}

async function relatorioVacinasVet(query) {
  const id_clinica = query.id_clinica;
  
  if (!id_clinica || id_clinica === 'undefined') {
    return [];
  }

  const dataInicio = query.inicio || '2000-01-01';
  const dataFim = query.fim || '2100-12-31';
  const especie = query.especie || '';
  const status = query.status || '';

  let sql = `
    SELECT rv.data_aplicacao, rv.data_proxima_dose, rv.status, v.nome_vacina, 
           a.nome as nome_animal, a.especie, a.raca, a.porte, a.fase_vida,
           t.nome_completo as nome_tutor, t.telefone,
           vet.nome_completo as nome_vet, vet.crmv as crmv_vet
    FROM registro_vacinacao rv
    JOIN vacina v ON rv.id_vacina = v.id_vacina
    JOIN animal a ON rv.id_animal = a.id_animal
    JOIN tutor t ON a.id_tutor = t.id_tutor
    LEFT JOIN veterinario vet ON rv.id_veterinario = vet.id_veterinario
    WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?) AND rv.id_clinica = ?
  `;

  const params = [dataInicio, dataFim, dataInicio, dataFim, id_clinica];

  if (especie) {
    sql += ` AND a.especie = ?`;
    params.push(especie);
  }
  if (status) {
    sql += ` AND rv.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;

  const [relatorio] = await db.query(sql, params);
  return relatorio;
}

module.exports = {
  getTutorIdByUsuario,
  criarPet,
  cadastrarAnimalVet,
  cadastrarTutorEPet,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  editarAnimalSimples,
  deletarAnimal,
  relatorioVacinasVet
};