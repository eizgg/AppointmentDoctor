export const page = {
  title: 'Mi Perfil',
  description: 'Completá tus datos personales.',
} as const

export const labels = {
  nombreCompleto: 'Nombre completo',
  dni: 'DNI',
  email: 'Email',
  telefono: 'Teléfono',
  obraSocial: 'Obra Social',
  nroAfiliado: 'Nº Afiliado',
  direccion: 'Dirección (opcional)',
} as const

export const placeholders = {
  nombreCompleto: 'Juan Pérez',
  dni: '12345678',
  email: 'juan@ejemplo.com',
  telefono: '11 2345-6789',
  obraSocial: 'OSDE, Swiss Medical...',
  nroAfiliado: '0000-1234-5678',
  direccion: 'Av. Corrientes 1234, CABA',
} as const

export const errors = {
  nombreRequired: 'El nombre es obligatorio',
  dniRequired: 'El DNI es obligatorio',
  dniInvalid: 'Ingresá un DNI válido (7-8 dígitos)',
  emailRequired: 'El email es obligatorio',
  emailInvalid: 'Ingresá un email válido',
  telefonoRequired: 'El teléfono es obligatorio',
  obraSocialRequired: 'La obra social es obligatoria',
  nroAfiliadoRequired: 'El número de afiliado es obligatorio',
} as const

export const actions = {
  guardar: 'Guardar',
} as const
