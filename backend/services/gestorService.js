const db = require('../db'); // Pool de conexão com MySQL (promises)
const bcrypt = require('bcrypt'); // Hash de senha

// Dashboard: KPIs, top vacinas e evolução por mês/período
async function dadosDashboard(query) {
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

  // Retorna estrutura esperada pelo controller/frontend
  return {
    kpis: kpis[0],
    vacinasAplicadas,
    atendimentosMes,
    aplicacoesVet
  };
}

// Relatórios avançados: filtros opcionais (vacina/especie/bairro/status/aplicante)
async function relatoriosAvancados(query) {
  const dataInicio = query.inicio || '2000-01-01';
  const dataFim = query.fim || '2100-12-31';
  const id_clinica = query.id_clinica;

  // Filtros opcionais (strings vazias = sem filtro)
  const id_vacina = query.vacina || '';
  const especie = query.especie || '';
  const bairro = query.bairro || '';
  const status = query.status || '';
  const aplicante = query.aplicante || '';

  // Consulta base com join e condição de período (aplicação ou próxima dose)
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

  // Monta filtros adicionais dinamicamente
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

  // Ordena registros mais recentes primeiro
  sql += ` ORDER BY rv.data_aplicacao DESC, rv.data_proxima_dose DESC`;

  const [relatorio] = await db.query(sql, params);
  return relatorio;
}

// Lista veterinários com busca textual (nome/crmv/email)
async function veterinariosLista(query) {
  // se termo vier, usa LIKE; senão, '%' para não filtrar
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

// Cadastra veterinário: cria usuário (VETERINARIO) e depois cria registro na tabela veterinario
async function cadastrarVet(data) {
  const { nome_completo, crmv, email, senha, id_clinica } = data;

  // Valida email único em usuario
  const [existente] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (existente.length > 0) {
    const error = new Error('E-mail já cadastrado no sistema.');
    error.status = 400;
    throw error;
  }

  // Valida CRMV único em veterinario
  const [crmvExistente] = await db.query('SELECT * FROM veterinario WHERE crmv = ?', [crmv]);
  if (crmvExistente.length > 0) {
    const error = new Error('CRMV já cadastrado.');
    error.status = 400;
    throw error;
  }

  // Hash da senha e criação do usuário
  const hashSenha = await bcrypt.hash(senha, 10);
  const [resUser] = await db.query(
    'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "VETERINARIO")', 
    [email, hashSenha]
  );

  // id do usuário para FK em veterinario
  const idUsuario = resUser.insertId;

  // Insere registro de veterinário
  await db.query(
    'INSERT INTO veterinario (id_usuario, id_clinica, nome_completo, crmv) VALUES (?, ?, ?, ?)', 
    [idUsuario, id_clinica, nome_completo, crmv]
  );
}

// Edita veterinário: atualiza veterinario e email do usuário
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

// Deleta veterinário com bloqueio se houver registros de vacina aplicadas
async function deletarVet(id_veterinario) {
  // Conta registros de vacinação vinculados a esse veterinário
  const [vacinas] = await db.query(
    'SELECT COUNT(*) as total FROM registro_vacinacao WHERE id_veterinario = ?', 
    [id_veterinario]
  );

  // Se houver registros, bloqueia exclusão
  if (vacinas[0].total > 0) {
    const error = new Error('Exclusão bloqueada: O veterinário possui registros de vacinas aplicadas.');
    error.status = 400;
    throw error;
  }

  // Busca o usuário associado para poder deletar também
  const [vet] = await db.query('SELECT id_usuario FROM veterinario WHERE id_veterinario = ?', [id_veterinario]);
  if (vet.length === 0) {
    const error = new Error('Veterinário não encontrado');
    error.status = 404;
    throw error;
  }

  const id_user = vet[0].id_usuario;

  // Remove veterinario e depois o usuário
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