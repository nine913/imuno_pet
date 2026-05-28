const db = require('../db'); // Pool de conexão MySQL (promises)

async function getTutorIdByUsuario(id_usuario) {
  // Busca o id_tutor a partir do id_usuario
  const [tutor] = await db.query(
    'SELECT id_tutor FROM tutor WHERE id_usuario = ?',
    [id_usuario]
  );

  // Retorna null se não encontrar
  return tutor.length > 0 ? tutor[0].id_tutor : null;
}

async function criarPet(data) {
  const { id_usuario, nome, especie, raca, data_nascimento } = data;

  // Converte o id_usuario para id_tutor (FK do animal)
  const id_tutor = await getTutorIdByUsuario(id_usuario);

  // Se não existir tutor correspondente, lança erro 404
  if (!id_tutor) {
    const error = new Error('Tutor não encontrado');
    error.status = 404;
    throw error;
  }

  // Insere o animal vinculado ao tutor
  await db.query(
    'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
    [id_tutor, nome, especie, raca, data_nascimento]
  );
}

async function buscarAnimais(queryParams) {
  // Montagem de filtros para LIKE
  const termo = queryParams.termo ? `%${queryParams.termo}%` : '%';
  const vacina = queryParams.vacina ? `%${queryParams.vacina}%` : '';
  const status = queryParams.status || '';

  // Consulta base com joins (animal/tutor + opcionalmente vacinas)
  let query = `
    SELECT DISTINCT a.id_animal, a.nome as nome_animal, a.especie, a.raca, t.nome_completo as nome_tutor, t.cpf
    FROM animal a
    JOIN tutor t ON a.id_tutor = t.id_tutor
    LEFT JOIN registro_vacinacao rv ON a.id_animal = rv.id_animal
    LEFT JOIN vacina v ON rv.id_vacina = v.id_vacina
    WHERE (a.nome LIKE ? OR t.cpf LIKE ? OR t.nome_completo LIKE ?)
  `;
  const params = [termo, termo, termo];

  // Adiciona filtros opcionais dinamicamente (vacina)
  if (vacina) {
    query += ` AND v.nome_vacina LIKE ?`;
    params.push(vacina);
  }

  // Adiciona filtros opcionais dinamicamente (status)
  if (status) {
    query += ` AND rv.status = ?`;
    params.push(status);
  }

  const [animais] = await db.query(query, params);
  return animais;
}

async function detalhesAnimal(id_animal) {
  // Busca detalhes do animal e do tutor relacionado
  const [dados] = await db.query(`
    SELECT a.id_animal, a.nome as nome_animal, a.especie, a.raca, a.data_nascimento,
           t.id_tutor, t.nome_completo as nome_tutor, t.telefone, t.estado, t.cidade, t.bairro
    FROM animal a
    JOIN tutor t ON a.id_tutor = t.id_tutor
    WHERE a.id_animal = ?
  `, [id_animal]);

  // Retorna primeiro item ou null
  return dados.length > 0 ? dados[0] : null;
}

async function editarPetTutor(id_animal, dados) {
  // Alguns campos podem vir com chaves diferentes (city ou cidade)
  const { nome_animal, especie, raca, data_nascimento, id_tutor, telefone, estado, city, cidade, bairro } = dados;

  // Atualiza dados do animal
  await db.query(
    `UPDATE animal SET nome = ?, especie = ?, raca = ?, data_nascimento = ? WHERE id_animal = ?`,
    [nome_animal, especie, raca, data_nascimento, id_animal]
  );

  // Atualiza dados do tutor (cidade usa city || cidade)
  await db.query(
    `UPDATE tutor SET telefone = ?, estado = ?, cidade = ?, bairro = ? WHERE id_tutor = ?`,
    [telefone, estado, city || cidade, bairro, id_tutor]
  );
}

async function deletarAnimal(id_animal) {
  // Remove dependentes primeiro (registro de vacinação)
  await db.query('DELETE FROM registro_vacinacao WHERE id_animal = ?', [id_animal]);

  // Remove o animal em seguida
  await db.query('DELETE FROM animal WHERE id_animal = ?', [id_animal]);
}

module.exports = {
  criarPet,
  buscarAnimais,
  detalhesAnimal,
  editarPetTutor,
  deletarAnimal
};
