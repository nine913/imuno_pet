const gestorService = require('../services/gestorService'); // Serviço que concentra as regras/queries do gestor

// Controller: recebe (req, res) e delega para o service
async function dadosDashboard(req, res) {
  try {
    // req.query: parâmetros enviados na URL (ex: ?inicio=...&fim=...)
    const resultado = await gestorService.dadosDashboard(req.query);

    // Retorna 200 com os dados prontos para o frontend
    res.status(200).json(resultado);
  } catch (error) {
    // Se o service lançar um erro com status, usa esse status; senão, 500
    // Fallback para mensagem padrão se error.message não existir
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao buscar dados do gestor' });
  }
}

async function relatoriosAvancados(req, res) {
  try {
    // Recebe filtros via query e repassa para o service
    const resultado = await gestorService.relatoriosAvancados(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao gerar relatorio avancado' });
  }
}

async function veterinariosLista(req, res) {
  try {
    // Lista veterinários conforme filtros passados na URL
    const resultado = await gestorService.veterinariosLista(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao listar veterinarios' });
  }
}

async function cadastrarVet(req, res) {
  try {
    // req.body: dados enviados no body da requisição (POST)
    await gestorService.cadastrarVet(req.body);

    // 201 = recurso criado
    res.status(201).json({ mensagem: 'Veterinário cadastrado com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao cadastrar veterinario' });
  }
}

async function editarVet(req, res) {
  try {
    // req.params: dados da rota (ex: /editar/:id_veterinario)
    // req.body: novos dados para atualizar
    await gestorService.editarVet(req.params.id_veterinario, req.body);

    res.status(200).json({ mensagem: 'Dados atualizados com sucesso!' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao atualizar dados' });
  }
}

async function deletarVet(req, res) {
  try {
    // Deleção normalmente utiliza id vindo da rota (params)
    await gestorService.deletarVet(req.params.id_veterinario);
    res.status(200).json({ mensagem: 'Veterinário excluído com sucesso' });
  } catch (error) {
    res.status(error.status || 500).json({ erro: error.message || 'Erro ao excluir veterinario' });
  }
}

module.exports = {
  dadosDashboard,
  relatoriosAvancados,
  veterinariosLista,
  cadastrarVet,
  editarVet,
  deletarVet
};
