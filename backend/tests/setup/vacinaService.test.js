jest.mock('../../db', () => ({
  query: jest.fn()
}));

const db = require('../../db');
const vacinaService = require('../../services/vacinaService');

describe('TEST-VAC-000 - vacinaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST-VAC-000
  describe('TEST-VAC-003 - cadastrarVacina()', () => {

    it('Deve cadastrar uma vacina corretamente', async () => {
  db.query.mockResolvedValueOnce([]);

  const dadosVacina = {
    nome_vacina: 'V10',
    doencas_prevenidas: 'Cinomose, Parvovirose',
    fabricante: 'Zoetis',
    intervalo_doses_dias: 365
  };

  await vacinaService.cadastrarVacina(dadosVacina);

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO vacina (nome_vacina, doencas_prevenidas, fabricante, intervalo_doses_dias) VALUES (?, ?, ?, ?)',
    [
      'V10',
      'Cinomose, Parvovirose',
      'Zoetis',
      365
    ]
  );
});

  });

  // TEST-VAC-004 e 005
  describe('TEST-VAC-004 / TEST-VAC-005 - buscarVacinas()', () => {

    it('Deve buscar vacinas utilizando um termo de pesquisa', async () => {
  const vacinasMock = [
    {
      id_vacina: 1,
      nome_vacina: 'V10',
      doencas_prevenidas: 'Cinomose',
      fabricante: 'Zoetis',
      intervalo_doses_dias: 365
    }
  ];

  db.query.mockResolvedValueOnce([vacinasMock]);

  const resultado = await vacinaService.buscarVacinas({
    termo: 'V10'
  });

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    expect.stringContaining('SELECT id_vacina'),
    ['%V10%', '%V10%', '%V10%']
  );

  expect(resultado).toEqual(vacinasMock);
});

    it('Deve buscar todas as vacinas quando nenhum termo for informado', async () => {
  const vacinasMock = [
    {
      id_vacina: 1,
      nome_vacina: 'V10'
    },
    {
      id_vacina: 2,
      nome_vacina: 'Antirrábica'
    }
  ];

  db.query.mockResolvedValueOnce([vacinasMock]);

  const resultado = await vacinaService.buscarVacinas({});

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    expect.stringContaining('SELECT id_vacina'),
    ['%', '%', '%']
  );

  expect(resultado).toEqual(vacinasMock);
});

    
  });

  // TEST-VAC-006
  describe('TEST-VAC-006 - editarVacina()', () => {

    it('Deve editar uma vacina corretamente', async () => {
  db.query.mockResolvedValueOnce([]);

  const idVacina = 1;

  const dadosAtualizados = {
    nome_vacina: 'V10 Atualizada',
    doencas_prevenidas: 'Cinomose, Parvovirose',
    fabricante: 'Zoetis',
    intervalo_doses_dias: 365
  };

  await vacinaService.editarVacina(idVacina, dadosAtualizados);

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    'UPDATE vacina SET nome_vacina = ?, doencas_prevenidas = ?, fabricante = ?, intervalo_doses_dias = ? WHERE id_vacina = ?',
    [
      'V10 Atualizada',
      'Cinomose, Parvovirose',
      'Zoetis',
      365,
      1
    ]
  );
});

  });

  // TEST-VAC-007
  describe('TEST-VAC-007 - deletarVacina()', () => {

    it('Deve excluir os registros de vacinação e depois a vacina', async () => {
  db.query.mockResolvedValue([]);

  await vacinaService.deletarVacina(1);

  expect(db.query).toHaveBeenCalledTimes(2);

  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'DELETE FROM registro_vacinacao WHERE id_vacina = ?',
    [1]
  );

  expect(db.query).toHaveBeenNthCalledWith(
    2,
    'DELETE FROM vacina WHERE id_vacina = ?',
    [1]
  );
});

  });

  // TEST-VAC-008 e 009
  describe('TEST-VAC-008 / TEST-VAC-009 - historicoPet()', () => {

     it('Deve retornar o histórico do pet sem filtros adicionais', async () => {
  const historicoMock = [
    {
      id_registro: 1,
      id_vacina: 2,
      nome_vacina: 'V10',
      status: 'APLICADA'
    }
  ];

  db.query.mockResolvedValueOnce([historicoMock]);

  const resultado = await vacinaService.historicoPet(10, {
    termo: 'V10'
  });

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    expect.stringContaining('WHERE rv.id_animal = ? AND v.nome_vacina LIKE ?'),
    [10, '%V10%']
  );

  expect(resultado).toEqual(historicoMock);
});


     it('Deve retornar histórico filtrando por status e clínica', async () => {
  const historicoMock = [
    {
      id_registro: 1,
      nome_vacina: 'V10',
      status: 'PENDENTE'
    }
  ];

  db.query.mockResolvedValueOnce([historicoMock]);

  const resultado = await vacinaService.historicoPet(10, {
    termo: 'V10',
    status: 'PENDENTE',
    id_clinica: 5
  });

  expect(db.query).toHaveBeenCalledTimes(1);

  const [sql, params] = db.query.mock.calls[0];

  expect(sql).toContain('AND rv.status = ?');
  expect(sql).toContain('AND rv.id_clinica = ?');

  expect(params).toEqual([
    10,
    '%V10%',
    'PENDENTE',
    5
  ]);

  expect(resultado).toEqual(historicoMock);
});

  });

  // TEST-VAC-010
  describe('TEST-VAC-010 - deletarRegistroVacina()', () => {

    it('Deve excluir um registro de vacinação', async () => {
  db.query.mockResolvedValueOnce([]);

  await vacinaService.deletarRegistroVacina(15);

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    'DELETE FROM registro_vacinacao WHERE id_registro = ?',
    [15]
  );

});

  });

  // TEST-VAC-011 e 012
  describe('TEST-VAC-011 / TEST-VAC-012 - relatorioVacinas()', () => {

    it('Deve gerar relatório sem filtros adicionais', async () => {
  const relatorioMock = [
    {
      nome_vacina: 'V10',
      nome_animal: 'Rex',
      status: 'APLICADA'
    }
  ];

  db.query.mockResolvedValueOnce([relatorioMock]);

  const resultado = await vacinaService.relatorioVacinas({});

  expect(db.query).toHaveBeenCalledTimes(1);

  const [sql, params] = db.query.mock.calls[0];

  expect(sql).toContain(
    'WHERE (rv.data_aplicacao BETWEEN ? AND ? OR rv.data_proxima_dose BETWEEN ? AND ?)'
  );

  expect(params).toEqual([
    '2000-01-01',
    '2100-12-31',
    '2000-01-01',
    '2100-12-31'
  ]);

  expect(resultado).toEqual(relatorioMock);
});

    it('Deve gerar relatório com status, espécie e clínica', async () => {
  const relatorioMock = [
    {
      nome_vacina: 'V10',
      nome_animal: 'Rex',
      especie: 'CÃO',
      status: 'PENDENTE'
    }
  ];

  db.query.mockResolvedValueOnce([relatorioMock]);

  const resultado = await vacinaService.relatorioVacinas({
    inicio: '2025-01-01',
    fim: '2025-12-31',
    status: 'PENDENTE',
    especie: 'CÃO',
    id_clinica: 2
  });

  expect(db.query).toHaveBeenCalledTimes(1);

  const [sql, params] = db.query.mock.calls[0];

  expect(sql).toContain('AND rv.status = ?');
  expect(sql).toContain('AND a.especie = ?');
  expect(sql).toContain('AND rv.id_clinica = ?');

  expect(params).toEqual([
    '2025-01-01',
    '2025-12-31',
    '2025-01-01',
    '2025-12-31',
    'PENDENTE',
    'CÃO',
    2
  ]);

  expect(resultado).toEqual(relatorioMock);
});

  });

  // TEST-VAC-013 e 014
  describe('TEST-VAC-013 / TEST-VAC-014 - registrarVacina()', () => {

     it('Deve registrar vacina aplicada com veterinário encontrado', async () => {
  // 1. Mock da busca do veterinário
  db.query
    .mockResolvedValueOnce([[{ id_veterinario: 99 }]]) // SELECT veterinario
    .mockResolvedValueOnce([]); // INSERT

  const dados = {
    id_animal: 1,
    id_vacina: 2,
    id_clinica: 3,
    data_aplicacao: '2026-01-01',
    data_proxima_dose: '2026-12-01',
    status: 'APLICADA',
    id_usuario: 10
  };

  await vacinaService.registrarVacina(dados);

  expect(db.query).toHaveBeenCalledTimes(2);

  // 1ª query: busca veterinário
  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'SELECT id_veterinario FROM veterinario WHERE id_usuario = ?',
    [10]
  );

  // 2ª query: insert com veterinário encontrado
  expect(db.query).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining('INSERT INTO registro_vacinacao'),
    [
      1,
      2,
      3,
      '2026-01-01',
      '2026-12-01',
      'APLICADA',
      99
    ]
  );
});

      it('Deve registrar vacina sem veterinário quando status não for APLICADA', async () => {
  // Apenas INSERT será chamado (sem SELECT de veterinário)
  db.query.mockResolvedValueOnce([]);

  const dados = {
    id_animal: 1,
    id_vacina: 2,
    id_clinica: 3,
    data_aplicacao: '2026-01-01',
    data_proxima_dose: '2026-12-01',
    status: 'PENDENTE',
    id_usuario: 10
  };

  await vacinaService.registrarVacina(dados);

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO registro_vacinacao'),
    [
      1,
      2,
      3,
      '2026-01-01',
      '2026-12-01',
      'PENDENTE',
      null
    ]
  );
});

  });

  // TEST-VAC-001 e 0002
  describe('TEST-VAC-001 / TEST-VAC-002 - editarRegistroVacina()', () => {

     it('Deve editar registro de vacina sem vincular veterinário quando status não for APLICADA', async () => {
  db.query.mockResolvedValueOnce([]); // apenas UPDATE

  const idRegistro = 10;

  const dados = {
    id_vacina: 2,
    status: 'PENDENTE',
    data_aplicacao: '2026-01-01',
    data_proxima_dose: '2026-12-01',
    id_usuario: 5
  };

  await vacinaService.editarRegistroVacina(idRegistro, dados);

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    expect.stringContaining('UPDATE registro_vacinacao'),
    [
      2,
      'PENDENTE',
      '2026-01-01',
      '2026-12-01',
      null,
      10
    ]
  );
});

     it('Deve editar registro de vacina vinculando veterinário quando status for APLICADA', async () => {
  db.query
    .mockResolvedValueOnce([[{ id_veterinario: 77 }]]) // SELECT veterinário
    .mockResolvedValueOnce([]); // UPDATE

  const idRegistro = 20;

  const dados = {
    id_vacina: 5,
    status: 'APLICADA',
    data_aplicacao: '2026-01-01',
    data_proxima_dose: '2026-12-01',
    id_usuario: 11
  };

  await vacinaService.editarRegistroVacina(idRegistro, dados);

  expect(db.query).toHaveBeenCalledTimes(2);

  // 1ª query: busca veterinário
  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'SELECT id_veterinario FROM veterinario WHERE id_usuario = ?',
    [11]
  );

  // 2ª query: UPDATE com veterinário encontrado
  expect(db.query).toHaveBeenNthCalledWith(
    2,
    expect.stringContaining('UPDATE registro_vacinacao'),
    [
      5,
      'APLICADA',
      '2026-01-01',
      '2026-12-01',
      77,
      20
    ]
  );
});

  });

  // TEST-VAC-015 e 016
  describe('TEST-VAC-015 / TEST-VAC-016 - animaisAtrasados()', () => {

    it('Deve atualizar status e retornar animais atrasados sem filtro de clínica', async () => {
  const atrasadosMock = [
    {
      id_registro: 1,
      nome_vacina: 'V10',
      nome_animal: 'Rex',
      status: 'ATRASADA'
    }
  ];

  db.query
    .mockResolvedValueOnce([]) // UPDATE
    .mockResolvedValueOnce([atrasadosMock]); // SELECT

  const resultado = await vacinaService.animaisAtrasados({});

  expect(db.query).toHaveBeenCalledTimes(2);

  // 1ª query: UPDATE automático
  const updateCall = db.query.mock.calls[0][0];
  const updateParams = db.query.mock.calls[0][1];

  expect(updateCall).toContain('UPDATE registro_vacinacao');
  expect(updateCall).toContain("status = 'ATRASADA'");
  expect(updateParams.length).toBe(1); // apenas a data

  // 2ª query: SELECT sem clínica
  const selectCall = db.query.mock.calls[1][0];
  const selectParams = db.query.mock.calls[1][1];

  expect(selectCall).toContain("WHERE rv.status = 'ATRASADA'");
  expect(selectParams).toEqual([]);

  expect(resultado).toEqual(atrasadosMock);
});

    it('Deve atualizar status e retornar animais atrasados filtrando por clínica', async () => {
  const atrasadosMock = [
    {
      id_registro: 1,
      nome_vacina: 'V10',
      nome_animal: 'Rex',
      nome_tutor: 'João'
    }
  ];

  db.query
    .mockResolvedValueOnce([]) // UPDATE
    .mockResolvedValueOnce([atrasadosMock]); // SELECT

  const resultado = await vacinaService.animaisAtrasados({
    id_clinica: 3
  });

  expect(db.query).toHaveBeenCalledTimes(2);

  // 1ª query: UPDATE automático
  const updateCall = db.query.mock.calls[0][0];
  const updateParams = db.query.mock.calls[0][1];

  expect(updateCall).toContain('UPDATE registro_vacinacao');
  expect(updateCall).toContain("status = 'ATRASADA'");
  expect(updateParams.length).toBe(1);

  // 2ª query: SELECT com filtro de clínica
  const selectCall = db.query.mock.calls[1][0];
  const selectParams = db.query.mock.calls[1][1];

  expect(selectCall).toContain('AND rv.id_clinica = ?');
  expect(selectParams).toEqual([3]);

  expect(resultado).toEqual(atrasadosMock);
});

  });
});