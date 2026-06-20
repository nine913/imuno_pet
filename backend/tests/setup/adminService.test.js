const db = require('../../db');
const adminService = require('../../services/adminService');
const bcrypt = require('bcrypt');


jest.mock('../../db');
jest.mock('bcrypt');

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
