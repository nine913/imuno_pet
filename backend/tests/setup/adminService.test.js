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

describe('TEST-ADM-002 - listarClinicas() com filtro', () => {

   it('Deve listar clínicas utilizando filtro', async () => {
  const termo = 'Pet';

  const mockClinicas = [
    {
      id_clinica: 1,
      nome_fantasia: 'Clínica Pet Vida'
    }
  ];

  db.query.mockResolvedValue([mockClinicas]);

  const resultado = await adminService.listarClinicas(termo);

  expect(db.query).toHaveBeenCalledWith(
    'SELECT * FROM clinica WHERE nome_fantasia LIKE ? OR cnpj LIKE ? ORDER BY nome_fantasia ASC',
    ['%Pet%', '%Pet%']
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

describe('TEST-ADM-007 - obterClinicaPorId() não encontrada', () => {

   it('Deve retornar null quando a clínica não for encontrada', async () => {
  db.query.mockResolvedValue([[]]);

  const resultado = await adminService.obterClinicaPorId(999);

  expect(db.query).toHaveBeenCalledWith(
    'SELECT * FROM clinica WHERE id_clinica = ?',
    [999]
  );

  expect(resultado).toBeNull();
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

describe('TEST-ADM-009 - listarGestores() com filtro', () => {

    it('Deve listar gestores utilizando filtro', async () => {
  const termo = 'João';

  const mockGestores = [
    {
      id_gestor: 1,
      nome_completo: 'João Silva'
    }
  ];

  db.query.mockResolvedValue([mockGestores]);

  const resultado = await adminService.listarGestores(termo);

  expect(db.query).toHaveBeenCalledWith(
    `
      SELECT g.id_gestor, g.id_clinica, g.nome_completo, u.email, c.nome_fantasia 
      FROM gestor g
      JOIN usuario u ON g.id_usuario = u.id_usuario
      JOIN clinica c ON g.id_clinica = c.id_clinica
     WHERE g.nome_completo LIKE ? OR u.email LIKE ? ORDER BY g.nome_completo ASC`,
    ['%João%', '%João%']
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

describe('TEST-ADM-013 - deletarGestor() não existente', () => {

   it('Não deve deletar usuário quando gestor não existir', async () => {
  db.query.mockResolvedValueOnce([[]]);

  await adminService.deletarGestor(999);

  expect(db.query).toHaveBeenCalledTimes(1);

  expect(db.query).toHaveBeenCalledWith(
    'SELECT id_usuario FROM gestor WHERE id_gestor = ?',
    [999]
  );
   });

});