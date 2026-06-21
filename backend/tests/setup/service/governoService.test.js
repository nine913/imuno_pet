const db = require('../../db');
const governoService = require('../../services/governoService');
const bcrypt = require('bcrypt');


jest.mock('../../db');
jest.mock('bcrypt');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TEST-GOV-001 - dadosEpidemiologicos() query vazia', () => {

  it('Deve retornar estrutura completa sem filtros', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Centro',
        cidade: 'Belém',
        total_aplicadas: 10,
        total_atrasadas: 2,
        total_pendentes: 1
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'CANINA',
        total_vacinados: 15
      }
    ];

    const mockEvolucao = [
      {
        mes: '2026-01',
        quantidade: 5
      }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V8',
        quantidade: 7
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const result = await governoService.dadosEpidemiologicos({});

    expect(result).toHaveProperty('riscoRegiao');
    expect(result).toHaveProperty('coberturaEspecie');
    expect(result).toHaveProperty('evolucaoTemporal');
    expect(result).toHaveProperty('topVacinas');

    expect(result.riscoRegiao).toEqual(mockRiscoRegiao);
    expect(result.coberturaEspecie).toEqual(mockCoberturaEspecie);
    expect(result.evolucaoTemporal).toEqual(mockEvolucao);
    expect(result.topVacinas).toEqual(mockTopVacinas);

    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-002 - dadosEpidemiologicos() filtro por espécie', () => {

  it('Deve aplicar filtro de espécie corretamente nas queries', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Centro',
        cidade: 'Belém',
        total_aplicadas: 5,
        total_atrasadas: 1,
        total_pendentes: 0
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'CANINA',
        total_vacinados: 8
      }
    ];

    const mockEvolucao = [
      {
        mes: '2026-01',
        quantidade: 3
      }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V8',
        quantidade: 4
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const query = {
      especie: 'CANINA'
    };

    const result = await governoService.dadosEpidemiologicos(query);

    // Validação do retorno
    expect(result.coberturaEspecie).toEqual(mockCoberturaEspecie);

    // Validação do SQL (riscoRegiao)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('a.especie = ?'),
      expect.arrayContaining(['CANINA'])
    );

    // Validação geral
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-003 - dadosEpidemiologicos() filtro por localidade', () => {

  it('Deve aplicar filtro de localidade corretamente (cidade/bairro)', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Marco',
        cidade: 'Belém',
        total_aplicadas: 6,
        total_atrasadas: 2,
        total_pendentes: 1
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'CANINA',
        total_vacinados: 10
      }
    ];

    const mockEvolucao = [
      {
        mes: '2026-02',
        quantidade: 4
      }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V10',
        quantidade: 6
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const query = {
      localidade: 'Belém'
    };

    const result = await governoService.dadosEpidemiologicos(query);

    // valida retorno
    expect(result.riscoRegiao).toEqual(mockRiscoRegiao);

    // valida aplicação do LIKE no SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('(t.cidade LIKE ? OR t.bairro LIKE ?)'),
      expect.arrayContaining(['%Belém%', '%Belém%'])
    );

    // garante execução completa
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-004 - dadosEpidemiologicos() filtros combinados', () => {

  it('Deve aplicar corretamente espécie e localidade juntos', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Marco',
        cidade: 'Belém',
        total_aplicadas: 3,
        total_atrasadas: 1,
        total_pendentes: 0
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'FELINA',
        total_vacinados: 5
      }
    ];

    const mockEvolucao = [
      {
        mes: '2026-03',
        quantidade: 2
      }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V4',
        quantidade: 3
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const query = {
      especie: 'FELINA',
      localidade: 'Belém'
    };

    const result = await governoService.dadosEpidemiologicos(query);

    // valida retorno principal
    expect(result.riscoRegiao).toEqual(mockRiscoRegiao);

    // valida presença do filtro de espécie
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('a.especie = ?'),
      expect.any(Array)
    );

    // valida presença do filtro de localidade
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('(t.cidade LIKE ? OR t.bairro LIKE ?)'),
      expect.any(Array)
    );

    // valida execução completa
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-005 - dadosEpidemiologicos() filtro de datas', () => {

  it('Deve aplicar corretamente o filtro de intervalo de datas em todas as queries', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Cidade Nova',
        cidade: 'Belém',
        total_aplicadas: 7,
        total_atrasadas: 2,
        total_pendentes: 1
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'CANINA',
        total_vacinados: 12
      }
    ];

    const mockEvolucao = [
      {
        mes: '2026-05',
        quantidade: 6
      }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V8',
        quantidade: 9
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const query = {
      inicio: '2026-01-01',
      fim: '2026-12-31'
    };

    const result = await governoService.dadosEpidemiologicos(query);

    // valida retorno básico
    expect(result.riscoRegiao).toEqual(mockRiscoRegiao);
    expect(result.coberturaEspecie).toEqual(mockCoberturaEspecie);
    expect(result.evolucaoTemporal).toEqual(mockEvolucao);
    expect(result.topVacinas).toEqual(mockTopVacinas);

    // valida se datas foram aplicadas na query principal
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      expect.arrayContaining(['2026-01-01', '2026-12-31'])
    );

    // garante execução completa do fluxo
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-006 - dadosEpidemiologicos() agrupamento por região', () => {

  it('Deve agrupar corretamente por cidade e bairro e ordenar por risco', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Marco',
        cidade: 'Belém',
        total_aplicadas: 10,
        total_atrasadas: 5,
        total_pendentes: 2
      },
      {
        bairro: 'Centro',
        cidade: 'Ananindeua',
        total_aplicadas: 8,
        total_atrasadas: 1,
        total_pendentes: 0
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'CANINA',
        total_vacinados: 18
      }
    ];

    const mockEvolucao = [
      {
        mes: '2026-06',
        quantidade: 7
      }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V10',
        quantidade: 11
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const result = await governoService.dadosEpidemiologicos({});

    // valida retorno principal
    expect(result.riscoRegiao).toEqual(mockRiscoRegiao);

    // valida estrutura do agrupamento SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('GROUP BY t.cidade, t.bairro'),
      expect.any(Array)
    );

    // valida ordenação por risco (atrasadas)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY total_atrasadas DESC'),
      expect.any(Array)
    );

    // garante fluxo completo
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-007 - dadosEpidemiologicos() top vacinas', () => {

  it('Deve retornar apenas as 5 vacinas mais aplicadas ordenadas por quantidade', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Marco',
        cidade: 'Belém',
        total_aplicadas: 12,
        total_atrasadas: 3,
        total_pendentes: 1
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'CANINA',
        total_vacinados: 20
      }
    ];

    const mockEvolucao = [
      {
        mes: '2026-06',
        quantidade: 8
      }
    ];

    const mockTopVacinas = [
      { nome_vacina: 'V10', quantidade: 15 },
      { nome_vacina: 'V8', quantidade: 12 },
      { nome_vacina: 'Raiva', quantidade: 10 },
      { nome_vacina: 'Giárdia', quantidade: 8 },
      { nome_vacina: 'Leptospirose', quantidade: 6 }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const result = await governoService.dadosEpidemiologicos({});

    // valida retorno
    expect(result.topVacinas).toEqual(mockTopVacinas);

    // valida LIMIT 5 no SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('LIMIT 5'),
      expect.any(Array)
    );

    // valida ORDER BY por quantidade
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY quantidade DESC'),
      expect.any(Array)
    );

    // garante fluxo completo
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-008 - dadosEpidemiologicos() evolução temporal mensal', () => {

  it('Deve agrupar corretamente por mês e ordenar em ordem crescente', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Umarizal',
        cidade: 'Belém',
        total_aplicadas: 9,
        total_atrasadas: 2,
        total_pendentes: 1
      }
    ];

    const mockCoberturaEspecie = [
      {
        especie: 'FELINA',
        total_vacinados: 14
      }
    ];

    const mockEvolucao = [
      { mes: '2026-01', quantidade: 4 },
      { mes: '2026-02', quantidade: 6 },
      { mes: '2026-03', quantidade: 8 }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V8',
        quantidade: 10
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const result = await governoService.dadosEpidemiologicos({});

    // valida retorno da evolução temporal
    expect(result.evolucaoTemporal).toEqual(mockEvolucao);

    // valida formato do agrupamento mensal
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("DATE_FORMAT(rv.data_aplicacao, '%Y-%m')"),
      expect.any(Array)
    );

    // valida ordenação crescente por mês
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('GROUP BY mes'),
      expect.any(Array)
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY mes ASC'),
      expect.any(Array)
    );

    // garante fluxo completo
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-009 - dadosEpidemiologicos() cobertura por espécie', () => {

  it('Deve retornar corretamente a cobertura de vacinação por espécie', async () => {

    const mockRiscoRegiao = [
      {
        bairro: 'Marco',
        cidade: 'Belém',
        total_aplicadas: 11,
        total_atrasadas: 3,
        total_pendentes: 1
      }
    ];

    const mockCoberturaEspecie = [
      { especie: 'CANINA', total_vacinados: 18 },
      { especie: 'FELINA', total_vacinados: 12 }
    ];

    const mockEvolucao = [
      {
        mes: '2026-04',
        quantidade: 7
      }
    ];

    const mockTopVacinas = [
      {
        nome_vacina: 'V10',
        quantidade: 13
      }
    ];

    db.query
      .mockResolvedValueOnce([mockRiscoRegiao])
      .mockResolvedValueOnce([mockCoberturaEspecie])
      .mockResolvedValueOnce([mockEvolucao])
      .mockResolvedValueOnce([mockTopVacinas]);

    const result = await governoService.dadosEpidemiologicos({});

    // valida retorno da cobertura
    expect(result.coberturaEspecie).toEqual(mockCoberturaEspecie);

    // valida SQL de agrupamento por espécie
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('GROUP BY a.especie'),
      expect.any(Array)
    );

    // valida filtro de status aplicado corretamente
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("rv.status = 'APLICADA'"),
      expect.any(Array)
    );

    // garante execução completa do fluxo
    expect(db.query).toHaveBeenCalledTimes(4);
  });

});

describe('TEST-GOV-010 - relatoriosAvancados() sem filtros', () => {

  it('Deve retornar relatório completo sem filtros adicionais', async () => {

    const mockRelatorio = [
      {
        data_aplicacao: '2026-01-10',
        data_proxima_dose: '2026-07-10',
        status: 'APLICADA',
        nome_vacina: 'V10',
        nome_animal: 'Rex',
        especie: 'CANINA',
        raca: 'Labrador',
        nome_tutor: 'João Silva',
        bairro: 'Marco',
        cidade: 'Belém',
        telefone: '91999999999'
      },
      {
        data_aplicacao: '2026-02-15',
        data_proxima_dose: '2026-08-15',
        status: 'ATRASADA',
        nome_vacina: 'V8',
        nome_animal: 'Mimi',
        especie: 'FELINA',
        raca: 'Siamês',
        nome_tutor: 'Maria Souza',
        bairro: 'Umarizal',
        cidade: 'Belém',
        telefone: '91888888888'
      }
    ];

    db.query.mockResolvedValue([mockRelatorio]);

    const query = {
      inicio: '2026-01-01',
      fim: '2026-12-31'
    };

    const result = await governoService.relatoriosAvancados(query);

    // valida retorno direto
    expect(result).toEqual(mockRelatorio);

    // valida filtro de data base (janela temporal)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      expect.arrayContaining(['2026-01-01', '2026-12-31', '2026-01-01', '2026-12-31'])
    );

    // valida JOINs principais do relatório
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('JOIN vacina'),
      expect.any(Array)
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('JOIN animal'),
      expect.any(Array)
    );

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('JOIN tutor'),
      expect.any(Array)
    );

    // garante execução única da query
    expect(db.query).toHaveBeenCalledTimes(1);
  });

});

describe('TEST-GOV-011 - relatoriosAvancados() filtro por vacina', () => {

  it('Deve filtrar corretamente os resultados por id_vacina', async () => {

    const mockRelatorio = [
      {
        data_aplicacao: '2026-03-10',
        data_proxima_dose: '2026-09-10',
        status: 'APLICADA',
        nome_vacina: 'V10',
        nome_animal: 'Thor',
        especie: 'CANINA',
        raca: 'Pastor Alemão',
        nome_tutor: 'Carlos Lima',
        bairro: 'Marco',
        cidade: 'Belém',
        telefone: '91911111111'
      }
    ];

    db.query.mockResolvedValue([mockRelatorio]);

    const query = {
      inicio: '2026-01-01',
      fim: '2026-12-31',
      vacina: 3
    };

    const result = await governoService.relatoriosAvancados(query);

    // valida retorno
    expect(result).toEqual(mockRelatorio);

    // valida aplicação do filtro de vacina no SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('rv.id_vacina = ?'),
      expect.arrayContaining([3])
    );

    // valida intervalo de datas ainda presente
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      expect.any(Array)
    );

    // garante apenas 1 execução da query
    expect(db.query).toHaveBeenCalledTimes(1);
  });

});

describe('TEST-GOV-012 - relatoriosAvancados() filtro por espécie', () => {

  it('Deve filtrar corretamente os resultados por espécie', async () => {

    const mockRelatorio = [
      {
        data_aplicacao: '2026-04-12',
        data_proxima_dose: '2026-10-12',
        status: 'APLICADA',
        nome_vacina: 'V8',
        nome_animal: 'Mel',
        especie: 'CANINA',
        raca: 'Poodle',
        nome_tutor: 'Ana Souza',
        bairro: 'Umarizal',
        cidade: 'Belém',
        telefone: '91922222222'
      }
    ];

    db.query.mockResolvedValue([mockRelatorio]);

    const query = {
      inicio: '2026-01-01',
      fim: '2026-12-31',
      especie: 'CANINA'
    };

    const result = await governoService.relatoriosAvancados(query);

    // valida retorno
    expect(result).toEqual(mockRelatorio);

    // valida filtro de espécie aplicado no SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('a.especie = ?'),
      expect.arrayContaining(['CANINA'])
    );

    // valida manutenção do filtro de data
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      expect.any(Array)
    );

    // garante execução única da query
    expect(db.query).toHaveBeenCalledTimes(1);
  });

});

describe('TEST-GOV-013 - relatoriosAvancados() filtro por bairro', () => {

  it('Deve filtrar corretamente os resultados por bairro usando LIKE', async () => {

    const mockRelatorio = [
      {
        data_aplicacao: '2026-05-10',
        data_proxima_dose: '2026-11-10',
        status: 'APLICADA',
        nome_vacina: 'V10',
        nome_animal: 'Bolt',
        especie: 'CANINA',
        raca: 'Husky',
        nome_tutor: 'Pedro Lima',
        bairro: 'Marco',
        cidade: 'Belém',
        telefone: '91933333333'
      }
    ];

    db.query.mockResolvedValue([mockRelatorio]);

    const query = {
      inicio: '2026-01-01',
      fim: '2026-12-31',
      bairro: 'Mar'
    };

    const result = await governoService.relatoriosAvancados(query);

    // valida retorno
    expect(result).toEqual(mockRelatorio);

    // valida aplicação do LIKE no SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('t.bairro LIKE ?'),
      expect.arrayContaining(['%Mar%'])
    );

    // valida manutenção do filtro de data
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      expect.any(Array)
    );

    // garante execução única da query
    expect(db.query).toHaveBeenCalledTimes(1);
  });

});

describe('TEST-GOV-014 - relatoriosAvancados() filtro por status', () => {

  it('Deve filtrar corretamente os resultados por status da vacinação', async () => {

    const mockRelatorio = [
      {
        data_aplicacao: '2026-06-01',
        data_proxima_dose: '2026-12-01',
        status: 'ATRASADA',
        nome_vacina: 'V8',
        nome_animal: 'Luna',
        especie: 'FELINA',
        raca: 'Siamês',
        nome_tutor: 'Mariana Costa',
        bairro: 'Umarizal',
        cidade: 'Belém',
        telefone: '91944444444'
      }
    ];

    db.query.mockResolvedValue([mockRelatorio]);

    const query = {
      inicio: '2026-01-01',
      fim: '2026-12-31',
      status: 'ATRASADA'
    };

    const result = await governoService.relatoriosAvancados(query);

    // valida retorno
    expect(result).toEqual(mockRelatorio);

    // valida aplicação do filtro de status no SQL
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('rv.status = ?'),
      expect.arrayContaining(['ATRASADA'])
    );

    // valida manutenção do filtro de data
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      expect.any(Array)
    );

    // garante execução única da query
    expect(db.query).toHaveBeenCalledTimes(1);
  });

});

describe('TEST-GOV-015 - relatoriosAvancados() múltiplos filtros', () => {

  it('Deve aplicar corretamente todos os filtros combinados', async () => {

    const mockRelatorio = [
      {
        data_aplicacao: '2026-07-10',
        data_proxima_dose: '2027-01-10',
        status: 'APLICADA',
        nome_vacina: 'V10',
        nome_animal: 'Max',
        especie: 'CANINA',
        raca: 'Golden Retriever',
        nome_tutor: 'João Pedro',
        bairro: 'Marco',
        cidade: 'Belém',
        telefone: '91955555555'
      }
    ];

    db.query.mockResolvedValue([mockRelatorio]);

    const query = {
      inicio: '2026-01-01',
      fim: '2026-12-31',
      vacina: 2,
      especie: 'CANINA',
      bairro: 'Mar',
      status: 'APLICADA'
    };

    const result = await governoService.relatoriosAvancados(query);

    // valida retorno
    expect(result).toEqual(mockRelatorio);

    // valida filtro de vacina
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('rv.id_vacina = ?'),
      expect.any(Array)
    );

    // valida filtro de espécie
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('a.especie = ?'),
      expect.any(Array)
    );

    // valida filtro de bairro (LIKE)
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('t.bairro LIKE ?'),
      expect.any(Array)
    );

    // valida filtro de status
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('rv.status = ?'),
      expect.any(Array)
    );

    // valida base temporal
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('BETWEEN ? AND ?'),
      expect.any(Array)
    );

    // garante execução única da query
    expect(db.query).toHaveBeenCalledTimes(1);
  });

});