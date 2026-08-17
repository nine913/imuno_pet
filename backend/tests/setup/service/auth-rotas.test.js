process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

jest.mock('../../../db');
jest.mock('bcrypt');
jest.mock('../../../services/emailService');

const request = require('supertest');
const db = require('../../../db');
const bcrypt = require('bcrypt');
const app = require('../../../app');
const { gerarToken } = require('../../../utils/jwt');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TEST-AUTHROTAS-001 - fluxo de login/logout', () => {
  test('POST /login com sucesso seta cookies httpOnly de sessão e não expõe o token no corpo', async () => {
    db.query
      .mockResolvedValueOnce([[{ id_usuario: 1, senha: 'hash', perfil: 'ADMINISTRADOR' }]])
      .mockResolvedValueOnce([{}]); // log de auditoria
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app).post('/login').send({ email: 'admin@x.com', senha: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();
    expect(res.body.perfil).toBe('ADMINISTRADOR');

    const cookies = res.headers['set-cookie'];
    expect(cookies.some((c) => c.startsWith('token=') && /httponly/i.test(c))).toBe(true);
    expect(cookies.some((c) => c.startsWith('csrf_token=') && !/httponly/i.test(c))).toBe(true);
  });

  test('POST /logout sem token retorna 401', async () => {
    const res = await request(app).post('/logout');
    expect(res.status).toBe(401);
  });
});

describe('TEST-AUTHROTAS-003 - POST /alterar-senha', () => {
  test('sem token retorna 401 e não toca no banco', async () => {
    const res = await request(app).post('/alterar-senha').send({ senha_atual: 'a', nova_senha: '123456' });
    expect(res.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('com senha nova curta retorna 400 sem tocar no banco', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const res = await request(app)
      .post('/alterar-senha')
      .set('Authorization', `Bearer ${token}`)
      .send({ senha_atual: 'a', nova_senha: '123' });

    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('com senha atual incorreta retorna 401', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    db.query.mockResolvedValueOnce([[{ senha: 'hash-atual' }]]);
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post('/alterar-senha')
      .set('Authorization', `Bearer ${token}`)
      .send({ senha_atual: 'errada', nova_senha: '123456' });

    expect(res.status).toBe(401);
  });

  test('com senha atual correta altera a senha e responde 200', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('hash-nova');
    db.query
      .mockResolvedValueOnce([[{ senha: 'hash-atual' }]])
      .mockResolvedValueOnce([{}]) // UPDATE senha
      .mockResolvedValueOnce([{}]); // log de auditoria

    const res = await request(app)
      .post('/alterar-senha')
      .set('Authorization', `Bearer ${token}`)
      .send({ senha_atual: 'correta', nova_senha: 'novaSenha123' });

    expect(res.status).toBe(200);
  });
});

describe('TEST-AUTHROTAS-002 - fluxo de redefinição de senha em 2 passos', () => {
  test('POST /solicitar-redefinicao-senha sempre responde 200, mesmo para e-mail inexistente', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app).post('/solicitar-redefinicao-senha').send({ email: 'naoexiste@x.com' });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toMatch(/se este e-mail estiver cadastrado/i);
  });

  test('POST /confirmar-redefinicao-senha com token inválido retorna 400', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const res = await request(app)
      .post('/confirmar-redefinicao-senha')
      .send({ token: 'token-qualquer', nova_senha: '123456' });

    expect(res.status).toBe(400);
  });

  test('POST /confirmar-redefinicao-senha com senha curta retorna 400 sem tocar no banco', async () => {
    const res = await request(app)
      .post('/confirmar-redefinicao-senha')
      .send({ token: 'token-qualquer', nova_senha: '123' });

    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });
});
