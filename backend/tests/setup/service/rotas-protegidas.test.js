process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

jest.mock('../../../db');

const request = require('supertest');
const db = require('../../../db');
const app = require('../../../app');
const { gerarToken } = require('../../../utils/jwt');

describe('TEST-ROTAS-001 - rotas exigem autenticação', () => {
  test('GET /admin/clinicas sem token retorna 401', async () => {
    const res = await request(app).get('/admin/clinicas');
    expect(res.status).toBe(401);
  });

  test('GET /admin/clinicas com token de TUTOR retorna 403 (perfil errado)', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const res = await request(app).get('/admin/clinicas').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('GET /admin/clinicas com token de ADMINISTRADOR passa da autenticação', async () => {
    db.query.mockResolvedValue([[]]);
    const token = gerarToken({ id_usuario: 1, perfil: 'ADMINISTRADOR' });
    const res = await request(app).get('/admin/clinicas').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('GET /tutor/animais/:id_usuario de outro tutor retorna 403', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const res = await request(app).get('/tutor/animais/2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('POST /login sem e-mail/senha retorna 400 sem tocar no banco', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
  });

  test('GET /avisos não exige autenticação', async () => {
    db.query.mockResolvedValue([[]]);
    const res = await request(app).get('/avisos');
    expect(res.status).toBe(200);
  });
});
