const db = require('../db'); // Pool de conexão MySQL (promises)

// Dados epidemiológicos (risco por região, cobertura por espécie, evolução e top vacinas)
async function dadosEpidemiologicos(query) {
  const inicio = query.inicio || '2000-01-01';
  const fim = query.fim || '2100-12-31';

  const especie = query.especie || '';
  const localidade = query.localidade || '';

  // Parâmetros e condição dinâmica para risco
  let paramsRisco = [inicio, fim, inicio, fim];
  let condicaoRisco = `WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?)`;

  // Filtro opcional por espécie
  if (especie) {
    condicaoRisco += ` AND a.especie = ?`;
    paramsRisco.push(especie);
  }

  // Filtro opcional por cidade/bairro (LIKE)
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

  // Condição geral (apenas status APLICADA + intervalo por data_aplicacao)
  let paramsGeral = [inicio, fim];
  let condicaoGeral = `WHERE rv.status = 'APLICADA' AND rv.data_aplicacao BETWEEN ? AND ?`;

  // Filtros opcionais na condição geral
  if (localidade) {
    condicaoGeral += ` AND (t.cidade LIKE ? OR t.bairro LIKE ?)`;
    paramsGeral.push(`%${localidade}%`, `%${localidade}%`);
  }
  if (especie) {
    condicaoGeral += ` AND a.especie = ?`;
    paramsGeral.push(especie);
  }

  // Cobertura por espécie
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

  // Evolução temporal mensal
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

  // Top vacinas
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

  // Retorna conjunto consolidado
  return { riscoRegiao, coberturaEspecie, evolucaoTemporal, topVacinas };
}

// Relatórios avançados com filtros opcionais
async function relatoriosAvancados(query) {
  const dataInicio = query.inicio || '2000-01-01';
  const dataFim = query.fim || '2100-12-31';

  const id_vacina = query.vacina || '';
  const especie = query.especie || '';
  const bairro = query.bairro || '';
  const status = query.status || '';

  // SQL base (janela por data_aplicacao ou data_proxima_dose)
  let sql = `
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

  // Filtros opcionais
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

  // Ordenação por mais recentes primeiro
  sql += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;

  const [relatorio] = await db.query(sql, params);
  return relatorio;
}

module.exports = {
  dadosEpidemiologicos,
  relatoriosAvancados
};
