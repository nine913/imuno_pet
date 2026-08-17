const db = require('../../../db');
const gestorService = require('../../../services/gestorService');
const bcrypt = require('bcrypt');


jest.mock('../../../db');
jest.mock('bcrypt');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TEST-GES-001 - dashboard sem clínica', () => {
  it('Deve retornar estrutura vazia quando id_clinica não for informado', async () => {
    const resultado = await gestorService.dadosDashboard({});

    expect(resultado).toEqual({
      kpis: null,
      vacinasAplicadas: [],
      coberturaEspecie: [],
      atendimentosMes: [],
      aplicacoesVet: [],
      clinica: null
    });

    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('TEST-GES-002 - dashboard com dados', () => {
  it('Deve retornar dados completos do dashboard', async () => {
    db.query
      .mockResolvedValueOnce([
        [{
          total_aplicadas: 10,
          total_atrasadas: 2,
          total_pendentes: 3,
          total_animais: 8
        }]
      ])
      .mockResolvedValueOnce([
        [{ nome_vacina: 'V10', quantidade: 5 }]
      ])
      .mockResolvedValueOnce([
        [{ especie: 'Cachorro', quantidade: 7 }]
      ])
      .mockResolvedValueOnce([
        [{ mes: '2026-06', quantidade: 10 }]
      ])
      .mockResolvedValueOnce([
        [{ nome_completo: 'Dr. João', quantidade: 10 }]
      ])
      .mockResolvedValueOnce([
        [{ id_clinica: 1, nome: 'Clínica Teste' }]
      ]);

    const resultado = await gestorService.dadosDashboard({
      id_clinica: 1
    });

    expect(resultado).toEqual({
      kpis: {
        total_aplicadas: 10,
        total_atrasadas: 2,
        total_pendentes: 3,
        total_animais: 8
      },
      vacinasAplicadas: [
        {
          nome_vacina: 'V10',
          quantidade: 5
        }
      ],
      coberturaEspecie: [
        {
          especie: 'Cachorro',
          quantidade: 7
        }
      ],
      atendimentosMes: [
        {
          mes: '2026-06',
          quantidade: 10
        }
      ],
      aplicacoesVet: [
        {
          nome_completo: 'Dr. João',
          quantidade: 10
        }
      ],
      clinica: {
        id_clinica: 1,
        nome: 'Clínica Teste'
      }
    });

    expect(db.query).toHaveBeenCalledTimes(6);
  });
});

describe('TEST-GES-003 - relatório sem clínica', () => {
  it('Deve retornar array vazio quando id_clinica não for informado', async () => {
    const resultado = await gestorService.relatoriosAvancados({});

    expect(resultado).toEqual([]);

    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('TEST-GES-004 - relatório sem filtros', () => {
  it('Deve retornar relatório sem aplicar filtros adicionais', async () => {
    const relatorioMock = [
      {
        data_aplicacao: '2026-06-20',
        status: 'APLICADA',
        nome_vacina: 'V10',
        nome_animal: 'Rex'
      }
    ];

    db.query.mockResolvedValueOnce([relatorioMock]);

    const resultado = await gestorService.relatoriosAvancados({
      id_clinica: 1
    });

    expect(resultado).toEqual(relatorioMock);

    expect(db.query).toHaveBeenCalledTimes(1);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('rv.id_clinica = ?'),
      [
        '2000-01-01',
        '2100-12-31',
        '2000-01-01',
        '2100-12-31',
        1
      ]
    );
  });
});

describe('TEST-GES-005 - relatório com filtros', () => {
  it('Deve aplicar todos os filtros informados', async () => {
    const relatorioMock = [
      {
        nome_animal: 'Rex',
        nome_vacina: 'V10',
        status: 'APLICADA'
      }
    ];

    db.query.mockResolvedValueOnce([relatorioMock]);

    const resultado = await gestorService.relatoriosAvancados({
      id_clinica: 1,
      vacina: 2,
      especie: 'CANINO',
      bairro: 'Centro',
      status: 'APLICADA',
      aplicante: 5
    });

    expect(resultado).toEqual(relatorioMock);

    expect(db.query).toHaveBeenCalledTimes(1);

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('rv.id_vacina = ?');
    expect(sql).toContain('a.especie = ?');
    expect(sql).toContain('t.bairro LIKE ?');
    expect(sql).toContain('rv.status = ?');
    expect(sql).toContain('rv.id_veterinario = ?');

    expect(params).toEqual([
      '2000-01-01',
      '2100-12-31',
      '2000-01-01',
      '2100-12-31',
      1,
      2,
      'CANINO',
      '%Centro%',
      'APLICADA',
      5
    ]);
  });
});

describe('TEST-GES-006 - listar veterinários sem clínica', () => {
  it('Deve retornar array vazio quando id_clinica não for informado', async () => {
    const resultado = await gestorService.veterinariosLista({});

    expect(resultado).toEqual([]);

    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('TEST-GES-007 - listar veterinários com termo', () => {
  it('Deve listar veterinários utilizando termo de pesquisa', async () => {
    const vetsMock = [
      {
        id_veterinario: 1,
        nome_completo: 'Dr. João',
        crmv: 'CRMV123'
      }
    ];

    db.query.mockResolvedValueOnce([vetsMock]);

    const resultado = await gestorService.veterinariosLista({
      id_clinica: 1,
      termo: 'joão'
    });

    expect(resultado).toEqual(vetsMock);

    expect(db.query).toHaveBeenCalledTimes(1);

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('v.nome_completo LIKE ?');
    expect(sql).toContain('v.crmv LIKE ?');
    expect(sql).toContain('u.email LIKE ?');

    expect(params).toEqual([
      '%joão%',
      '%joão%',
      '%joão%',
      1
    ]);
  });
});

describe('TEST-GES-008 - listar veterinários sem termo', () => {
  it('Deve utilizar "%" quando termo não for informado', async () => {
    const vetsMock = [
      {
        id_veterinario: 1,
        nome_completo: 'Dr. João',
        crmv: 'CRMV123',
        email: 'joao@vet.com'
      }
    ];

    db.query.mockResolvedValueOnce([vetsMock]);

    const resultado = await gestorService.veterinariosLista({
      id_clinica: 1
    });

    expect(resultado).toEqual(vetsMock);

    expect(db.query).toHaveBeenCalledTimes(1);

    const [sql, params] = db.query.mock.calls[0];

    expect(params).toEqual([
      '%',
      '%',
      '%',
      1
    ]);

    expect(sql).toContain('v.nome_completo LIKE ?');
    expect(sql).toContain('v.crmv LIKE ?');
    expect(sql).toContain('u.email LIKE ?');
  });
});

describe('TEST-GES-009 - cadastrar veterinário com sucesso', () => {
  it('Deve cadastrar veterinário corretamente', async () => {
    // email não existe
    db.query.mockResolvedValueOnce([[]]);

    // CRMV não existe
    db.query.mockResolvedValueOnce([[]]);

    // insert usuario
    db.query.mockResolvedValueOnce([{ insertId: 10 }]);

    // insert veterinario
    db.query.mockResolvedValueOnce([{}]);

    bcrypt.hash.mockResolvedValueOnce('senha_hash');

    await gestorService.cadastrarVet({
      nome_completo: 'Dr. João',
      crmv: 'CRMV123',
      email: 'joao@vet.com',
      senha: '123456',
      id_clinica: 1
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);

    expect(db.query).toHaveBeenCalledTimes(4);

    const calls = db.query.mock.calls;

    expect(calls[0][0]).toContain('SELECT * FROM usuario');
    expect(calls[1][0]).toContain('SELECT * FROM veterinario');
    expect(calls[2][0]).toContain('INSERT INTO usuario');
    expect(calls[2][1][0]).toBe('joao@vet.com');
    expect(calls[2][1][1]).toBe('senha_hash');

    expect(calls[3][0]).toContain('INSERT INTO veterinario');
    expect(calls[3][1]).toEqual([
      10,
      1,
      'Dr. João',
      'CRMV123'
    ]);
  });
});

describe('TEST-GES-010 - cadastrar veterinário com e-mail existente', () => {
  it('Deve lançar erro quando e-mail já existir no sistema', async () => {
    db.query.mockResolvedValueOnce([
      [{ id_usuario: 1, email: 'joao@vet.com' }]
    ]);

    await expect(
      gestorService.cadastrarVet({
        nome_completo: 'Dr. João',
        crmv: 'CRMV123',
        email: 'joao@vet.com',
        senha: '123456',
        id_clinica: 1
      })
    ).rejects.toMatchObject({
      message: 'E-mail já cadastrado no sistema.',
      status: 400
    });

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query.mock.calls[0][0]).toContain('SELECT * FROM usuario');
  });
});

describe('TEST-GES-011 - cadastrar veterinário com CRMV existente', () => {
  it('Deve lançar erro quando CRMV já existir no sistema', async () => {
    // email não existe
    db.query.mockResolvedValueOnce([[]]);

    // CRMV já existe
    db.query.mockResolvedValueOnce([
      [{ id_veterinario: 1, crmv: 'CRMV123' }]
    ]);

    await expect(
      gestorService.cadastrarVet({
        nome_completo: 'Dr. João',
        crmv: 'CRMV123',
        email: 'joao@vet.com',
        senha: '123456',
        id_clinica: 1
      })
    ).rejects.toMatchObject({
      message: 'CRMV já cadastrado.',
      status: 400
    });

    expect(db.query).toHaveBeenCalledTimes(2);

    const calls = db.query.mock.calls;

    expect(calls[0][0]).toContain('SELECT * FROM usuario');
    expect(calls[1][0]).toContain('SELECT * FROM veterinario');
  });
});

describe('TEST-GES-012 - editar veterinário', () => {
  it('Deve atualizar os dados do veterinário e usuário', async () => {
    db.query.mockResolvedValueOnce([{}]); // update veterinario
    db.query.mockResolvedValueOnce([{}]); // update usuario

    await gestorService.editarVet(1, {
      nome_completo: 'Dr. João Atualizado',
      crmv: 'CRMV999',
      email: 'joao@novo.com',
      id_usuario: 10
    });

    expect(db.query).toHaveBeenCalledTimes(2);

    const calls = db.query.mock.calls;

    expect(calls[0][0]).toContain('UPDATE veterinario');
    expect(calls[0][1]).toEqual([
      'Dr. João Atualizado',
      'CRMV999',
      1
    ]);

    expect(calls[1][0]).toContain('UPDATE usuario');
    expect(calls[1][1]).toEqual([
      'joao@novo.com',
      10
    ]);
  });
});

describe('TEST-GES-013 - deletar veterinário', () => {
  it('Deve deletar veterinário e usuário com sucesso', async () => {
    // não possui vacinas vinculadas
    db.query.mockResolvedValueOnce([[{ total: 0 }]]);

    // retorna id_usuario do veterinário
    db.query.mockResolvedValueOnce([[{ id_usuario: 10 }]]);

    // delete veterinário
    db.query.mockResolvedValueOnce([{}]);

    // delete usuário
    db.query.mockResolvedValueOnce([{}]);

    await gestorService.deletarVet(1);

    expect(db.query).toHaveBeenCalledTimes(4);

    const calls = db.query.mock.calls;

    expect(calls[0][0]).toContain('SELECT COUNT(*)');
    expect(calls[1][0]).toContain('SELECT id_usuario');

    expect(calls[2][0]).toContain('DELETE FROM veterinario');
    expect(calls[2][1]).toEqual([1]);

    expect(calls[3][0]).toContain('DELETE FROM usuario');
    expect(calls[3][1]).toEqual([10]);
  });
});

describe('TEST-GES-014 - bloquear exclusão de veterinário com vacinas', () => {
  it('Deve bloquear exclusão quando houver vacinas vinculadas', async () => {
    // veterinário possui vacinas
    db.query.mockResolvedValueOnce([
      [{ total: 3 }]
    ]);

    await expect(
      gestorService.deletarVet(1)
    ).rejects.toMatchObject({
      message: 'Exclusão bloqueada: O veterinário possui registros de vacinas aplicadas.',
      status: 400
    });

    expect(db.query).toHaveBeenCalledTimes(1);

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('SELECT COUNT(*)');
    expect(params).toEqual([1]);
  });
});

describe('TEST-GES-015 - deletar veterinário inexistente', () => {
  it('Deve lançar erro quando veterinário não for encontrado', async () => {
    // não há vacinas vinculadas
    db.query.mockResolvedValueOnce([[{ total: 0 }]]);

    // veterinário não existe
    db.query.mockResolvedValueOnce([[]]);

    await expect(
      gestorService.deletarVet(999)
    ).rejects.toMatchObject({
      message: 'Veterinário não encontrado',
      status: 404
    });

    expect(db.query).toHaveBeenCalledTimes(2);

    const calls = db.query.mock.calls;

    expect(calls[0][0]).toContain('SELECT COUNT(*)');
    expect(calls[1][0]).toContain('SELECT id_usuario');
    expect(calls[1][1]).toEqual([999]);
  });
});