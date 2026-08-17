function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

// Rede de segurança para erros não tratados por um try/catch de controller
// (ex.: exceção síncrona num middleware, erro do CORS, promise rejeitada sem catch).
// eslint-disable-next-line no-unused-vars
function tratarErro(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -`, err);

  if (res.headersSent) {
    return;
  }

  res.status(err.status || 500).json({ erro: err.expose ? err.message : 'Erro interno do servidor.' });
}

module.exports = { rotaNaoEncontrada, tratarErro };
