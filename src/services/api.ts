const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Temporary user ID for testing (until auth is implemented)
export const USUARIO_TEMP_ID = '31e07434-33b3-4dda-91ef-d3d843f93bce';

export interface TurnoResponse {
  id: string;
  recetaId: string;
  fecha: string;
  hora: string;
  detalles: string | null;
}

export interface RecetaResponse {
  id: string;
  pdfUrl: string;
  pdfNombreOriginal: string;
  medicoSolicitante: string | null;
  fechaEmision: string | null;
  estudios: string[] | null;
  estado: string;
  createdAt: string;
  turno?: TurnoResponse | null;
}

export async function uploadReceta(file: File, usuarioId: string): Promise<RecetaResponse> {
  // Convert file to base64
  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );

  const response = await fetch(`${API_BASE}/recetas/upload-and-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileBase64: base64,
      usuarioId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al subir receta');
  }

  return response.json();
}

export async function fetchRecetas(usuarioId: string): Promise<RecetaResponse[]> {
  const response = await fetch(`${API_BASE}/recetas/list?usuarioId=${usuarioId}`);
  if (!response.ok) throw new Error('Error al obtener recetas');
  return response.json();
}

export async function fetchReceta(id: string): Promise<RecetaResponse> {
  const response = await fetch(`${API_BASE}/recetas/${id}`);
  if (!response.ok) throw new Error('Error al obtener receta');
  return response.json();
}
