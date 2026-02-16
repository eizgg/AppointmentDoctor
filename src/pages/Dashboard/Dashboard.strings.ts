export const RECETA_MAX_DAYS = 60

export const summary = {
  recetasPendientes: 'Órdenes pendientes',
  turnosProximos: 'Turnos próximos (7 días)',
} as const

export const sections = {
  recetasPendientes: 'Órdenes Pendientes',
  proximosTurnos: 'Próximos Turnos',
} as const

export const specialty = {
  sinEspecialidad: 'Sin especialidad',
} as const

export const empty = {
  noRecetasPendientes: 'No tenés órdenes pendientes',
  noTurnosProximos: 'No tenés turnos próximos',
} as const

export const actions = {
  pedirTurno: 'Pedir Turno',
} as const

export const time = {
  dia: 'día',
  dias: 'días',
  hace: 'Hace',
  hoy: 'Hoy',
} as const

export const loading = {
  cargando: 'Cargando órdenes...',
  error: 'No se pudieron cargar las órdenes. Intentá de nuevo más tarde.',
} as const

export const gmail = {
  scanning: 'Buscando órdenes de OSDE en tu Gmail...',
  imported: (count: number) => `Se importaron ${count} ${count === 1 ? 'orden nueva' : 'órdenes nuevas'} de OSDE desde tu Gmail.`,
  reprocessed: (count: number) => `Se actualizaron ${count} ${count === 1 ? 'orden' : 'órdenes'} existentes.`,
  nothingNew: 'No se encontraron órdenes nuevas de OSDE en tu Gmail.',
  error: 'No se pudo escanear tu Gmail. Intentá de nuevo más tarde.',
  scanButton: 'Buscar órdenes',
  noGmailAccess: 'Conectá tu Gmail desde el login con Google para importar órdenes.',
} as const
