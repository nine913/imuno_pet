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
  const { id_tutor, nome, especie, raca, data_nascimento } = data;
  
  await db.query(
    'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
    [id_tutor, nome, especie, raca || null, data_nascimento]
  );
}

async function cadastrarTutorEPet(dados) {
  const { email, senha, nome_completo, cpf, telefone, estado, cidade, bairro, nome_pet, especie, raca, data_nascimento } = dados;

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
    'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
    [idTutor, nome_pet, especie, raca || null, data_nascimento]
  );
}

async function buscarAnimais(queryParams) {
  const termo = queryParams.termo ? `%${queryParams.termo}%` : '%';
  const vacina = queryParams.vacina ? `%${queryParams.vacina}%` : '';
  const status = queryParams.status || '';

  let query = `
    SELECT DISTINCT a.id_animal, a.nome, a.especie, a.raca, t.nome_completo as nome_tutor, t.cpf, a.data_nascimento
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
    SELECT a.id_animal, a.nome as nome_animal, a.especie, a.raca, a.data_nascimento,
           t.id_tutor, t.nome_completo as nome_tutor, t.telefone, t.estado, t.cidade, t.bairro
    FROM animal a
    JOIN tutor t ON a.id_tutor = t.id_tutor
    WHERE a.id_animal = ?
  `, [id_animal]);

  return dados.length > 0 ? dados[0] : null;
}

async function editarPetTutor(id_animal, dados) {
  const { nome_animal, especie, raca, data_nascimento, id_tutor, telefone, estado, city, cidade, bairro } = dados;

  await db.query(
    `UPDATE animal SET nome = ?, especie = ?, raca = ?, data_nascimento = ? WHERE id_animal = ?`,
    [nome_animal, especie, raca, data_nascimento, id_animal]
  );

  await db.query(
    `UPDATE tutor SET telefone = ?, estado = ?, cidade = ?, bairro = ? WHERE id_tutor = ?`,
    [telefone, estado, city || cidade, bairro, id_tutor]
  );
}

async function editarAnimalSimples(id, dados) {
  const sql = `
    UPDATE animal 
    SET nome = ?, especie = ?, raca = ?, data_nascimento = ? 
    WHERE id_animal = ?
  `;
  await db.query(sql, [dados.nome, dados.especie, dados.raca, dados.data_nascimento, id]);
}

async function deletarAnimal(id_animal) {
  await db.query('DELETE FROM registro_vacinacao WHERE id_animal = ?', [id_animal]);
  await db.query('DELETE FROM animal WHERE id_animal = ?', [id_animal]);
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
};