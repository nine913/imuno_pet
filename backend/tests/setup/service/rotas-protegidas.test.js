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

describe('TEST-ROTAS-002 - catálogos compartilhados (/admin/especies, /admin/racas, /admin/vacinas)', () => {
  test('GET /admin/especies com token de VETERINARIO retorna 200 (catálogo compartilhado)', async () => {
    db.query.mockResolvedValue([[]]);
    const token = gerarToken({ id_usuario: 1, perfil: 'VETERINARIO' });
    const res = await request(app).get('/admin/especies').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('GET /admin/vacinas com token de GOVERNO retorna 200 (leitura de catálogo permitida)', async () => {
    db.query.mockResolvedValue([[]]);
    const token = gerarToken({ id_usuario: 1, perfil: 'GOVERNO' });
    const res = await request(app).get('/admin/vacinas').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('GET /admin/especies com token de TUTOR retorna 403 (fora do catálogo compartilhado)', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const res = await request(app).get('/admin/especies').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('PUT /admin/editar-vacina/:id com token de VETERINARIO retorna 403 (edição do catálogo global é só do ADMINISTRADOR)', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'VETERINARIO' });
    const res = await request(app).put('/admin/editar-vacina/1').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(403);
  });
});

describe('TEST-ROTAS-004 - GET /vacinas permite leitura do catálogo por GOVERNO', () => {
  test('GOVERNO consegue listar o catálogo de vacinas (usado nos filtros de relatório)', async () => {
    db.query.mockResolvedValue([[]]);
    const token = gerarToken({ id_usuario: 1, perfil: 'GOVERNO' });
    const res = await request(app).get('/vacinas').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('TUTOR não tem acesso ao catálogo de vacinas', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const res = await request(app).get('/vacinas').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe('TEST-ROTAS-003 - GET /admin/clinicas/:id exige que o gestor consulte a própria clínica', () => {
  test('gestor consultando a própria clínica retorna 200', async () => {
    db.query.mockResolvedValue([[{ id_clinica: 5, nome_fantasia: 'Clínica X' }]]);
    const token = gerarToken({ id_usuario: 1, perfil: 'GESTOR_CLINICA', id_clinica: 5 });
    const res = await request(app).get('/admin/clinicas/5').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  test('gestor tentando consultar outra clínica pela URL retorna 403', async () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'GESTOR_CLINICA', id_clinica: 5 });
    const res = await request(app).get('/admin/clinicas/9').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('administrador pode consultar qualquer clínica', async () => {
    db.query.mockResolvedValue([[{ id_clinica: 9, nome_fantasia: 'Clínica Y' }]]);
    const token = gerarToken({ id_usuario: 1, perfil: 'ADMINISTRADOR' });
    const res = await request(app).get('/admin/clinicas/9').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
