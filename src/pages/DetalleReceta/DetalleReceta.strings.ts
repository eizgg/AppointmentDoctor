export const back = 'Volver al dashboard'

export const header = {
  recetaNum: 'Receta #',
  emitidaEl: 'Emitida el',
} as const

export const sections = {
  documento: 'Documento',
  informacionReceta: 'Información de la receta',
  estado: 'Estado',
  detallesTurno: 'Detalles del turno',
} as const

export const documento = {
  vistaPreviaPdf: 'Vista previa del PDF',
  descargarPdf: 'Descargar PDF',
} as const

export const info = {
  medicoSolicitante: 'Médico solicitante',
  fechaEmision: 'Fecha de emisión',
  estudiosDetectados: 'Estudios detectados',
} as const

export const timelineSteps = [
  { key: 'recibida', label: 'Receta recibida' },
  { key: 'enviado', label: 'Turno pedido' },
  { key: 'confirmado', label: 'Turno confirmado' },
] as const

export const statusLabels = {
  pendiente: 'Pendiente',
  enviado: 'Turno pedido',
  confirmado: 'Confirmado',
} as const

export const actions = {
  pedirTurno: 'Pedir Turno',
} as const

export const fallback = {
  medicoNoEncontrado: 'No detectado',
  fechaNoDetectada: 'No detectada',
  sinEstudios: 'Sin estudios detectados',
  guion: '—',
} as const

export const loading = {
  cargando: 'Cargando receta...',
  error: 'No se pudo cargar la receta.',
  noEncontrada: 'Receta no encontrada.',
} as const
