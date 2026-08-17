process.env.JWT_SECRET = process.env.JWT_SECRET || 'segredo-de-teste';

const { gerarToken, verificarToken } = require('../../../utils/jwt');
const { autenticar, autorizar, exigirProprioUsuario, exigirPropriaClinica, forcarClinicaDoUsuario } = require('../../../middleware/auth');

function criarResposta() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('TEST-AUTH-001 - utils/jwt', () => {
  test('gerarToken produz um token que verificarToken consegue decodificar de volta', () => {
    const token = gerarToken({ id_usuario: 7, perfil: 'TUTOR', id_clinica: null, id_especifico: 3, nome: 'Ana' });
    const payload = verificarToken(token);

    expect(payload.id_usuario).toBe(7);
    expect(payload.perfil).toBe('TUTOR');
    expect(payload.id_especifico).toBe(3);
  });

  test('verificarToken lança erro para token inválido', () => {
    expect(() => verificarToken('token-invalido')).toThrow();
  });
});

describe('TEST-AUTH-002 - middleware autenticar', () => {
  test('bloqueia com 401 quando não há header Authorization', () => {
    const req = { headers: {} };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('bloqueia com 401 quando o token é inválido', () => {
    const req = { headers: { authorization: 'Bearer token-invalido' } };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('popula req.user e chama next() quando o token é válido', () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'VETERINARIO', id_clinica: 5, id_especifico: 2, nome: 'Dr. João' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id_usuario).toBe(1);
    expect(req.user.perfil).toBe('VETERINARIO');
  });
});

describe('TEST-AUTH-006 - middleware autenticar via cookie httpOnly + CSRF', () => {
  test('em GET, autentica via cookie sem exigir token CSRF', () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR', id_clinica: null, id_especifico: 3, nome: 'Ana' });
    const req = { method: 'GET', headers: {}, cookies: { token } };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id_usuario).toBe(1);
  });

  test('em POST via cookie, bloqueia com 403 quando o header X-CSRF-Token está ausente', () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const req = { method: 'POST', headers: {}, cookies: { token, csrf_token: 'abc123' } };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('em POST via cookie, bloqueia com 403 quando o header X-CSRF-Token não bate com o cookie', () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const req = {
      method: 'POST',
      headers: { 'x-csrf-token': 'valor-errado' },
      cookies: { token, csrf_token: 'abc123' }
    };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('em POST via cookie, autentica quando o header X-CSRF-Token bate com o cookie', () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const req = {
      method: 'POST',
      headers: { 'x-csrf-token': 'abc123' },
      cookies: { token, csrf_token: 'abc123' }
    };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id_usuario).toBe(1);
  });

  test('Bearer via header continua funcionando em POST, sem exigir CSRF (não é cookie)', () => {
    const token = gerarToken({ id_usuario: 1, perfil: 'TUTOR' });
    const req = { method: 'POST', headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = criarResposta();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('TEST-AUTH-003 - middleware autorizar', () => {
  test('bloqueia com 403 quando o perfil não está na lista permitida', () => {
    const req = { user: { perfil: 'TUTOR' } };
    const res = criarResposta();
    const next = jest.fn();

    autorizar('ADMINISTRADOR', 'GESTOR_CLINICA')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('chama next() quando o perfil está na lista permitida', () => {
    const req = { user: { perfil: 'ADMINISTRADOR' } };
    const res = criarResposta();
    const next = jest.fn();

    autorizar('ADMINISTRADOR', 'GESTOR_CLINICA')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('TEST-AUTH-004 - middleware exigirProprioUsuario', () => {
  test('bloqueia com 403 quando o :id_usuario da rota não é o do token', () => {
    const req = { user: { perfil: 'TUTOR', id_usuario: 1 }, params: { id_usuario: '2' } };
    const res = criarResposta();
    const next = jest.fn();

    exigirProprioUsuario()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('permite quando o :id_usuario da rota é o do token', () => {
    const req = { user: { perfil: 'TUTOR', id_usuario: 1 }, params: { id_usuario: '1' } };
    const res = criarResposta();
    const next = jest.fn();

    exigirProprioUsuario()(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('ADMINISTRADOR sempre passa, mesmo com id_usuario diferente', () => {
    const req = { user: { perfil: 'ADMINISTRADOR', id_usuario: 99 }, params: { id_usuario: '1' } };
    const res = criarResposta();
    const next = jest.fn();

    exigirProprioUsuario()(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('TEST-AUTH-005B - middleware exigirPropriaClinica', () => {
  test('bloqueia com 403 quando o :id da rota não é a clínica do token', () => {
    const req = { user: { perfil: 'GESTOR_CLINICA', id_clinica: 5 }, params: { id: '9' } };
    const res = criarResposta();
    const next = jest.fn();

    exigirPropriaClinica('id')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('permite quando o :id da rota é a clínica do token', () => {
    const req = { user: { perfil: 'GESTOR_CLINICA', id_clinica: 5 }, params: { id: '5' } };
    const res = criarResposta();
    const next = jest.fn();

    exigirPropriaClinica('id')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('ADMINISTRADOR sempre passa, mesmo com id_clinica diferente', () => {
    const req = { user: { perfil: 'ADMINISTRADOR', id_clinica: null }, params: { id: '5' } };
    const res = criarResposta();
    const next = jest.fn();

    exigirPropriaClinica('id')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('TEST-AUTH-005 - middleware forcarClinicaDoUsuario', () => {
  test('sobrescreve id_clinica da query para VETERINARIO', () => {
    const req = { user: { perfil: 'VETERINARIO', id_clinica: 5 }, query: { id_clinica: '999' } };
    const res = criarResposta();
    const next = jest.fn();

    forcarClinicaDoUsuario(req, res, next);

    expect(req.query.id_clinica).toBe(5);
    expect(next).toHaveBeenCalled();
  });

  test('não altera id_clinica para ADMINISTRADOR', () => {
    const req = { user: { perfil: 'ADMINISTRADOR', id_clinica: null }, query: { id_clinica: '999' } };
    const res = criarResposta();
    const next = jest.fn();

    forcarClinicaDoUsuario(req, res, next);

    expect(req.query.id_clinica).toBe('999');
    expect(next).toHaveBeenCalled();
  });
});
