const db = require('../../../db');
const bcrypt = require('bcrypt');
const emailService = require('../../../services/emailService');
const authService = require('../../../services/authService');

jest.mock('../../../db');
jest.mock('bcrypt');
jest.mock('../../../services/emailService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TEST-AUTHSVC-001 - autenticar()', () => {
  test('lança erro 401 quando o usuário não existe', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await expect(authService.autenticar('x@x.com', '123456')).rejects.toMatchObject({
      message: 'Usuário não encontrado',
      status: 401
    });
  });

  test('lança erro 401 quando a senha está incorreta', async () => {
    db.query.mockResolvedValueOnce([[{ id_usuario: 1, senha: 'hash', perfil: 'TUTOR' }]]);
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.autenticar('x@x.com', 'errada')).rejects.toMatchObject({
      message: 'Senha incorreta',
      status: 401
    });
  });

  test('lança erro 403 quando o veterinário pertence a uma clínica inativa', async () => {
    db.query
      .mockResolvedValueOnce([[{ id_usuario: 1, senha: 'hash', perfil: 'VETERINARIO' }]])
      .mockResolvedValueOnce([[{ id_veterinario: 5, id_clinica: 9, nome_completo: 'Dr. Ana', status: 'INATIVA' }]]);
    bcrypt.compare.mockResolvedValue(true);

    await expect(authService.autenticar('vet@x.com', '123456')).rejects.toMatchObject({
      status: 403
    });
  });

  test('retorna os dados do usuário TUTOR quando as credenciais são válidas', async () => {
    db.query
      .mockResolvedValueOnce([[{ id_usuario: 40, senha: 'hash', perfil: 'TUTOR' }]])
      .mockResolvedValueOnce([[{ id_tutor: 7, nome_completo: 'João Pedro' }]]);
    bcrypt.compare.mockResolvedValue(true);

    const resultado = await authService.autenticar('joao@x.com', '123456');

    expect(resultado).toEqual({
      id_usuario: 40,
      perfil: 'TUTOR',
      id_clinica: null,
      id_especifico: 7,
      nome: 'João Pedro'
    });
  });
});

describe('TEST-AUTHSVC-005 - alterarSenha()', () => {
  test('lança erro 404 quando o usuário não existe', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await expect(authService.alterarSenha(999, 'atual', 'nova12345')).rejects.toMatchObject({
      status: 404
    });
  });

  test('lança erro 401 quando a senha atual está incorreta', async () => {
    db.query.mockResolvedValueOnce([[{ senha: 'hash-atual' }]]);
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.alterarSenha(1, 'atual-errada', 'nova12345')).rejects.toMatchObject({
      message: 'Senha atual incorreta.',
      status: 401
    });
  });

  test('atualiza a senha com o novo hash quando a senha atual é válida', async () => {
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('hash-nova-senha');
    db.query
      .mockResolvedValueOnce([[{ senha: 'hash-atual' }]])
      .mockResolvedValueOnce([{}]);

    await authService.alterarSenha(1, 'atual-correta', 'nova12345');

    expect(db.query).toHaveBeenLastCalledWith(
      'UPDATE usuario SET senha = ? WHERE id_usuario = ?',
      ['hash-nova-senha', 1]
    );
  });
});

describe('TEST-AUTHSVC-002 - cadastrarTutorPublico()', () => {
  test('lança erro 400 quando o e-mail já existe', async () => {
    db.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]);

    await expect(authService.cadastrarTutorPublico({ email: 'x@x.com', cpf: '111' })).rejects.toMatchObject({
      message: 'E-mail já cadastrado',
      status: 400
    });
  });

  test('lança erro 400 quando o CPF já existe', async () => {
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[{ id_tutor: 1 }]]);

    await expect(authService.cadastrarTutorPublico({ email: 'novo@x.com', cpf: '111' })).rejects.toMatchObject({
      message: 'CPF já cadastrado',
      status: 400
    });
  });

  test('cadastra usuário e tutor com sucesso', async () => {
    bcrypt.hash.mockResolvedValue('hash-senha');
    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 55 }])
      .mockResolvedValueOnce([{}]);

    const idUsuario = await authService.cadastrarTutorPublico({
      nome_completo: 'Maria',
      email: 'maria@x.com',
      senha: '123456',
      cpf: '222',
      telefone: '999',
      estado: 'PA',
      cidade: 'Belém',
      bairro: 'Centro'
    });

    expect(idUsuario).toBe(55);
    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, ?)',
      ['maria@x.com', 'hash-senha', 'TUTOR']
    );
  });
});

describe('TEST-AUTHSVC-003 - solicitarRedefinicaoSenha()', () => {
  test('não faz nada (nem envia e-mail) quando o e-mail não existe, mas não lança erro', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await expect(authService.solicitarRedefinicaoSenha('inexistente@x.com')).resolves.toBeUndefined();
    expect(emailService.enviarEmailRedefinicaoSenha).not.toHaveBeenCalled();
  });

  test('gera token, salva o hash no banco e aciona o envio de e-mail quando o usuário existe', async () => {
    db.query
      .mockResolvedValueOnce([[{ id_usuario: 10 }]])
      .mockResolvedValueOnce([{}]);

    await authService.solicitarRedefinicaoSenha('existente@x.com');

    expect(emailService.enviarEmailRedefinicaoSenha).toHaveBeenCalledTimes(1);
    const [emailChamado, tokenBruto] = emailService.enviarEmailRedefinicaoSenha.mock.calls[0];
    expect(emailChamado).toBe('existente@x.com');
    expect(tokenBruto).toHaveLength(64); // 32 bytes em hex

    const [, params] = db.query.mock.calls[1];
    expect(params[2]).toBe(10);
    expect(params[0]).not.toBe(tokenBruto); // o banco guarda o hash, nunca o token bruto
  });
});

describe('TEST-AUTHSVC-004 - confirmarRedefinicaoSenha()', () => {
  test('lança erro 400 quando o token não corresponde a nenhum usuário', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await expect(authService.confirmarRedefinicaoSenha('token-invalido', '123456')).rejects.toMatchObject({
      status: 400
    });
  });

  test('lança erro 400 quando o token já expirou', async () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
    db.query.mockResolvedValueOnce([[{ id_usuario: 1, reset_token_expira: ontem }]]);

    await expect(authService.confirmarRedefinicaoSenha('token-expirado', '123456')).rejects.toMatchObject({
      status: 400
    });
  });

  test('redefine a senha e limpa o token quando tudo é válido', async () => {
    const amanha = new Date(Date.now() + 60 * 60 * 1000);
    bcrypt.hash.mockResolvedValue('nova-hash');
    db.query
      .mockResolvedValueOnce([[{ id_usuario: 20, reset_token_expira: amanha }]])
      .mockResolvedValueOnce([{}]);

    const idUsuario = await authService.confirmarRedefinicaoSenha('token-valido', 'novaSenha123');

    expect(idUsuario).toBe(20);
    expect(db.query).toHaveBeenLastCalledWith(
      'UPDATE usuario SET senha = ?, reset_token_hash = NULL, reset_token_expira = NULL WHERE id_usuario = ?',
      ['nova-hash', 20]
    );
  });
});
