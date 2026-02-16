const API_BASE = import.meta.env.VITE_API_URL || '/api'

const TOKEN_KEY = 'turno_facil_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const t = token || getStoredToken()
  if (t) {
    headers['Authorization'] = `Bearer ${t}`
  }
  return headers
}

export async function loginRequest(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Error de conexión' }))
    throw new Error(data.error || 'Error al iniciar sesión')
  }
  return res.json()
}

export async function registerRequest(email: string, password: string, nombre: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Error de conexión' }))
    throw new Error(data.error || 'Error al registrarse')
  }
  return res.json()
}

export async function googleLoginRequest(idToken: string) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Error de conexión' }))
    throw new Error(data.error || 'Error con Google login')
  }
  return res.json()
}

export async function getMeRequest() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(),
  })
  if (!res.ok) {
    throw new Error('No autorizado')
  }
  return res.json()
}
