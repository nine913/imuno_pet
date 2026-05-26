const db = require('../db');

async function registrarVacina(data) {
  const { id_animal, id_vacina, data_aplicacao, data_proxima_dose, status, id_usuario } = data;
  let id_veterinario = null;

  if (status === 'APLICADA' && id_usuario) {
    const [vet] = await db.query('SELECT id_veterinario FROM veterinario WHERE id_usuario = ?', [id_usuario]);
    if (vet.length > 0) {
      id_veterinario = vet[0].id_veterinario;
    }
  }

  await db.query(`
    INSERT INTO registro_vacinacao (id_animal, id_vacina, data_aplicacao, data_proxima_dose, status, id_veterinario)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id_animal, id_vacina, data_aplicacao, data_proxima_dose, status, id_veterinario]);
}

async function cadastrarVacina(data) {
  const { nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias } = data;
  await db.query(
    'INSERT INTO vacina (nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias) VALUES (?, ?, ?, ?)',
    [nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias]
  );
}

async function buscarVacinas(query) {
  const termo = query.termo ? `%${query.termo}%` : '%';
  const [vacinas] = await db.query(`
    SELECT id_vacina, nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias 
    FROM vacina 
    WHERE nome_vacina LIKE ? OR doencas_prevenidas LIKE ? OR fabricante LIKE ?
  `, [termo, termo, termo]);
  return vacinas;
}

async function editarVacina(id_vacina, dados) {
  const { nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias } = dados;
  await db.query(
    'UPDATE vacina SET nome_vacina = ?, doencas_prevenidas = ?, fabricante = ?, intervalo_doses_dias = ? WHERE id_vacina = ?',
    [nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias, id_vacina]
  );
}

async function deletarVacina(id_vacina) {
  await db.query('DELETE FROM registro_vacinacao WHERE id_vacina = ?', [id_vacina]);
  await db.query('DELETE FROM vacina WHERE id_vacina = ?', [id_vacina]);
}

async function historicoPet(id_animal, query) {
  const termo = query.termo ? `%${query.termo}%` : '%';
  const status = query.status || '';

  let sql = `
    SELECT rv.id_registro, v.id_vacina, v.nome_vacina, v.doencas_prevenidas, rv.data_aplicacao, rv.data_proxima_dose, rv.status, rv.id_veterinario
    FROM registro_vacinacao rv
    JOIN vacina v ON rv.id_vacina = v.id_vacina
    WHERE rv.id_animal = ? AND v.nome_vacina LIKE ?
  `;
  const params = [id_animal, termo];

  if (status) {
    sql += ` AND rv.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY rv.data_aplicacao DESC`;
  const [historico] = await db.query(sql, params);
  return historico;
}

async function deletarRegistroVacina(id_registro) {
  await db.query('DELETE FROM registro_vacinacao WHERE id_registro = ?', [id_registro]);
}

async function relatorioVacinas(query) {
  const dataInicio = query.inicio || '2000-01-01';
  const dataFim = query.fim || '2100-12-31';
  const status = query.status || '';
  const especie = query.especie || '';

  let sql = `
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
    sql += ` AND rv.status = ?`;
    params.push(status);
  }
  if (especie) {
    sql += ` AND a.especie = ?`;
    params.push(especie);
  }

  sql += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;
  const [relatorio] = await db.query(sql, params);
  return relatorio;
}

async function editarRegistroVacina(id_registro, dados) {
  const { id_vacina, status, data_aplicacao, data_proxima_dose, id_usuario } = dados;
  let id_veterinario = null;

  if (status === 'APLICADA' && id_usuario) {
    const [vet] = await db.query('SELECT id_veterinario FROM veterinario WHERE id_usuario = ?', [id_usuario]);
    if (vet.length > 0) {
      id_veterinario = vet[0].id_veterinario;
    }
  }

  await db.query(`
    UPDATE registro_vacinacao 
    SET id_vacina = ?, status = ?, data_aplicacao = ?, data_proxima_dose = ?, id_veterinario = ? 
    WHERE id_registro = ?
  `, [id_vacina, status, data_aplicacao, data_proxima_dose, id_veterinario, id_registro]);
}

async function animaisAtrasados() {
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
  return atrasados;
}

module.exports = {
  registrarVacina,
  cadastrarVacina,
  buscarVacinas,
  editarVacina,
  deletarVacina,
  historicoPet,
  deletarRegistroVacina,
  relatorioVacinas,
  editarRegistroVacina,
  animaisAtrasados
};
