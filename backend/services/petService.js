const db = require('../db');

async function getTutorIdByUsuario(id_usuario) {
  const [tutor] = await db.query('SELECT id_tutor FROM tutor WHERE id_usuario = ?', [id_usuario]);
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

async function buscarAnimais(queryParams) {
  const termo = queryParams.termo ? `%${queryParams.termo}%` : '%';
  const vacina = queryParams.vacina ? `%${queryParams.vacina}%` : '';
  const status = queryParams.status || '';

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

async function deletarAnimal(id_animal) {
  await db.query('DELETE FROM registro_vacinacao WHERE id_animal = ?', [id_animal]);
  await db.query('DELETE FROM animal WHERE id_animal = ?', [id_animal]);
}

module.exports = {
  criarPet,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  deletarAnimal
};
