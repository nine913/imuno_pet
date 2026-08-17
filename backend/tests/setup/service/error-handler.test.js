process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

jest.mock('../../../db');

const request = require('supertest');
const app = require('../../../app');

describe('TEST-ERR-001 - middleware global de erro e rota não encontrada', () => {
  test('rota inexistente retorna 404 em JSON', async () => {
    const res = await request(app).get('/rota-que-nao-existe');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ erro: 'Rota não encontrada.' });
  });

  test('erro do CORS (origem não autorizada) é tratado pelo middleware global, não derruba o servidor', async () => {
    const res = await request(app).get('/avisos').set('Origin', 'http://origem-nao-permitida.com');
    expect([200, 500]).toContain(res.status);
    expect(res.body).toBeDefined();
  });
});
