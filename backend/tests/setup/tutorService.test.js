const db = require('../../db');
const tutorService = require('../../services/tutorService');
const bcrypt = require('bcrypt');

// ============================================================================
// Configuração do ambiente de testes
// ============================================================================
//
// - bcrypt e db são mockados para isolar a lógica do tutorService.
// - Com isso, os testes não dependem de banco real nem de hash real.
//
jest.mock('bcrypt');
jest.mock('../../db');

beforeEach(() => {
  jest.clearAllMocks();
  db.query.mockReset();
});

// ============================================================================
// Testes: deletarTutor
// ============================================================================
// Cenários cobrem:
// - Bloqueio de exclusão quando houver animais vinculados
// - Erros quando tutor não existe
// - Exclusão efetiva de tutor e usuário
// ============================================================================

  // ============================================================================
  // Testes: deletarTutor
  // ============================================================================

  // TEST-TUT-001
  describe('TEST-TUT-001 - deletarTutor()', () => {
    it('Deve impedir exclusão quando houver animais vinculados', async () => {
      // 1) Simula contagem de animais vinculados ao tutor
      db.query.mockResolvedValueOnce([
        [{ total: 2 }]
      ]);

      await expect(
        tutorService.deletarTutor(1)
      ).rejects.toThrow(
        'Não é possível excluir. Este tutor possui animais vinculados.'
      );
    });
  });

  // TEST-TUT-002
  describe('TEST-TUT-002 - deletarTutor()', () => {
    it('Deve retornar erro quando tutor não existir', async () => {
      // Fluxo esperado:
      // - Passo A: validação de animais vinculados (total = 0)
      // - Passo B: busca do tutor (retorno vazio => tutor inexistente)
      db.query
        .mockResolvedValueOnce([
          [{ total: 0 }]
        ])
        .mockResolvedValueOnce([
          []
        ]);

      await expect(
        tutorService.deletarTutor(999)
      ).rejects.toThrow(
        'Tutor não encontrado'
      );
    });
  });

  // TEST-TUT-003
  describe('TEST-TUT-003 - deletarTutor()', () => {
    it('Deve excluir tutor e usuário com sucesso', async () => {
      // Fluxo esperado:
      // - Passo A: validação de animais vinculados (total = 0)
      // - Passo B: busca id_usuario associado ao tutor
      // - Passo C: exclusão das entidades no banco
      db.query
        .mockResolvedValueOnce([
          [{ total: 0 }]
        ])
        .mockResolvedValueOnce([
          [{ id_usuario: 10 }]
        ])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}]);

      await tutorService.deletarTutor(1);

      expect(db.query).toHaveBeenCalledTimes(4);
    });
  });

  // ============================================================================
  // Testes: cadastrarTutorPet
  // ============================================================================

  // TEST-TUT-004
  describe('TEST-TUT-004 - cadastrarTutorPet()', () => {
    it('Deve impedir cadastro com email já existente', async () => {
      // Mock: validação de email retorna um usuário existente
      db.query.mockResolvedValueOnce([
        [{ id_usuario: 1 }]
      ]);

      await expect(
        tutorService.cadastrarTutorPet({
          email: 'teste@email.com'
        })
      ).rejects.toThrow(
        'E-mail já cadastrado!'
      );
    });
  });

  // TEST-TUT-005
  describe('TEST-TUT-005 - cadastrarTutorPet()', () => {
    it('Deve impedir cadastro com CPF já existente', async () => {
      // Fluxo de validação:
      // - Primeiro consulta email (retorna vazio => email não cadastrado)
      // - Depois consulta CPF (retorna registro => CPF já cadastrado)
      db.query
        .mockResolvedValueOnce([
          []
        ])
        .mockResolvedValueOnce([
          [{ id_tutor: 1 }]
        ]);

      await expect(
        tutorService.cadastrarTutorPet({
          email: 'novo@email.com',
          cpf: '12345678900'
        })
      ).rejects.toThrow(
        'CPF já cadastrado!'
      );
    });
  });

  // TEST-TUT-006
  describe('TEST-TUT-006 - cadastrarTutorPet()', () => {
    it('Deve cadastrar tutor e animal com sucesso', async () => {
      // Mock: hash da senha deve retornar um valor fixo para previsibilidade do teste
      bcrypt.hash.mockResolvedValue('senha-hash');

      db.query
        // verifica email
        .mockResolvedValueOnce([
          []
        ])
        // verifica cpf
        .mockResolvedValueOnce([
          []
        ])
        // INSERT usuario
        .mockResolvedValueOnce([
          { insertId: 10 }
        ])
        // INSERT tutor
        .mockResolvedValueOnce([
          { insertId: 20 }
        ])
        // INSERT animal
        .mockResolvedValueOnce([
          {}
        ]);

      await tutorService.cadastrarTutorPet({
        nome_completo: 'João Silva',
        cpf: '12345678900',
        email: 'joao@email.com',
        senha: '123456',
        telefone: '99999999',
        estado: 'PA',
        cidade: 'Belém',
        bairro: 'Centro',
        nome_animal: 'Rex',
        especie: 'Cachorro',
        raca: 'Vira-lata',
        data_nascimento: '2024-01-01'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(
        '123456',
        10
      );

      // Valida que o INSERT do usuário foi feito com o perfil correto (TUTOR)
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO usuario (email, senha, perfil) VALUES (?, ?, "TUTOR")',
        ['joao@email.com', 'senha-hash']
      );

      // Valida que o INSERT do tutor foi feito com os dados do request
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          10,
          'João Silva',
          '12345678900',
          '99999999',
          'PA',
          'Belém',
          'Centro'
        ]
      );

      // Valida que o INSERT do animal foi feito com os dados do request
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?, ?)',
        [
          20,
          'Rex',
          'Cachorro',
          'Vira-lata',
          '2024-01-01'
        ]
      );

      expect(db.query).toHaveBeenCalledTimes(5);
    });
  });

  // ============================================================================
  // Testes: getTutorAnimais
  // ============================================================================

  // TEST-TUT-007
  describe('TEST-TUT-007 - getTutorAnimais()', () => {
    it('Deve retornar erro quando tutor não existir', async () => {
      // Mock: tutor buscado não existe (consulta retorna lista vazia)
      db.query.mockResolvedValueOnce([
        []
      ]);

      await expect(
        tutorService.getTutorAnimais(999)
      ).rejects.toThrow(
        'Tutor não encontrado'
      );
    });
  });

  // TEST-TUT-008
  describe('TEST-TUT-008 - getTutorAnimais()', () => {
    it('Deve retornar animais do tutor', async () => {
      // Mock: validação do tutor => retorna { id_tutor: 5 }
      // Mock: segunda query retorna os animais daquele tutor
      const animaisMock = [
        {
          id_animal: 1,
          nome: 'Rex',
          especie: 'Cachorro'
        }
      ];

      db.query
        .mockResolvedValueOnce([
          [{ id_tutor: 5 }]
        ])
        .mockResolvedValueOnce([
          animaisMock
        ]);

      const resultado = await tutorService.getTutorAnimais(1);

      expect(resultado).toEqual(animaisMock);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT id_animal, nome, especie, raca, data_nascimento FROM animal WHERE id_tutor = ?',
        [5]
      );
    });
  });

  // ============================================================================
  // Testes: getTutorAlertas
  // ============================================================================

  // TEST-TUT-009
  describe('TEST-TUT-009 - getTutorAlertas()', () => {
    it('Deve retornar erro quando tutor não existir', async () => {
      // Mock: tutor inexistente (consulta retorna lista vazia)
      db.query.mockResolvedValueOnce([
        []
      ]);

      await expect(
        tutorService.getTutorAlertas(999)
      ).rejects.toThrow(
        'Tutor não encontrado'
      );
    });
  });

  // TEST-TUT-010
  describe('TEST-TUT-010 - getTutorAlertas()', () => {
    it('Deve retornar lista vazia quando não houver alertas', async () => {
      // Mock: tutor existe, mas não há registros de alertas
      db.query
        .mockResolvedValueOnce([
          [{ id_tutor: 5 }]
        ])
        .mockResolvedValueOnce([
          {}
        ])
        .mockResolvedValueOnce([
          []
        ]);

      const resultado = await tutorService.getTutorAlertas(1);

      expect(resultado).toEqual([]);
    });
  });

  // TEST-TUT-011
  describe('TEST-TUT-011 - getTutorAlertas()', () => {
    it('Deve retornar alertas do tutor', async () => {
      // Mock:
      // - tutor existe
      // - (intermediário) update/consulta auxiliar
      // - terceira query retorna os alertas esperados
      const alertasMock = [
        {
          nome_vacina: 'Raiva',
          data_proxima_dose: '2026-07-01',
          status: 'PENDENTE',
          nome_animal: 'Rex'
        }
      ];

      db.query
        .mockResolvedValueOnce([
          [{ id_tutor: 5 }]
        ])
        .mockResolvedValueOnce([
          {}
        ])
        .mockResolvedValueOnce([
          alertasMock
        ]);

      const resultado = await tutorService.getTutorAlertas(1);

      expect(resultado).toEqual(alertasMock);

      expect(db.query).toHaveBeenCalledTimes(3);

      expect(db.query.mock.calls[1][0])
        .toContain('UPDATE registro_vacinacao');
    });
  });
