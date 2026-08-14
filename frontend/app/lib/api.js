export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

function getToken() {
  return getUsuario()?.token || null;
}

export function limparSessao() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('usuarioImunoPet');
}

// Wrapper de fetch que já resolve a URL base da API e injeta o token JWT da sessão atual.
// Em caso de 401 (token ausente/expirado), limpa a sessão e manda o usuário de volta ao login.
export async function apiFetch(caminho, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_URL}${caminho}`, { ...options, headers });

  if (resposta.status === 401 && typeof window !== 'undefined') {
    limparSessao();
    window.location.href = '/';
  }

  return resposta;
}
