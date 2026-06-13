export const page = {
  title: 'Centros médicos',
  description:
    'Configurá los centros donde pedís turnos. El email general se usa para turnos comunes y el de imágenes para resonancias y tomografías.',
} as const

export const labels = {
  nombre: 'Nombre del centro',
  emailGeneral: 'Email de turnos generales',
  emailImagenes: 'Email de imágenes (resonancias/tomografías)',
  esPredeterminado: 'Usar como centro predeterminado',
} as const

export const placeholders = {
  nombre: 'Ej: Sanatorio Anchorena',
  emailGeneral: 'turnos@centro.com.ar',
  emailImagenes: 'diagnostico@centro.com.ar (opcional)',
} as const

export const errors = {
  nombreRequired: 'El nombre es obligatorio',
  emailGeneralRequired: 'El email general es obligatorio',
  emailInvalid: 'Email inválido',
} as const

export const actions = {
  agregar: 'Agregar centro',
  guardar: 'Guardar',
  cancelar: 'Cancelar',
  editar: 'Editar',
  eliminar: 'Eliminar',
  nuevo: 'Nuevo centro',
} as const

export const labelsList = {
  general: 'Turnos generales',
  imagenes: 'Imágenes',
  predeterminado: 'Predeterminado',
  sinImagenes: 'No configurado',
} as const

export const states = {
  cargando: 'Cargando centros...',
  vacio: 'Todavía no tenés centros configurados. Agregá el primero.',
  errorCargar: 'No se pudieron cargar los centros.',
  confirmarEliminar: '¿Eliminar este centro?',
} as const
