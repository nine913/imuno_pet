const adminService = require('../services/adminService');
const logger = require('../services/logger');

const adminController = {
  listarClinicas: async (req, res) => {
    try {
      const { termo } = req.query;
      const clinicas = await adminService.listarClinicas(termo);
      res.status(200).json(clinicas);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar clínicas.' });
    }
  },

  obterClinicaPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const clinica = await adminService.obterClinicaPorId(id);
      if (!clinica) {
        return res.status(404).json({ erro: 'Clínica não encontrada.' });
      }
      res.status(200).json(clinica);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar dados da clínica.' });
    }
  },

  cadastrarClinica: async (req, res) => {
    try {
      const { nome_fantasia, cnpj, endereco, estado, cidade, bairro, telefone, id_usuario_log } = req.body;
      if (!nome_fantasia || !estado || !cidade || !bairro) {
        return res.status(400).json({ erro: 'Campos essenciais são obrigatórios.' });
      }
      await adminService.cadastrarClinica({ nome_fantasia, cnpj, endereco, estado, cidade, bairro, telefone });
      
      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'CADASTRAR_CLINICA', `Clínica ${nome_fantasia} cadastrada.`);

      res.status(201).json({ mensagem: 'Clínica cadastrada com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao cadastrar a clínica.' });
    }
  },

  editarClinica: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome_fantasia, cnpj, endereco, estado, cidade, bairro, telefone, id_usuario_log } = req.body;
      if (!nome_fantasia || !estado || !cidade || !bairro) {
        return res.status(400).json({ erro: 'Campos essenciais são obrigatórios.' });
      }
      const linhasAfetadas = await adminService.editarClinica(id, { nome_fantasia, cnpj, endereco, estado, cidade, bairro, telefone });
      if (linhasAfetadas === 0) {
        return res.status(404).json({ erro: 'Clínica não encontrada.' });
      }

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EDITAR_CLINICA', `Clínica ID ${id} atualizada.`);

      res.status(200).json({ mensagem: 'Clínica atualizada com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao atualizar a clínica.' });
    }
  },

  deletarClinica: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_usuario_log } = req.body;

      await adminService.deletarClinica(id);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EXCLUIR_CLINICA', `Clínica ID ${id} excluída.`);

      res.status(200).json({ mensagem: 'Clínica excluída com sucesso!' });
    } catch (erro) {
      if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ erro: 'Não é possível excluir esta clínica pois existem usuários vinculados a ela.' });
      }
      res.status(500).json({ erro: 'Erro ao excluir a clínica.' });
    }
  },

  listarGestores: async (req, res) => {
    try {
      const { termo } = req.query;
      const gestores = await adminService.listarGestores(termo);
      res.status(200).json(gestores);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar gestores.' });
    }
  },

  cadastrarGestor: async (req, res) => {
    try {
      const { id_clinica, nome_completo, email, senha, id_usuario_log } = req.body;
      if (!id_clinica || !nome_completo || !email || !senha) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
      }
      await adminService.cadastrarGestor({ id_clinica, nome_completo, email, senha });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'CADASTRAR_GESTOR', `Gestor ${nome_completo} cadastrado para clínica ID ${id_clinica}.`);

      res.status(201).json({ mensagem: 'Gestor cadastrado com sucesso!' });
    } catch (erro) {
      if (erro.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
      }
      res.status(500).json({ erro: 'Erro ao cadastrar o gestor.' });
    }
  },

  editarGestor: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_clinica, nome_completo, id_usuario_log } = req.body;
      if (!id_clinica || !nome_completo) {
        return res.status(400).json({ erro: 'Nome e Clínica são obrigatórios.' });
      }
      await adminService.editarGestor(id, { id_clinica, nome_completo });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EDITAR_GESTOR', `Gestor ID ${id} atualizado.`);

      res.status(200).json({ mensagem: 'Gestor atualizado com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao atualizar o gestor.' });
    }
  },

  deletarGestor: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_usuario_log } = req.body;

      await adminService.deletarGestor(id);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EXCLUIR_GESTOR', `Gestor ID ${id} excluído.`);

      res.status(200).json({ mensagem: 'Gestor excluído com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao excluir o gestor.' });
    }
  },

  listarOrgaos: async (req, res) => {
    try {
      const { termo } = req.query;
      const orgaos = await adminService.listarOrgaos(termo);
      res.status(200).json(orgaos);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar órgãos governamentais.' });
    }
  },

  cadastrarOrgao: async (req, res) => {
    try {
      const { nome_instituicao, esfera, estado_atuacao, cidade_atuacao, email, senha, id_usuario_log } = req.body;
      if (!nome_instituicao || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
      }
      await adminService.cadastrarOrgao({ nome_instituicao, esfera, estado_atuacao, cidade_atuacao, email, senha });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'CADASTRAR_ORGAO', `Órgão ${nome_instituicao} cadastrado.`);

      res.status(201).json({ mensagem: 'Órgão cadastrado com sucesso!' });
    } catch (erro) {
      if (erro.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
      }
      res.status(500).json({ erro: 'Erro ao cadastrar o órgão.' });
    }
  },

  editarOrgao: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome_instituicao, esfera, estado_atuacao, cidade_atuacao, id_usuario_log } = req.body;
      if (!nome_instituicao) {
        return res.status(400).json({ erro: 'Nome da instituição é obrigatório.' });
      }
      await adminService.editarOrgao(id, { nome_instituicao, esfera, estado_atuacao, cidade_atuacao });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EDITAR_ORGAO', `Órgão ID ${id} atualizado.`);

      res.status(200).json({ mensagem: 'Órgão atualizado com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao atualizar o órgão.' });
    }
  },

  deletarOrgao: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_usuario_log } = req.body;

      await adminService.deletarOrgao(id);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EXCLUIR_ORGAO', `Órgão ID ${id} excluído.`);

      res.status(200).json({ mensagem: 'Órgão excluído com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao excluir o órgão.' });
    }
  },

  obterEstatisticas: async (req, res) => {
    try {
      const estatisticas = await adminService.obterEstatisticas();
      res.status(200).json(estatisticas);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar estatísticas.' });
    }
  },

  listarVacinas: async (req, res) => {
    try {
      const { termo } = req.query;
      const vacinas = await adminService.listarVacinas(termo);
      res.status(200).json(vacinas);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar vacinas.' });
    }
  },

  cadastrarVacina: async (req, res) => {
    try {
      const { nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias, id_usuario_log } = req.body;
      if (!nome_vacina || !doencas_prevenidas) {
        return res.status(400).json({ erro: 'Nome da vacina e doenças prevenidas são obrigatórios.' });
      }
      await adminService.cadastrarVacina({ nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'CADASTRAR_VACINA', `Vacina ${nome_vacina} cadastrada.`);

      res.status(201).json({ mensagem: 'Vacina cadastrada com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao cadastrar a vacina.' });
    }
  },

  editarVacina: async (req, res) => {
    try {
      const { id } = req.params;
      const { nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias, id_usuario_log } = req.body;
      if (!nome_vacina || !doencas_prevenidas) {
        return res.status(400).json({ erro: 'Nome da vacina e doenças prevenidas são obrigatórios.' });
      }
      await adminService.editarVacina(id, { nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EDITAR_VACINA', `Vacina ID ${id} atualizada.`);

      res.status(200).json({ mensagem: 'Vacina atualizada com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao atualizar a vacina.' });
    }
  },

  deletarVacina: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_usuario_log } = req.body;

      await adminService.deletarVacina(id);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EXCLUIR_VACINA', `Vacina ID ${id} excluída.`);

      res.status(200).json({ mensagem: 'Vacina excluída com sucesso!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao excluir a vacina.' });
    }
  },

  listarEspecies: async (req, res) => {
    try {
      const especies = await adminService.listarEspecies();
      res.status(200).json(especies);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar espécies.' });
    }
  },

  cadastrarEspecie: async (req, res) => {
    try {
      const { nome_especie, id_usuario_log } = req.body;
      if (!nome_especie) return res.status(400).json({ erro: 'Nome da espécie é obrigatório.' });
      await adminService.cadastrarEspecie(nome_especie);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'CADASTRAR_ESPECIE', `Espécie ${nome_especie} cadastrada.`);

      res.status(201).json({ mensagem: 'Espécie cadastrada!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao cadastrar espécie.' });
    }
  },

  deletarEspecie: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_usuario_log } = req.body;

      await adminService.deletarEspecie(id);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EXCLUIR_ESPECIE', `Espécie ID ${id} excluída.`);

      res.status(200).json({ mensagem: 'Espécie excluída!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao excluir espécie.' });
    }
  },

  listarRacas: async (req, res) => {
    try {
      const { id_especie } = req.query;
      const racas = await adminService.listarRacas(id_especie);
      res.status(200).json(racas);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar raças.' });
    }
  },

  cadastrarRaca: async (req, res) => {
    try {
      const { id_especie, nome_raca, id_usuario_log } = req.body;
      if (!id_especie || !nome_raca) return res.status(400).json({ erro: 'Campos obrigatórios.' });
      await adminService.cadastrarRaca(id_especie, nome_raca);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'CADASTRAR_RACA', `Raça ${nome_raca} cadastrada.`);

      res.status(201).json({ mensagem: 'Raça cadastrada!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao cadastrar raça.' });
    }
  },

  deletarRaca: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_usuario_log } = req.body;

      await adminService.deletarRaca(id);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EXCLUIR_RACA', `Raça ID ${id} excluída.`);

      res.status(200).json({ mensagem: 'Raça excluída!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao excluir raça.' });
    }
  },

  listarAvisos: async (req, res) => {
    try {
      const avisos = await adminService.listarAvisos();
      res.status(200).json(avisos);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar avisos.' });
    }
  },

  cadastrarAviso: async (req, res) => {
    try {
      const { titulo, mensagem, tipo, id_usuario_log } = req.body;
      if (!titulo || !mensagem) return res.status(400).json({ erro: 'Título e mensagem são obrigatórios.' });
      await adminService.cadastrarAviso({ titulo, mensagem, tipo });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'CADASTRAR_AVISO', `Aviso '${titulo}' criado.`);

      res.status(201).json({ mensagem: 'Aviso criado!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao criar aviso.' });
    }
  },

  editarAviso: async (req, res) => {
    try {
      const { id } = req.params;
      const { titulo, mensagem, tipo, status, id_usuario_log } = req.body;
      if (!titulo || !mensagem) return res.status(400).json({ erro: 'Título e mensagem são obrigatórios.' });
      await adminService.editarAviso(id, { titulo, mensagem, tipo, status });

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EDITAR_AVISO', `Aviso ID ${id} atualizado.`);

      res.status(200).json({ mensagem: 'Aviso atualizado!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao atualizar aviso.' });
    }
  },

  deletarAviso: async (req, res) => {
    try {
      const { id } = req.params;
      const { id_usuario_log } = req.body;

      await adminService.deletarAviso(id);

      if (id_usuario_log) await logger.registrarLog(id_usuario_log, 'EXCLUIR_AVISO', `Aviso ID ${id} excluído.`);

      res.status(200).json({ mensagem: 'Aviso excluído!' });
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao excluir aviso.' });
    }
  },

  listarLogs: async (req, res) => {
    try {
      const logs = await adminService.listarLogs();
      res.status(200).json(logs);
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao buscar logs de auditoria.' });
    }
  }
};

module.exports = adminController;