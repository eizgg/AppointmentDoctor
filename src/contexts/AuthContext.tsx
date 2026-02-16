import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, RegisterData, AuthContextType, GmailScanResult } from './AuthContext.types'
import {
  loginRequest,
  registerRequest,
  googleLoginRequest,
  getMeRequest,
  scanGmailRequest,
  storeToken,
  removeToken,
  getStoredToken,
} from '../services/auth'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gmailScanStatus, setGmailScanStatus] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [gmailScanResult, setGmailScanResult] = useState<GmailScanResult | null>(null)

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

  const scanGmail = useCallback(async () => {
    setGmailScanStatus('scanning')
    setGmailScanResult(null)
    try {
      const result = await scanGmailRequest()
      setGmailScanResult(result)
      setGmailScanStatus('done')
    } catch {
      setGmailScanStatus('error')
    }
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

  const loginWithGoogle = useCallback(async (code: string) => {
    const data = await googleLoginRequest(code)
    storeToken(data.token)
    setUser(data.user)

    // Auto-scan Gmail after Google login if access is granted
    if (data.user.hasGmailAccess) {
      setGmailScanStatus('scanning')
      scanGmailRequest()
        .then((result) => {
          setGmailScanResult(result)
          setGmailScanStatus('done')
        })
        .catch(() => {
          setGmailScanStatus('error')
        })
    }
  }, [])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
    setGmailScanStatus('idle')
    setGmailScanResult(null)
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
        gmailScanStatus,
        gmailScanResult,
        scanGmail,
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
