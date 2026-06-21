const db = require('../../db');
const adminService = require('../../services/adminService');
const bcrypt = require('bcrypt');


jest.mock('../../db');
jest.mock('bcrypt');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TEST-ADM-001 - listarClinicas() sem filtro', () => {

   it('Deve listar todas as clínicas sem filtro', async () => {
  const mockClinicas = [
    {
      id_clinica: 1,
      nome_fantasia: 'Clínica Pet Vida',
      cnpj: '12345678000199'
    },
    {
      id_clinica: 2,
      nome_fantasia: 'Clínica Animal Care',
      cnpj: '98765432000188'
    }
    
  ];

  db.query.mockResolvedValue([mockClinicas]);

  const resultado = await adminService.listarClinicas();

  expect(db.query).toHaveBeenCalledWith(
    'SELECT * FROM clinica ORDER BY nome_fantasia ASC',
    []
  );

  expect(resultado).toEqual(mockClinicas);
   });

});

describe('TEST-ADM-003 - cadastrarClinica() nova', () => {

   it('Deve cadastrar uma clínica e retornar o ID gerado', async () => {
  const dados = {
    nome_fantasia: 'Clínica Pet Vida',
    cnpj: '12345678000199',
    endereco: 'Rua A',
    estado: 'PA',
    cidade: 'Belém',
    bairro: 'Centro',
    telefone: '91999999999'
  };

  db.query.mockResolvedValue([
    {
      insertId: 10
    }
  ]);

  const resultado = await adminService.cadastrarClinica(dados);

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO clinica (nome_fantasia, cnpj, endereco, estado, cidade, bairro, telefone) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      dados.nome_fantasia,
      dados.cnpj,
      dados.endereco,
      dados.estado,
      dados.cidade,
      dados.bairro,
      dados.telefone
    ]
  );

  expect(resultado).toBe(10);
   });

});

describe('TEST-ADM-004 - editarClinica() existente', () => {

   it('Deve editar uma clínica existente', async () => {
  const idClinica = 1;

  const dados = {
    nome_fantasia: 'Clínica Pet Atualizada',
    cnpj: '12345678000199',
    endereco: 'Rua Nova',
    estado: 'PA',
    cidade: 'Belém',
    bairro: 'Marco',
    telefone: '91988888888'
  };

  db.query.mockResolvedValue([
    {
      affectedRows: 1
    }
  ]);

  const resultado = await adminService.editarClinica(idClinica, dados);

  expect(db.query).toHaveBeenCalledWith(
    'UPDATE clinica SET nome_fantasia = ?, cnpj = ?, endereco = ?, estado = ?, cidade = ?, bairro = ?, telefone = ? WHERE id_clinica = ?',
    [
      dados.nome_fantasia,
      dados.cnpj,
      dados.endereco,
      dados.estado,
      dados.cidade,
      dados.bairro,
      dados.telefone,
      idClinica
    ]
  );

  expect(resultado).toBe(1);
   });

});

describe('TEST-ADM-005 - deletarClinica() existente', () => {

   it('Deve deletar uma clínica existente', async () => {
  const idClinica = 1;

  db.query.mockResolvedValue([
    {
      affectedRows: 1
    }
  ]);

  const resultado = await adminService.deletarClinica(idClinica);

  expect(db.query).toHaveBeenCalledWith(
    'DELETE FROM clinica WHERE id_clinica = ?',
    [idClinica]
  );

  expect(resultado).toBe(1);
   });

});

describe('TEST-ADM-006 - obterClinicaPorId() encontrada', () => {

   it('Deve retornar uma clínica pelo ID quando encontrada', async () => {
  const clinica = {
    id_clinica: 1,
    nome_fantasia: 'Clínica Pet Vida',
    cnpj: '12345678000199'
  };

  db.query.mockResolvedValue([[clinica]]);

  const resultado = await adminService.obterClinicaPorId(1);

  expect(db.query).toHaveBeenCalledWith(
    'SELECT * FROM clinica WHERE id_clinica = ?',
    [1]
  );

  expect(resultado).toEqual(clinica);
   });

});

describe('TEST-ADM-008 - listarClinicas() sem filtro', () => {

   it('Deve listar todos os gestores sem filtro', async () => {
  const mockGestores = [
    {
      id_gestor: 1,
      nome_completo: 'João Silva',
      email: 'joao@email.com',
      nome_fantasia: 'Pet Vida'
    }
  ];

  db.query.mockResolvedValue([mockGestores]);

  const resultado = await adminService.listarGestores();

  expect(db.query).toHaveBeenCalledWith(
    `
      SELECT g.id_gestor, g.id_clinica, g.nome_completo, u.email, c.nome_fantasia 
      FROM gestor g
      JOIN usuario u ON g.id_usuario = u.id_usuario
      JOIN clinica c ON g.id_clinica = c.id_clinica
     ORDER BY g.nome_completo ASC`,
    []
  );

  expect(resultado).toEqual(mockGestores);
   });

});

describe('TEST-ADM-010 - cadastrarGestor() novo', () => {

    it('Deve cadastrar um gestor', async () => {
  const dados = {
    email: 'gestor@email.com',
    senha: '123456',
    id_clinica: 2,
    nome_completo: 'João Silva'
  };

  bcrypt.hash.mockResolvedValue('senha-hash');

  db.query
    .mockResolvedValueOnce([
      {
        insertId: 15
      }
    ])
    .mockResolvedValueOnce([{}]);

  await adminService.cadastrarGestor(dados);

  expect(bcrypt.hash).toHaveBeenCalledWith(
    '123456',
    10
  );

  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "GESTOR_CLINICA")',
    ['gestor@email.com', 'senha-hash']
  );

  expect(db.query).toHaveBeenNthCalledWith(
    2,
    'INSERT INTO gestor (id_usuario, id_clinica, nome_completo) VALUES (?, ?, ?)',
    [15, 2, 'João Silva']
  );
    });
    
});

describe('TEST-ADM-011 - editarGestor() existente', () => {

   it('Deve editar um gestor', async () => {
  const dados = {
    id_clinica: 3,
    nome_completo: 'João Atualizado'
  };

  db.query.mockResolvedValue([{}]);

  await adminService.editarGestor(5, dados);

  expect(db.query).toHaveBeenCalledWith(
    'UPDATE gestor SET id_clinica = ?, nome_completo = ? WHERE id_gestor = ?',
    [3, 'João Atualizado', 5]
  );
   });

});

describe('TEST-ADM-012 - deletarGestor() existente', () => {

   it('Deve deletar o usuário vinculado ao gestor', async () => {
  db.query
    .mockResolvedValueOnce([
      [
        {
          id_usuario: 20
        }
      ]
    ])
    .mockResolvedValueOnce([{}]);

  await adminService.deletarGestor(5);

  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'SELECT id_usuario FROM gestor WHERE id_gestor = ?',
    [5]
  );

  expect(db.query).toHaveBeenNthCalledWith(
    2,
    'DELETE FROM usuario WHERE id_usuario = ?',
    [20]
  );
   });

});

describe('TEST-ADM-015 - listarOrgaos() com filtro', () => {

   it('Deve listar órgãos utilizando filtro', async () => {
  const termo = 'Saúde';

  const mockOrgaos = [
    {
      id_orgao: 1,
      nome_instituicao: 'Secretaria Municipal de Saúde'
    }
  ];

  db.query.mockResolvedValue([mockOrgaos]);

  const resultado = await adminService.listarOrgaos(termo);

  expect(db.query).toHaveBeenCalledWith(
    `
      SELECT o.id_orgao, o.nome_instituicao, o.esfera, o.estado_atuacao, o.cidade_atuacao, u.email 
      FROM orgao_governamental o
      JOIN usuario u ON o.id_usuario = u.id_usuario
     WHERE o.nome_instituicao LIKE ? OR u.email LIKE ? ORDER BY o.nome_instituicao ASC`,
    ['%Saúde%', '%Saúde%']
  );

  expect(resultado).toEqual(mockOrgaos);
   });

});

describe('TEST-ADM-016 - cadastrarOrgao() novo', () => {

   it('Deve cadastrar um órgão governamental', async () => {
  const dados = {
    email: 'orgao@governo.gov.br',
    senha: '123456',
    nome_instituicao: 'Secretaria Municipal de Saúde',
    esfera: 'Municipal',
    estado_atuacao: 'PA',
    cidade_atuacao: 'Belém'
  };

  bcrypt.hash.mockResolvedValue('senha-hash');

  db.query
    .mockResolvedValueOnce([
      {
        insertId: 30
      }
    ])
    .mockResolvedValueOnce([{}]);

  await adminService.cadastrarOrgao(dados);

  expect(bcrypt.hash).toHaveBeenCalledWith(
    '123456',
    10
  );

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "GOVERNO")',
    ['orgao@governo.gov.br', 'senha-hash']
  );

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO orgao_governamental (id_usuario, nome_instituicao, esfera, estado_atuacao, cidade_atuacao) VALUES (?, ?, ?, ?, ?)',
    [
      30,
      'Secretaria Municipal de Saúde',
      'Municipal',
      'PA',
      'Belém'
    ]
  );
   });

});

describe('TEST-ADM-017 - editarOrgao() existente', () => {

   it('Deve editar um órgão governamental', async () => {
  const dados = {
    nome_instituicao: 'Secretaria Estadual de Saúde',
    esfera: 'Estadual',
    estado_atuacao: 'PA',
    cidade_atuacao: 'Belém'
  };

  db.query.mockResolvedValue([{}]);

  await adminService.editarOrgao(5, dados);

  expect(db.query).toHaveBeenCalledWith(
    'UPDATE orgao_governamental SET nome_instituicao = ?, esfera = ?, estado_atuacao = ?, cidade_atuacao = ? WHERE id_orgao = ?',
    [
      'Secretaria Estadual de Saúde',
      'Estadual',
      'PA',
      'Belém',
      5
    ]
  );
   });

});

describe('TEST-ADM-018 - deletarOrgao() existente', () => {

   it('Deve deletar o usuário vinculado ao órgão', async () => {
  db.query
    .mockResolvedValueOnce([
      [
        {
          id_usuario: 50
        }
      ]
    ])
    .mockResolvedValueOnce([{}]);

  await adminService.deletarOrgao(3);

  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'SELECT id_usuario FROM orgao_governamental WHERE id_orgao = ?',
    [3]
  );

  expect(db.query).toHaveBeenNthCalledWith(
    2,
    'DELETE FROM usuario WHERE id_usuario = ?',
    [50]
  );
   });

});

describe('TEST-ADM-020 - obterEstatisticas()', () => {

   it('Deve retornar as estatísticas do sistema', async () => {
  db.query
    .mockResolvedValueOnce([
      [
        {
          total: 10
        }
      ]
    ])
    .mockResolvedValueOnce([
      [
        {
          total: 50
        }
      ]
    ])
    .mockResolvedValueOnce([
      [
        {
          total: 25
        }
      ]
    ]);

  const resultado = await adminService.obterEstatisticas();

  expect(db.query).toHaveBeenNthCalledWith(
    1,
    'SELECT COUNT(*) as total FROM clinica'
  );

  expect(db.query).toHaveBeenNthCalledWith(
    2,
    'SELECT COUNT(*) as total FROM usuario'
  );

  expect(db.query).toHaveBeenNthCalledWith(
    3,
    'SELECT COUNT(*) as total FROM vacina'
  );

  expect(resultado).toEqual({
    total_clinicas: 10,
    total_usuarios: 50,
    total_vacinas: 25
  });
   });

});

describe('TEST-ADM-023 - cadastrarEspecie() nova', () => {

   it('Deve cadastrar uma espécie', async () => {
  db.query.mockResolvedValue([{}]);

  await adminService.cadastrarEspecie('Canino');

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO especie (nome_especie) VALUES (?)',
    ['Canino']
  );
   });

});

describe('TEST-ADM-024 - deletarEspecie() existente', () => {

   it('Deve deletar uma espécie', async () => {
  db.query.mockResolvedValue([{}]);

  await adminService.deletarEspecie(1);

  expect(db.query).toHaveBeenCalledWith(
    'DELETE FROM especie WHERE id_especie = ?',
    [1]
  );
   });

});

describe('TEST-ADM-026 - listarRacas() com filtro', () => {

   it('Deve listar raças filtrando por espécie', async () => {
  const mockRacas = [
    {
      id_raca: 1,
      nome_raca: 'Labrador',
      id_especie: 1
    }
  ];

  db.query.mockResolvedValue([mockRacas]);

  const resultado = await adminService.listarRacas(1);

  expect(db.query).toHaveBeenCalledWith(
    'SELECT r.*, e.nome_especie FROM raca r JOIN especie e ON r.id_especie = e.id_especie WHERE r.id_especie = ? ORDER BY e.nome_especie ASC, r.nome_raca ASC',
    [1]
  );

  expect(resultado).toEqual(mockRacas);
   });

});

describe('TEST-ADM-027 - cadastrarRaca() nova', () => {

   it('Deve cadastrar uma raça', async () => {
  db.query.mockResolvedValue([{}]);

  await adminService.cadastrarRaca(1, 'Labrador');

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO raca (id_especie, nome_raca) VALUES (?, ?)',
    [1, 'Labrador']
  );
   });

});

describe('TEST-ADM-028 - deletarRaca() existente', () => {

   it('Deve deletar uma raça', async () => {
  db.query.mockResolvedValue([{}]);

  await adminService.deletarRaca(1);

  expect(db.query).toHaveBeenCalledWith(
    'DELETE FROM raca WHERE id_raca = ?',
    [1]
  );
   });

});

describe('TEST-ADM-030 - cadastrarAviso() com tipo informado', () => {

   it('Deve cadastrar aviso com tipo informado', async () => {
  const dados = {
    titulo: 'Alerta',
    mensagem: 'Mensagem importante',
    tipo: 'ALERTA'
  };

  db.query.mockResolvedValue([{}]);

  await adminService.cadastrarAviso(dados);

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO aviso (titulo, mensagem, tipo) VALUES (?, ?, ?)',
    [
      'Alerta',
      'Mensagem importante',
      'ALERTA'
    ]
  );
   });

});

describe('TEST-ADM-032 - editarAviso() existente', () => {

   it('Deve editar um aviso', async () => {
  const dados = {
    titulo: 'Novo Título',
    mensagem: 'Nova mensagem',
    tipo: 'ALERTA',
    status: 'ATIVO'
  };

  db.query.mockResolvedValue([{}]);

  await adminService.editarAviso(5, dados);

  expect(db.query).toHaveBeenCalledWith(
    'UPDATE aviso SET titulo = ?, mensagem = ?, tipo = ?, status = ? WHERE id_aviso = ?',
    [
      'Novo Título',
      'Nova mensagem',
      'ALERTA',
      'ATIVO',
      5
    ]
  );
   });

});

describe('TEST-ADM-033 - deletarAviso() existente', () => {

   it('Deve deletar um aviso', async () => {
  db.query.mockResolvedValue([{}]);

  await adminService.deletarAviso(5);

  expect(db.query).toHaveBeenCalledWith(
    'DELETE FROM aviso WHERE id_aviso = ?',
    [5]
  );
   });

});

describe('TEST-ADM-034 - listarLogs()', () => {

   it('Deve listar logs de auditoria', async () => {
  const mockLogs = [
    {
      id_log: 1,
      acao: 'LOGIN',
      detalhes: 'Usuário logou no sistema',
      data_hora: '2026-06-20 10:00:00',
      email: 'admin@imunopet.com',
      perfil: 'ADMIN'
    }
  ];

  db.query.mockResolvedValue([mockLogs]);

  const resultado = await adminService.listarLogs();

  expect(db.query).toHaveBeenCalledWith(
    `
      SELECT l.id_log, l.acao, l.detalhes, l.data_hora, u.email, u.perfil
      FROM log_auditoria l
      JOIN usuario u ON l.id_usuario = u.id_usuario
      ORDER BY l.data_hora DESC
      LIMIT 200
    `
  );

  expect(resultado).toEqual(mockLogs);
   });

});

describe('TEST-ADM-036 - listarVacinas() com filtro', () => {

   it('Deve listar vacinas com filtro', async () => {
  const termo = 'Raiva';

  const mockVacinas = [
    {
      id_vacina: 1,
      nome_vacina: 'Anti-Rábica'
    }
  ];

  db.query.mockResolvedValue([mockVacinas]);

  const resultado = await adminService.listarVacinas(termo);

  expect(db.query).toHaveBeenCalledWith(
    'SELECT * FROM vacina WHERE nome_vacina LIKE ? OR doencas_prevenidas LIKE ? ORDER BY nome_vacina ASC',
    ['%Raiva%', '%Raiva%']
  );

  expect(resultado).toEqual(mockVacinas);
   });

});

describe('TEST-ADM-037 - cadastrarVacina() nova', () => {

   it('Deve cadastrar uma vacina', async () => {
  const dados = {
    nome_vacina: 'V10',
    fabricante: 'Laboratório X',
    doencas_prevenidas: 'Cinomose, Parvovirose',
    intervalo_doses_dias: 21
  };

  db.query.mockResolvedValue([{}]);

  await adminService.cadastrarVacina(dados);

  expect(db.query).toHaveBeenCalledWith(
    'INSERT INTO vacina (nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias) VALUES (?, ?, ?, ?)',
    [
      'V10',
      'Laboratório X',
      'Cinomose, Parvovirose',
      21
    ]
  );
   });

});

describe('TEST-ADM-038 - editarVacina() existente', () => {

   it('Deve editar uma vacina', async () => {
  const dados = {
    nome_vacina: 'V10 Atualizada',
    fabricante: 'Laboratório Y',
    doencas_prevenidas: 'Cinomose',
    intervalo_doses_dias: 30
  };

  db.query.mockResolvedValue([{}]);

  await adminService.editarVacina(3, dados);

  expect(db.query).toHaveBeenCalledWith(
    'UPDATE vacina SET nome_vacina = ?, fabricante = ?, doencas_prevenidas = ?, intervalo_doses_dias = ? WHERE id_vacina = ?',
    [
      'V10 Atualizada',
      'Laboratório Y',
      'Cinomose',
      30,
      3
    ]
  );
   });

});

describe('TEST-ADM-039 - deletarVacina() existente', () => {

   it('Deve deletar uma vacina', async () => {
  db.query.mockResolvedValue([{}]);

  await adminService.deletarVacina(5);

  expect(db.query).toHaveBeenCalledWith(
    'DELETE FROM vacina WHERE id_vacina = ?',
    [5]
  );
   });

});