import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, RegisterData, AuthContextType } from './AuthContext.types'
import {
  loginRequest,
  registerRequest,
  googleLoginRequest,
  getMeRequest,
  storeToken,
  removeToken,
  getStoredToken,
} from '../services/auth'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    getMeRequest()
      .then((data) => setUser(data.user))
      .catch(() => {
        removeToken()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password)
    storeToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(async ({ email, password, nombre }: RegisterData) => {
    const data = await registerRequest(email, password, nombre)
    storeToken(data.token)
    setUser(data.user)
  }, [])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const data = await googleLoginRequest(idToken)
    storeToken(data.token)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
