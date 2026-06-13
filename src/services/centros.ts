import { getStoredToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface Centro {
  id: string;
  nombre: string;
  emailGeneral: string;
  emailImagenes: string | null;
  esPredeterminado: boolean;
  createdAt: string;
}

export interface CentroInput {
  nombre: string;
  emailGeneral: string;
  emailImagenes?: string | null;
  esPredeterminado?: boolean;
}

export async function fetchCentros(): Promise<Centro[]> {
  const response = await fetch(`${API_BASE}/centros/list`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error al obtener centros');
  return response.json();
}

export async function createCentro(data: CentroInput): Promise<Centro> {
  const response = await fetch(`${API_BASE}/centros/create`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al crear centro');
  }
  return response.json();
}

export async function updateCentro(id: string, data: Partial<CentroInput>): Promise<Centro> {
  const response = await fetch(`${API_BASE}/centros/update`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ id, ...data }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al actualizar centro');
  }
  return response.json();
}

export async function deleteCentro(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/centros/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error('Error al eliminar centro');
}
