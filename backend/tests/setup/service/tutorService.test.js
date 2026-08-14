const db = require('../../../db');
const tutorService = require('../../../services/tutorService');

// ============================================================================
// Configuração do ambiente de testes
// ============================================================================
//
// - db é mockado para isolar a lógica do tutorService do banco real.
//
jest.mock('../../../db');

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
