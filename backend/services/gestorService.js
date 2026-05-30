const db = require('../db');
const bcrypt = require('bcrypt');

async function dadosDashboard(query) {
  const inicio = query.inicio || '2000-01-01';
  const fim = query.fim || '2100-12-31';
  const id_clinica = query.id_clinica || null;

  const paramsGeral = [inicio, fim, inicio, fim, id_clinica];

  const condicaoDatas = `(data_aplicacao BETWEEN ? AND ? OR data_proxima_dose BETWEEN ? AND ?) AND id_clinica = ?`;

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

  const paramsAplicadas = [inicio, fim, id_clinica];
  const condicaoAplicadas = `rv.status = 'APLICADA' AND rv.data_aplicacao BETWEEN ? AND ? AND rv.id_clinica = ?`;

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

  const [clinicaDados] = await db.query('SELECT * FROM clinica WHERE id_clinica = ?', [id_clinica]);

  return {
    kpis: kpis[0],
    vacinasAplicadas,
    atendimentosMes,
    aplicacoesVet,
    clinica: clinicaDados[0] || null
  };
}

async function relatoriosAvancados(query) {
  const dataInicio = query.inicio || '2000-01-01';
  const dataFim = query.fim || '2100-12-31';
  const id_clinica = query.id_clinica;

  const id_vacina = query.vacina || '';
  const especie = query.especie || '';
  const bairro = query.bairro || '';
  const status = query.status || '';
  const aplicante = query.aplicante || '';

  let sql = `
    SELECT rv.data_aplicacao, rv.data_proxima_dose, rv.status, v.nome_vacina, 
           a.nome as nome_animal, a.especie, a.raca, 
           t.nome_completo as nome_tutor, t.bairro, t.cidade, t.telefone,
           vet.nome_completo as nome_vet, vet.crmv as crmv_vet
    FROM registro_vacinacao rv
    JOIN vacina v ON rv.id_vacina = v.id_vacina
    JOIN animal a ON rv.id_animal = a.id_animal
    JOIN tutor t ON a.id_tutor = t.id_tutor
    LEFT JOIN veterinario vet ON rv.id_veterinario = vet.id_veterinario
    WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?) AND rv.id_clinica = ?
  `;

  const params = [dataInicio, dataFim, dataInicio, dataFim, id_clinica];

  if (id_vacina) {
    sql += ` AND rv.id_vacina = ?`;
    params.push(id_vacina);
  }
  if (especie) {
    sql += ` AND a.especie = ?`;
    params.push(especie);
  }
  if (bairro) {
    sql += ` AND t.bairro LIKE ?`;
    params.push(`%${bairro}%`);
  }
  if (status) {
    sql += ` AND rv.status = ?`;
    params.push(status);
  }
  if (aplicante) {
    sql += ` AND rv.id_veterinario = ?`;
    params.push(aplicante);
  }

  sql += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;

  const [relatorio] = await db.query(sql, params);
  return relatorio;
}

async function veterinariosLista(query) {
  const termo = query.termo ? `%${query.termo}%` : '%';
  const id_clinica = query.id_clinica;

  const [vets] = await db.query(`
    SELECT v.id_veterinario, v.id_usuario, v.nome_completo, v.crmv, u.email
    FROM veterinario v
    JOIN usuario u ON v.id_usuario = u.id_usuario
    WHERE (v.nome_completo LIKE ? OR v.crmv LIKE ? OR u.email LIKE ?) AND v.id_clinica = ?
    ORDER BY v.nome_completo ASC
  `, [termo, termo, termo, id_clinica]);

  return vets;
}

async function cadastrarVet(data) {
  const { nome_completo, crmv, email, senha, id_clinica } = data;

  const [existente] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (existente.length > 0) {
    const error = new Error('E-mail já cadastrado no sistema.');
    error.status = 400;
    throw error;
  }

  const [crmvExistente] = await db.query('SELECT * FROM veterinario WHERE crmv = ?', [crmv]);
  if (crmvExistente.length > 0) {
    const error = new Error('CRMV já cadastrado.');
    error.status = 400;
    throw error;
  }

  const hashSenha = await bcrypt.hash(senha, 10);
  const [resUser] = await db.query(
    'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "VETERINARIO")', 
    [email, hashSenha]
  );

  const idUsuario = resUser.insertId;

  await db.query(
    'INSERT INTO veterinario (id_usuario, id_clinica, nome_completo, crmv) VALUES (?, ?, ?, ?)', 
    [idUsuario, id_clinica, nome_completo, crmv]
  );
}

async function editarVet(id_veterinario, data) {
  const { nome_completo, crmv, email, id_usuario } = data;

  await db.query(
    'UPDATE veterinario SET nome_completo = ?, crmv = ? WHERE id_veterinario = ?', 
    [nome_completo, crmv, id_veterinario]
  );

  await db.query(
    'UPDATE usuario SET email = ? WHERE id_usuario = ?', 
    [email, id_usuario]
  );
}

async function deletarVet(id_veterinario) {
  const [vacinas] = await db.query(
    'SELECT COUNT(*) as total FROM registro_vacinacao WHERE id_veterinario = ?', 
    [id_veterinario]
  );

  if (vacinas[0].total > 0) {
    const error = new Error('Exclusão bloqueada: O veterinário possui registros de vacinas aplicadas.');
    error.status = 400;
    throw error;
  }

  const [vet] = await db.query('SELECT id_usuario FROM veterinario WHERE id_veterinario = ?', [id_veterinario]);
  if (vet.length === 0) {
    const error = new Error('Veterinário não encontrado');
    error.status = 404;
    throw error;
  }

  const id_user = vet[0].id_usuario;

  await db.query('DELETE FROM veterinario WHERE id_veterinario = ?', [id_veterinario]);
  await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id_user]);
}

module.exports = {
  dadosDashboard,
  relatoriosAvancados,
  veterinariosLista,
  cadastrarVet,
  editarVet,
  deletarVet
};