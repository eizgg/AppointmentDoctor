export interface User {
  id: string
  email: string
  nombre: string
  dni?: string
  telefono?: string
  obraSocial?: string
  nroAfiliado?: string
}

export interface RegisterData {
  email: string
  password: string
  nombre: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loginWithGoogle: (idToken: string) => Promise<void>
}
