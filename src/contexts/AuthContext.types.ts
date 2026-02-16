export interface User {
  id: string
  email: string
  nombre: string
  dni?: string
  telefono?: string
  obraSocial?: string
  nroAfiliado?: string
  hasGmailAccess?: boolean
}

export interface RegisterData {
  email: string
  password: string
  nombre: string
}

export interface GmailScanResult {
  found: number
  imported: number
  reprocessed: number
  skipped: number
  errors: number
  recetas: Array<{ id: string; pdfNombreOriginal: string; estado: string }>
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loginWithGoogle: (code: string) => Promise<void>
  gmailScanStatus: 'idle' | 'scanning' | 'done' | 'error'
  gmailScanResult: GmailScanResult | null
  scanGmail: () => Promise<void>
}
