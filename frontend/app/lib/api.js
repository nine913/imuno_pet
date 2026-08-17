export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const METODOS_MUTAVEIS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export function getUsuario() {
  if (typeof window === 'undefined') return null;
  const salvo = localStorage.getItem('usuarioImunoPet');
  if (!salvo) return null;
  try {
    return JSON.parse(salvo);
  } catch {
    return null;
  }
}

// O token JWT em si vive num cookie httpOnly (inacessível ao JS, protegido contra XSS).
// Este cookie NÃO é httpOnly e existe só para o padrão double-submit de proteção CSRF.
function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function limparSessao() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('usuarioImunoPet');
}

// Wrapper de fetch que já resolve a URL base da API e envia a sessão (cookie httpOnly) atual.
// Em caso de 401 (sessão ausente/expirada), limpa os dados locais e manda o usuário ao login.
export async function apiFetch(caminho, options = {}) {
  const headers = { ...(options.headers || {}) };
  const metodo = (options.method || 'GET').toUpperCase();

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (METODOS_MUTAVEIS.includes(metodo)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (resposta.status === 401 && typeof window !== 'undefined') {
    limparSessao();
    window.location.href = '/';
  }

  return resposta;
}
