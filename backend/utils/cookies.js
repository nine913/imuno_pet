const NOME_COOKIE_TOKEN = 'token';
const NOME_COOKIE_CSRF = 'csrf_token';

function duracaoTokenMs() {
  const valor = process.env.JWT_EXPIRES_IN || '8h';
  const match = /^(\d+)([smhd])$/.exec(valor);
  if (!match) return 8 * 60 * 60 * 1000;
  const quantidade = Number(match[1]);
  const unidades = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return quantidade * unidades[match[2]];
}

function opcoesCookieBase() {
  return {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: duracaoTokenMs(),
    path: '/'
  };
}

function opcoesCookieToken() {
  return { ...opcoesCookieBase(), httpOnly: true };
}

function opcoesCookieCsrf() {
  return { ...opcoesCookieBase(), httpOnly: false };
}

module.exports = { NOME_COOKIE_TOKEN, NOME_COOKIE_CSRF, opcoesCookieToken, opcoesCookieCsrf };
