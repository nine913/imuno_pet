const db = require('../db');
const bcrypt = require('bcrypt');

const adminService = {
  listarClinicas: async (termo) => {
    let sql = 'SELECT * FROM clinica';
    const params = [];
    if (termo) {
      sql += ' WHERE nome_fantasia LIKE ? OR cnpj LIKE ?';
      params.push(`%${termo}%`, `%${termo}%`);
    }
    sql += ' ORDER BY nome_fantasia ASC';
    const [linhas] = await db.query(sql, params);
    return linhas;
  },

  cadastrarClinica: async (dados) => {
    const sql = 'INSERT INTO clinica (nome_fantasia, cnpj, endereco, estado, cidade, bairro, telefone) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [dados.nome_fantasia, dados.cnpj, dados.endereco, dados.estado, dados.cidade, dados.bairro, dados.telefone];
    const [resultado] = await db.query(sql, params);
    return resultado.insertId;
  },

  editarClinica: async (id_clinica, dados) => {
    const sql = 'UPDATE clinica SET nome_fantasia = ?, cnpj = ?, endereco = ?, estado = ?, cidade = ?, bairro = ?, telefone = ? WHERE id_clinica = ?';
    const params = [dados.nome_fantasia, dados.cnpj, dados.endereco, dados.estado, dados.cidade, dados.bairro, dados.telefone, id_clinica];
    const [resultado] = await db.query(sql, params);
    return resultado.affectedRows;
  },

  deletarClinica: async (id_clinica) => {
    const sql = 'DELETE FROM clinica WHERE id_clinica = ?';
    const [resultado] = await db.query(sql, [id_clinica]);
    return resultado.affectedRows;
  },

  listarGestores: async (termo) => {
    let sql = `
      SELECT g.id_gestor, g.id_clinica, g.nome_completo, u.email, c.nome_fantasia 
      FROM gestor g
      JOIN usuario u ON g.id_usuario = u.id_usuario
      JOIN clinica c ON g.id_clinica = c.id_clinica
    `;
    const params = [];
    if (termo) {
      sql += ' WHERE g.nome_completo LIKE ? OR u.email LIKE ?';
      params.push(`%${termo}%`, `%${termo}%`);
    }
    sql += ' ORDER BY g.nome_completo ASC';
    const [linhas] = await db.query(sql, params);
    return linhas;
  },

  cadastrarGestor: async (dados) => {
    const hashSenha = await bcrypt.hash(dados.senha, 10);
    const sqlUsuario = 'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "GESTOR_CLINICA")';
    const [resUsuario] = await db.query(sqlUsuario, [dados.email, hashSenha]);
    const id_usuario = resUsuario.insertId;

    const sqlGestor = 'INSERT INTO gestor (id_usuario, id_clinica, nome_completo) VALUES (?, ?, ?)';
    await db.query(sqlGestor, [id_usuario, dados.id_clinica, dados.nome_completo]);
  },

  editarGestor: async (id_gestor, dados) => {
    const sql = 'UPDATE gestor SET id_clinica = ?, nome_completo = ? WHERE id_gestor = ?';
    await db.query(sql, [dados.id_clinica, dados.nome_completo, id_gestor]);
  },

  deletarGestor: async (id_gestor) => {
    const [gestor] = await db.query('SELECT id_usuario FROM gestor WHERE id_gestor = ?', [id_gestor]);
    if (gestor.length > 0) {
      await db.query('DELETE FROM usuario WHERE id_usuario = ?', [gestor[0].id_usuario]);
    }
  },

  listarOrgaos: async (termo) => {
    let sql = `
      SELECT o.id_orgao, o.nome_instituicao, o.esfera, o.estado_atuacao, o.cidade_atuacao, u.email 
      FROM orgao_governamental o
      JOIN usuario u ON o.id_usuario = u.id_usuario
    `;
    const params = [];
    if (termo) {
      sql += ' WHERE o.nome_instituicao LIKE ? OR u.email LIKE ?';
      params.push(`%${termo}%`, `%${termo}%`);
    }
    sql += ' ORDER BY o.nome_instituicao ASC';
    const [linhas] = await db.query(sql, params);
    return linhas;
  },

  cadastrarOrgao: async (dados) => {
    const hashSenha = await bcrypt.hash(dados.senha, 10);
    const sqlUsuario = 'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "GOVERNO")';
    const [resUsuario] = await db.query(sqlUsuario, [dados.email, hashSenha]);
    const id_usuario = resUsuario.insertId;

    const sqlOrgao = 'INSERT INTO orgao_governamental (id_usuario, nome_instituicao, esfera, estado_atuacao, cidade_atuacao) VALUES (?, ?, ?, ?, ?)';
    await db.query(sqlOrgao, [id_usuario, dados.nome_instituicao, dados.esfera, dados.estado_atuacao, dados.cidade_atuacao]);
  },

  editarOrgao: async (id_orgao, dados) => {
    const sql = 'UPDATE orgao_governamental SET nome_instituicao = ?, esfera = ?, estado_atuacao = ?, cidade_atuacao = ? WHERE id_orgao = ?';
    await db.query(sql, [dados.nome_instituicao, dados.esfera, dados.estado_atuacao, dados.cidade_atuacao, id_orgao]);
  },

  deletarOrgao: async (id_orgao) => {
    const [orgao] = await db.query('SELECT id_usuario FROM orgao_governamental WHERE id_orgao = ?', [id_orgao]);
    if (orgao.length > 0) {
      await db.query('DELETE FROM usuario WHERE id_usuario = ?', [orgao[0].id_usuario]);
    }
  },

  obterEstatisticas: async () => {
    const [clinicas] = await db.query('SELECT COUNT(*) as total FROM clinica');
    const [usuarios] = await db.query('SELECT COUNT(*) as total FROM usuario');
    const [vacinas] = await db.query('SELECT COUNT(*) as total FROM vacina');

    return {
      total_clinicas: clinicas[0].total,
      total_usuarios: usuarios[0].total,
      total_vacinas: vacinas[0].total
    };
  },

  listarEspecies: async () => {
    const [linhas] = await db.query('SELECT * FROM especie ORDER BY nome_especie ASC');
    return linhas;
  },

  cadastrarEspecie: async (nome_especie) => {
    await db.query('INSERT INTO especie (nome_especie) VALUES (?)', [nome_especie]);
  },

  deletarEspecie: async (id_especie) => {
    await db.query('DELETE FROM especie WHERE id_especie = ?', [id_especie]);
  },

  listarRacas: async (id_especie) => {
    let sql = 'SELECT r.*, e.nome_especie FROM raca r JOIN especie e ON r.id_especie = e.id_especie';
    const params = [];
    if (id_especie) {
      sql += ' WHERE r.id_especie = ?';
      params.push(id_especie);
    }
    sql += ' ORDER BY e.nome_especie ASC, r.nome_raca ASC';
    const [linhas] = await db.query(sql, params);
    return linhas;
  },

  cadastrarRaca: async (id_especie, nome_raca) => {
    await db.query('INSERT INTO raca (id_especie, nome_raca) VALUES (?, ?)', [id_especie, nome_raca]);
  },

  deletarRaca: async (id_raca) => {
    await db.query('DELETE FROM raca WHERE id_raca = ?', [id_raca]);
  },

  listarAvisos: async () => {
    const [linhas] = await db.query('SELECT * FROM aviso ORDER BY data_criacao DESC');
    return linhas;
  },

  cadastrarAviso: async (dados) => {
    await db.query('INSERT INTO aviso (titulo, mensagem, tipo) VALUES (?, ?, ?)', [dados.titulo, dados.mensagem, dados.tipo || 'INFO']);
  },

  editarAviso: async (id_aviso, dados) => {
    await db.query('UPDATE aviso SET titulo = ?, mensagem = ?, tipo = ?, status = ? WHERE id_aviso = ?', [dados.titulo, dados.mensagem, dados.tipo, dados.status, id_aviso]);
  },

  deletarAviso: async (id_aviso) => {
    await db.query('DELETE FROM aviso WHERE id_aviso = ?', [id_aviso]);
  },

  listarLogs: async () => {
    const sql = `
      SELECT l.id_log, l.acao, l.detalhes, l.data_hora, u.email, u.perfil
      FROM log_auditoria l
      JOIN usuario u ON l.id_usuario = u.id_usuario
      ORDER BY l.data_hora DESC
      LIMIT 200
    `;
    const [linhas] = await db.query(sql);
    return linhas;
  },

  obterClinicaPorId: async (id) => {
    const [linhas] = await db.query('SELECT * FROM clinica WHERE id_clinica = ?', [id]);
    return linhas.length > 0 ? linhas[0] : null;
  },

  listarVacinas: async (termo) => {
    let sql = 'SELECT * FROM vacina';
    const params = [];
    if (termo) {
      sql += ' WHERE nome_vacina LIKE ? OR doencas_prevenidas LIKE ?';
      params.push(`%${termo}%`, `%${termo}%`);
    }
    sql += ' ORDER BY nome_vacina ASC';
    const [linhas] = await db.query(sql, params);
    return linhas;
  },

  cadastrarVacina: async (dados) => {
    const sql = 'INSERT INTO vacina (nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias) VALUES (?, ?, ?, ?)';
    const params = [dados.nome_vacina, dados.fabricante, dados.doencas_prevenidas, dados.intervalo_doses_dias];
    await db.query(sql, params);
  },

  editarVacina: async (id_vacina, dados) => {
    const sql = 'UPDATE vacina SET nome_vacina = ?, fabricante = ?, doencas_prevenidas = ?, intervalo_doses_dias = ? WHERE id_vacina = ?';
    const params = [dados.nome_vacina, dados.fabricante, dados.doencas_prevenidas, dados.intervalo_doses_dias, id_vacina];
    await db.query(sql, params);
  },

  deletarVacina: async (id_vacina) => {
    const sql = 'DELETE FROM vacina WHERE id_vacina = ?';
    await db.query(sql, [id_vacina]);
  },


};

module.exports = adminService;