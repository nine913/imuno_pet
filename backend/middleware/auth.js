const { verificarToken } = require('../utils/jwt');
const { NOME_COOKIE_TOKEN, NOME_COOKIE_CSRF } = require('../utils/cookies');

// Perfis que operam dentro de uma clínica específica (não podem consultar dados de outra clínica)
const PERFIS_ESCOPO_CLINICA = ['VETERINARIO', 'GESTOR_CLINICA'];

// Métodos que alteram estado — exigem validação de CSRF quando a sessão vem de cookie.
const METODOS_MUTAVEIS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function autenticar(req, res, next) {
  const tokenCookie = req.cookies && req.cookies[NOME_COOKIE_TOKEN];

  if (tokenCookie) {
    // Sessão via cookie httpOnly: o navegador o envia automaticamente, então validamos
    // um token CSRF (padrão double-submit) em toda requisição que altera estado.
    if (METODOS_MUTAVEIS.includes(req.method)) {
      const csrfCookie = req.cookies[NOME_COOKIE_CSRF];
      const csrfHeader = req.headers['x-csrf-token'];
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({ erro: 'Token CSRF ausente ou inválido.' });
      }
    }

    try {
      req.user = verificarToken(tokenCookie);
      return next();
    } catch (error) {
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
  }

  // Fallback: Authorization: Bearer <token> (uso programático/API — não é enviado
  // automaticamente pelo navegador, então não está sujeito a CSRF).
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token de autenticação ausente.' });
  }

  try {
    req.user = verificarToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Restringe a rota aos perfis informados. Use depois de `autenticar`.
function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erro: 'Token de autenticação ausente.' });
    }
    if (!perfisPermitidos.includes(req.user.perfil)) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar este recurso.' });
    }
    next();
  };
}

// Garante que o :id_usuario da rota é o próprio usuário autenticado (ADMINISTRADOR sempre passa)
function exigirProprioUsuario(paramNome = 'id_usuario') {
  return (req, res, next) => {
    if (req.user.perfil === 'ADMINISTRADOR') return next();
    if (String(req.user.id_usuario) !== String(req.params[paramNome])) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar estes dados.' });
    }
    next();
  };
}

// Garante que o :id_clinica da rota é a clínica do próprio usuário autenticado (ADMINISTRADOR
// sempre passa) — evita que um gestor consulte dados de outra clínica trocando o parâmetro na URL.
function exigirPropriaClinica(paramNome = 'id') {
  return (req, res, next) => {
    if (req.user.perfil === 'ADMINISTRADOR') return next();
    if (String(req.user.id_clinica) !== String(req.params[paramNome])) {
      return res.status(403).json({ erro: 'Você não tem permissão para acessar estes dados.' });
    }
    next();
  };
}

// Para perfis com escopo de clínica (veterinário/gestor), ignora qualquer id_clinica vindo do
// cliente e força o valor da clínica do próprio token — evita que um usuário consulte/altere
// dados de outra clínica só trocando o parâmetro na requisição.
function forcarClinicaDoUsuario(req, res, next) {
  if (req.user && PERFIS_ESCOPO_CLINICA.includes(req.user.perfil)) {
    if (req.query && 'id_clinica' in req.query) req.query.id_clinica = req.user.id_clinica;
    if (req.body && typeof req.body === 'object') req.body.id_clinica = req.user.id_clinica;
  }
  next();
}

module.exports = { autenticar, autorizar, exigirProprioUsuario, exigirPropriaClinica, forcarClinicaDoUsuario };
