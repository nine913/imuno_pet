// Dashboard: KPIs, top vacinas e evolução por mês/período
async function dadosDashboard(query) {
  console.log("Query recebida no backend:", query);
  // Defaults para o período caso query não venha preenchida
  const inicio = query.inicio || '2000-01-01';
  const fim = query.fim || '2100-12-31';
  const id_clinica = query.id_clinica;

  // Parâmetros reutilizados nas condições de data_aplicacao/data_proxima_dose
  const paramsGeral = [inicio, fim, inicio, fim, id_clinica];

  // Condição dinâmica (montada com template literal) usando placeholders (?)
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

  // Executa consulta de KPIs
  const [kpis] = await db.query(queryKpis, paramsGeral);

  // Condição para apenas status "APLICADA"
  const paramsAplicadas = [inicio, fim, id_clinica];
  const condicaoAplicadas = `rv.status = 'APLICADA' AND rv.data_aplicacao BETWEEN ? AND ? AND rv.id_clinica = ?`;

  // Top vacinas aplicadas (limit 5)
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

  // Evolução mensal (limit 6) para status "APLICADA"
  const queryEvolucao = `
    SELECT DATE_FORMAT(data_aplicacao, '%Y-%m') as mes, COUNT(id_registro) as quantidade
    FROM registro_vacinacao rv
    WHERE ${condicaoAplicadas}
    GROUP BY mes
    ORDER BY mes ASC
    LIMIT 6
  `;
  const [atendimentosMes] = await db.query(queryEvolucao, paramsAplicadas);

  // Quantidade de aplicações por veterinário (status "APLICADA")
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

  // Retorna estrutura esperada pelo controller/frontend
  return {
    kpis: kpis[0],
    vacinasAplicadas,
    atendimentosMes,
    aplicacoesVet,
    clinica: clinicaDados[0] || null
  };
}