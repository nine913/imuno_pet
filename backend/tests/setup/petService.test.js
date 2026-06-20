// Dependências do projeto (db e service que serão exercitados pelos testes)
const db = require('../../db');
const petService = require('../../services/petService');
const bcrypt = require('bcrypt');

// Mock de dependências externas para isolar a lógica do service
// - db: para simular resultados de consultas SQL
// - bcrypt: para simular geração de hash de senha
jest.mock('../../db');
jest.mock('bcrypt');

describe('TEST-PET-001 - getTutorIdByUsuario()', () => {

  // Limpa mocks entre testes para evitar "vazamento" de chamadas/mockResolvedValue
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar id_tutor quando tutor existir', async () => {
    db.query.mockResolvedValue([
      [
        {
          id_tutor: 15
        }
      ]
    ]);

    const resultado = await petService.getTutorIdByUsuario(1);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT id_tutor FROM tutor WHERE id_usuario = ?',
      [1]
    );

    expect(resultado).toBe(15);
  });

  test('deve retornar null quando tutor não existir', async () => {
    db.query.mockResolvedValue([
      []
    ]);

    const resultado = await petService.getTutorIdByUsuario(999);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT id_tutor FROM tutor WHERE id_usuario = ?',
      [999]
    );

    expect(resultado).toBeNull();
  });

});


describe('TEST-PET-002 - criarPet()', () => {

  // Este bloco valida a criação de um pet via SQL
  // - Cenário 1: tutor existe => deve inserir em `animal`
  // - Cenário 2: tutor não existe => deve lançar erro 404
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve criar pet quando tutor existir', async () => {
    const dadosPet = {
      id_usuario: 1,
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01'
    };

    db.query
      .mockResolvedValueOnce([
        [{ id_tutor: 10 }]
      ])
      .mockResolvedValueOnce([
        { insertId: 1 }
      ]);

    await petService.criarPet(dadosPet);

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id_tutor FROM tutor WHERE id_usuario = ?',
      [1]
    );

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
      [10, 'Rex', 'Cachorro', 'Labrador', '2020-01-01']
    );
  });

  test('deve lançar erro 404 quando tutor não existir', async () => {
    db.query.mockResolvedValueOnce([
      []
    ]);

    await expect(
      petService.criarPet({
        id_usuario: 999,
        nome: 'Rex',
        especie: 'Cachorro',
        raca: 'Labrador',
        data_nascimento: '2020-01-01'
      })
    ).rejects.toMatchObject({
      message: 'Tutor não encontrado',
      status: 404
    });

    expect(db.query).toHaveBeenCalledTimes(1);
  });

});


describe('TEST-PET-003 - cadastrarAnimalVet()', () => {

  // Este bloco valida o INSERT do animal com/sem raça informada
  // - Quando `raca` vem preenchida: deve persistir o valor
  // - Quando `raca` vem nula/undefined: deve persistir como NULL
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve cadastrar animal com raça informada', async () => {
    const dados = {
      id_tutor: 10,
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO'
    };

    db.query.mockResolvedValueOnce([
      { insertId: 1 }
    ]);

    await petService.cadastrarAnimalVet(dados);

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento, porte, fase_vida) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        10,
        'Rex',
        'Cachorro',
        'Labrador',
        '2020-01-01',
        'GRANDE',
        'ADULTO'
      ]
    );
  });

  test('deve cadastrar animal com raça nula', async () => {
    const dados = {
      id_tutor: 10,
      nome: 'Rex',
      especie: 'Cachorro',
      raca: undefined,
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO'
    };

    db.query.mockResolvedValueOnce([
      { insertId: 1 }
    ]);

    await petService.cadastrarAnimalVet(dados);

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento, porte, fase_vida) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        10,
        'Rex',
        'Cachorro',
        null,
        '2020-01-01',
        'GRANDE',
        'ADULTO'
      ]
    );
  });

});


describe('TEST-PET-004 - cadastrarTutorEPet()', () => {

  // Fluxo completo de cadastro (usuário -> tutor -> pet)
  // e validações de unicidade (email e CPF) antes de persistir.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve cadastrar usuário, tutor e animal com sucesso', async () => {
    const dados = {
      email: 'teste@email.com',
      senha: '123456',
      nome_completo: 'João Silva',
      cpf: '12345678900',
      telefone: '91999999999',
      estado: 'PA',
      cidade: 'Belém',
      bairro: 'Centro',
      nome_pet: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO'
    };

    db.query
      .mockResolvedValueOnce([[]]) // email não existe
      .mockResolvedValueOnce([[]]) // cpf não existe
      .mockResolvedValueOnce([{ insertId: 1 }]) // usuário
      .mockResolvedValueOnce([{ insertId: 10 }]) // tutor
      .mockResolvedValueOnce([{ insertId: 100 }]); // animal

    bcrypt.hash.mockResolvedValue('senha-hash');

    await petService.cadastrarTutorEPet(dados);

    expect(bcrypt.hash).toHaveBeenCalledWith(
      '123456',
      10
    );

    expect(db.query).toHaveBeenCalledTimes(5);
  });

  test('deve lançar erro quando email já existir', async () => {
    db.query.mockResolvedValueOnce([
      [{ id_usuario: 1 }]
    ]);

    await expect(
      petService.cadastrarTutorEPet({
        email: 'teste@email.com'
      })
    ).rejects.toThrow(
      'E-mail já cadastrado no sistema.'
    );

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  test('deve lançar erro quando CPF já existir', async () => {
    db.query
      .mockResolvedValueOnce([[]]) // email livre
      .mockResolvedValueOnce([
        [{ id_tutor: 1 }]
      ]); // cpf existente

    await expect(
      petService.cadastrarTutorEPet({
        email: 'teste@email.com',
        cpf: '12345678900'
      })
    ).rejects.toThrow(
      'CPF já cadastrado em outra conta.'
    );

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  test('deve gerar hash da senha antes de salvar usuário', async () => {
    const dados = {
      email: 'teste@email.com',
      senha: 'minhasenha',
      nome_completo: 'João Silva',
      cpf: '12345678900',
      telefone: '91999999999',
      estado: 'PA',
      cidade: 'Belém',
      bairro: 'Centro',
      nome_pet: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO'
    };

    db.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 1 }])
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([{ insertId: 100 }]);

    bcrypt.hash.mockResolvedValue('HASH_GERADO');

    await petService.cadastrarTutorEPet(dados);

    expect(db.query).toHaveBeenNthCalledWith(
      3,
      'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "TUTOR")',
      ['teste@email.com', 'HASH_GERADO']
    );
  });

});


describe('TEST-PET-005 - buscarAnimais()', () => {

  // Este bloco valida montagem de query e parâmetros para filtros opcionais:
  // - sem filtros => apenas busca por termo (LIKE)
  // - com id_clinica => adiciona `rv.id_clinica = ?`
  // - com vacina => adiciona `v.nome_vacina LIKE ?`
  // - com status => adiciona `rv.status = ?`
  // - combina múltiplos filtros => todos devem aparecer no SQL e na ordem dos params
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve buscar animais sem filtros', async () => {
    const animaisMock = [
      {
        id_animal: 1,
        nome: 'Rex'
      }
    ];

    db.query.mockResolvedValueOnce([animaisMock]);

    const resultado = await petService.buscarAnimais({});

    expect(db.query).toHaveBeenCalledTimes(1);

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('FROM animal a');

    expect(params).toEqual([
      '%',
      '%',
      '%'
    ]);

    expect(resultado).toEqual(animaisMock);
  });

  test('deve buscar animais filtrando clínica', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await petService.buscarAnimais({
      id_clinica: 5
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('rv.id_clinica = ?');

    expect(params).toEqual([
      '%',
      '%',
      '%',
      5
    ]);
  });

  test('deve buscar animais filtrando vacina', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await petService.buscarAnimais({
      vacina: 'Raiva'
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('v.nome_vacina LIKE ?');

    expect(params).toEqual([
      '%',
      '%',
      '%',
      '%Raiva%'
    ]);
  });

  test('deve buscar animais filtrando status', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await petService.buscarAnimais({
      status: 'PENDENTE'
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('rv.status = ?');

    expect(params).toEqual([
      '%',
      '%',
      '%',
      'PENDENTE'
    ]);
  });

  test('deve combinar filtros corretamente', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await petService.buscarAnimais({
      termo: 'Rex',
      id_clinica: 5,
      vacina: 'Raiva',
      status: 'APLICADA'
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('rv.id_clinica = ?');
    expect(sql).toContain('v.nome_vacina LIKE ?');
    expect(sql).toContain('rv.status = ?');

    expect(params).toEqual([
      '%Rex%',
      '%Rex%',
      '%Rex%',
      5,
      '%Raiva%',
      'APLICADA'
    ]);
  });

});


describe('TEST-PET-006 - detalhesAnimal()', () => {

  // Este bloco valida a consulta que retorna detalhes do animal
  // via JOIN com tutor e o comportamento quando o animal não existe.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar detalhes do animal quando encontrado', async () => {
    const animalMock = {
      id_animal: 1,
      nome_animal: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      nome_tutor: 'João Silva'
    };

    db.query.mockResolvedValueOnce([
      [animalMock]
    ]);

    const resultado = await petService.detalhesAnimal(1);

    expect(db.query).toHaveBeenCalledTimes(1);

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('FROM animal a');
    expect(sql).toContain('JOIN tutor t');

    expect(params).toEqual([1]);

    expect(resultado).toEqual(animalMock);
  });

  test('deve retornar null quando animal não existir', async () => {
    db.query.mockResolvedValueOnce([
      []
    ]);

    const resultado = await petService.detalhesAnimal(999);

    expect(db.query).toHaveBeenCalledTimes(1);

    const [, params] = db.query.mock.calls[0];

    expect(params).toEqual([999]);

    expect(resultado).toBeNull();
  });

});


describe('TEST-PET-007 - editarPetTutor()', () => {

  // Este bloco valida atualizações em duas tabelas:
  // - animal (dados do pet)
  // - tutor (dados de contato/endereço)
  // Inclui cenários sobre uso de `city` vs `cidade`.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve atualizar animal e tutor', async () => {
    const dados = {
      nome_animal: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO',
      id_tutor: 10,
      telefone: '91999999999',
      estado: 'PA',
      cidade: 'Belém',
      bairro: 'Centro'
    };

    db.query.mockResolvedValue([]);

    await petService.editarPetTutor(1, dados);

    expect(db.query).toHaveBeenCalledTimes(2);

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      `UPDATE animal SET nome = ?, especie = ?, raca = ?, data_nascimento = ?, porte = ?, fase_vida = ? WHERE id_animal = ?`,
      [
        'Rex',
        'Cachorro',
        'Labrador',
        '2020-01-01',
        'GRANDE',
        'ADULTO',
        1
      ]
    );

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      `UPDATE tutor SET telefone = ?, estado = ?, cidade = ?, bairro = ? WHERE id_tutor = ?`,
      [
        '91999999999',
        'PA',
        'Belém',
        'Centro',
        10
      ]
    );
  });

  test('deve usar city quando informado', async () => {
    db.query.mockResolvedValue([]);

    await petService.editarPetTutor(1, {
      nome_animal: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO',
      id_tutor: 10,
      telefone: '91999999999',
      estado: 'PA',
      city: 'Ananindeua',
      cidade: 'Belém',
      bairro: 'Centro'
    });

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      [
        '91999999999',
        'PA',
        'Ananindeua',
        'Centro',
        10
      ]
    );
  });

  test('deve usar cidade quando city não existir', async () => {
    db.query.mockResolvedValue([]);

    await petService.editarPetTutor(1, {
      nome_animal: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO',
      id_tutor: 10,
      telefone: '91999999999',
      estado: 'PA',
      cidade: 'Belém',
      bairro: 'Centro'
    });

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      [
        '91999999999',
        'PA',
        'Belém',
        'Centro',
        10
      ]
    );
  });

});


describe('TEST-PET-008 - editarAnimalSimples()', () => {

  // Este bloco valida uma atualização simples apenas na tabela `animal`.
  // O teste foca em: query conter `UPDATE animal` e params estarem na ordem esperada.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve atualizar animal com os dados informados', async () => {
    const dados = {
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Labrador',
      data_nascimento: '2020-01-01',
      porte: 'GRANDE',
      fase_vida: 'ADULTO'
    };

    db.query.mockResolvedValue([]);

    await petService.editarAnimalSimples(1, dados);

    expect(db.query).toHaveBeenCalledTimes(1);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE animal'),
      [
        'Rex',
        'Cachorro',
        'Labrador',
        '2020-01-01',
        'GRANDE',
        'ADULTO',
        1
      ]
    );
  });

});


describe('TEST-PET-009 - deletarAnimal()', () => {

  // Este bloco valida o comportamento de deleção em cascata "manual":
  // 1) remove registros relacionados em `registro_vacinacao`
  // 2) remove o registro do `animal`
  // A ordem das queries é verificada via `toHaveBeenNthCalledWith`.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve deletar registros de vacinação antes do animal', async () => {
    db.query.mockResolvedValue([]);

    await petService.deletarAnimal(1);

    expect(db.query).toHaveBeenCalledTimes(2);

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      'DELETE FROM registro_vacinacao WHERE id_animal = ?',
      [1]
    );

    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'DELETE FROM animal WHERE id_animal = ?',
      [1]
    );
  });

});


describe('TEST-PET-010 - relatorioVacinasVet()', () => {

  // Este bloco valida a geração do relatório de vacinas por veterinário.
  // Também cobre a ausência de `id_clinica` (retorno vazio sem query).
  // Quando `id_clinica` existe, valida:
  // - datas padrão (2000-01-01 e 2100-12-31)
  // - filtros opcionais de espécie e status
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar array vazio sem id_clinica', async () => {
    const resultado = await petService.relatorioVacinasVet({});

    expect(resultado).toEqual([]);
    expect(db.query).not.toHaveBeenCalled();
  });

  test('deve gerar relatório com filtros padrão', async () => {
    const mockRelatorio = [
      { nome_animal: 'Rex' }
    ];

    db.query.mockResolvedValueOnce([mockRelatorio]);

    const resultado = await petService.relatorioVacinasVet({
      id_clinica: 1
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('FROM registro_vacinacao rv');
    expect(sql).toContain('rv.id_clinica = ?');

    expect(params).toEqual([
      '2000-01-01',
      '2100-12-31',
      '2000-01-01',
      '2100-12-31',
      1
    ]);

    expect(resultado).toEqual(mockRelatorio);
  });

  test('deve aplicar filtro de espécie', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await petService.relatorioVacinasVet({
      id_clinica: 1,
      especie: 'Cachorro'
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('a.especie = ?');

    expect(params).toEqual([
      '2000-01-01',
      '2100-12-31',
      '2000-01-01',
      '2100-12-31',
      1,
      'Cachorro'
    ]);
  });

  test('deve aplicar filtro de status', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await petService.relatorioVacinasVet({
      id_clinica: 1,
      status: 'APLICADA'
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('rv.status = ?');

    expect(params).toEqual([
      '2000-01-01',
      '2100-12-31',
      '2000-01-01',
      '2100-12-31',
      1,
      'APLICADA'
    ]);
  });

  test('deve aplicar espécie e status simultaneamente', async () => {
    db.query.mockResolvedValueOnce([[]]);

    await petService.relatorioVacinasVet({
      id_clinica: 1,
      especie: 'Cachorro',
      status: 'PENDENTE'
    });

    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain('a.especie = ?');
    expect(sql).toContain('rv.status = ?');

    expect(params).toEqual([
      '2000-01-01',
      '2100-12-31',
      '2000-01-01',
      '2100-12-31',
      1,
      'Cachorro',
      'PENDENTE'
    ]);
  });

});