export const errors = {
  soloPdf: 'Solo se aceptan archivos PDF.',
  limiteTamano: (maxMB: number) => `El archivo supera el límite de ${maxMB} MB.`,
} as const

export const ariaLabels = {
  quitarArchivo: 'Quitar archivo',
} as const

export const dropZone = {
  arrastra: 'Arrastrá tu archivo acá o ',
  buscar: 'buscá en tu dispositivo',
  hint: (maxMB: number) => `Solo PDF · Máximo ${maxMB} MB`,
} as const
