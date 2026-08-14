process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

jest.mock('../../../db');
jest.mock('bcrypt');
jest.mock('../../../services/emailService');

const request = require('supertest');
const db = require('../../../db');
const bcrypt = require('bcrypt');
const app = require('../../../app');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TEST-AUTHROTAS-001 - fluxo de login/logout', () => {
  test('POST /login com sucesso retorna token', async () => {
    db.query
      .mockResolvedValueOnce([[{ id_usuario: 1, senha: 'hash', perfil: 'ADMINISTRADOR' }]])
      .mockResolvedValueOnce([{}]); // log de auditoria
    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app).post('/login').send({ email: 'admin@x.com', senha: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.perfil).toBe('ADMINISTRADOR');
  });

  test('POST /logout sem token retorna 401', async () => {
    const res = await request(app).post('/logout');
    expect(res.status).toBe(401);
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
