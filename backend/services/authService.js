const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../db');
const emailService = require('./emailService');

const RESET_TOKEN_VALIDADE_MS = 60 * 60 * 1000; // 1 hora

function erroComStatus(mensagem, status) {
  const error = new Error(mensagem);
  error.status = status;
  return error;
}

async function autenticar(email, senha) {
  const [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (rows.length === 0) {
    throw erroComStatus('Usuário não encontrado', 401);
  }

  const usuario = rows[0];
  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    throw erroComStatus('Senha incorreta', 401);
  }

  let id_clinica = null;
  let id_especifico = null;
  let nome_usuario = '';

  if (usuario.perfil === 'VETERINARIO') {
    const [vet] = await db.query(
      'SELECT v.id_veterinario, v.id_clinica, v.nome_completo, c.status FROM veterinario v JOIN clinica c ON v.id_clinica = c.id_clinica WHERE v.id_usuario = ?',
      [usuario.id_usuario]
    );
    if (vet.length > 0) {
      if (vet[0].status === 'INATIVA') {
        throw erroComStatus('Acesso bloqueado: Sua clínica está inativa no sistema.', 403);
      }
      id_clinica = vet[0].id_clinica;
      id_especifico = vet[0].id_veterinario;
      nome_usuario = vet[0].nome_completo;
    }
  } else if (usuario.perfil === 'GESTOR_CLINICA') {
    const [gestor] = await db.query(
      'SELECT g.id_gestor, g.id_clinica, g.nome_completo, c.status FROM gestor g JOIN clinica c ON g.id_clinica = c.id_clinica WHERE g.id_usuario = ?',
      [usuario.id_usuario]
    );
    if (gestor.length > 0) {
      if (gestor[0].status === 'INATIVA') {
        throw erroComStatus('Acesso bloqueado: Sua clínica está inativa no sistema.', 403);
      }
      id_clinica = gestor[0].id_clinica;
      id_especifico = gestor[0].id_gestor;
      nome_usuario = gestor[0].nome_completo;
    }
  } else if (usuario.perfil === 'TUTOR') {
    const [tutor] = await db.query(
      'SELECT id_tutor, nome_completo FROM tutor WHERE id_usuario = ?',
      [usuario.id_usuario]
    );
    if (tutor.length > 0) {
      id_especifico = tutor[0].id_tutor;
      nome_usuario = tutor[0].nome_completo;
    }
  } else if (usuario.perfil === 'GOVERNO') {
    const [gov] = await db.query(
      'SELECT id_orgao, nome_instituicao FROM orgao_governamental WHERE id_usuario = ?',
      [usuario.id_usuario]
    );
    if (gov.length > 0) {
      id_especifico = gov[0].id_orgao;
      nome_usuario = gov[0].nome_instituicao;
    }
  }

  return {
    id_usuario: usuario.id_usuario,
    perfil: usuario.perfil,
    id_clinica,
    id_especifico,
    nome: nome_usuario
  };
}

async function cadastrarTutorPublico(dados) {
  const { nome_completo, email, senha, cpf, telefone, estado, cidade, bairro } = dados;

  const [usuariosExistentes] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
  if (usuariosExistentes.length > 0) {
    throw erroComStatus('E-mail já cadastrado', 400);
  }

  const [tutoresExistentes] = await db.query('SELECT * FROM tutor WHERE cpf = ?', [cpf]);
  if (tutoresExistentes.length > 0) {
    throw erroComStatus('CPF já cadastrado', 400);
  }

  const hashSenha = await bcrypt.hash(senha, 10);

  const [resultadoUsuario] = await db.query(
    'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, ?)',
    [email, hashSenha, 'TUTOR']
  );

  const idUsuario = resultadoUsuario.insertId;

  await db.query(
    'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [idUsuario, nome_completo, cpf, telefone, estado, cidade, bairro]
  );

  return idUsuario;
}

function hashToken(tokenBruto) {
  return crypto.createHash('sha256').update(tokenBruto).digest('hex');
}

// Sempre resolve com sucesso (mesmo se o e-mail não existir) para não revelar quais e-mails
// estão cadastrados. O token bruto só é enviado por e-mail — o banco guarda apenas o hash.
async function solicitarRedefinicaoSenha(email) {
  const [usuarios] = await db.query('SELECT id_usuario FROM usuario WHERE email = ?', [email]);
  if (usuarios.length === 0) {
    return;
  }

  const tokenBruto = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + RESET_TOKEN_VALIDADE_MS);

  await db.query(
    'UPDATE usuario SET reset_token_hash = ?, reset_token_expira = ? WHERE id_usuario = ?',
    [hashToken(tokenBruto), expira, usuarios[0].id_usuario]
  );

  await emailService.enviarEmailRedefinicaoSenha(email, tokenBruto);
}

async function confirmarRedefinicaoSenha(tokenBruto, novaSenha) {
  if (!tokenBruto) {
    throw erroComStatus('Token de redefinição inválido.', 400);
  }

  const [usuarios] = await db.query(
    'SELECT id_usuario, reset_token_expira FROM usuario WHERE reset_token_hash = ?',
    [hashToken(tokenBruto)]
  );

  if (usuarios.length === 0 || new Date(usuarios[0].reset_token_expira) < new Date()) {
    throw erroComStatus('Token de redefinição inválido ou expirado.', 400);
  }

  const hashNovaSenha = await bcrypt.hash(novaSenha, 10);

  await db.query(
    'UPDATE usuario SET senha = ?, reset_token_hash = NULL, reset_token_expira = NULL WHERE id_usuario = ?',
    [hashNovaSenha, usuarios[0].id_usuario]
  );

  return usuarios[0].id_usuario;
}

module.exports = {
  autenticar,
  cadastrarTutorPublico,
  solicitarRedefinicaoSenha,
  confirmarRedefinicaoSenha
};
