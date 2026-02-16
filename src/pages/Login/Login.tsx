import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import {
  LoginWrapper,
  LoginCard,
  Logo,
  Subtitle,
  TabContainer,
  Tab,
  Form,
  FieldGroup,
  Label,
  Input,
  ErrorText,
  SubmitButton,
  Divider,
  GoogleButton,
  ApiError,
} from './Login.styles'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  nombre: string
}

export default function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register: registerUser, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const loginForm = useForm<LoginForm>()
  const registerForm = useForm<RegisterForm>()

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    onSuccess: (response) => handleGoogleSuccess(response.code),
    onError: () => setApiError('Error al conectar con Google'),
  })

  const handleLogin = async (data: LoginForm) => {
    setApiError('')
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    setApiError('')
    if (data.password !== data.confirmPassword) {
      registerForm.setError('confirmPassword', { message: 'Las contraseñas no coinciden' })
      return
    }
    setLoading(true)
    try {
      await registerUser({ email: data.email, password: data.password, nombre: data.nombre })
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al registrarse')
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (code: string) => {
    setApiError('')
    setLoading(true)
    try {
      await loginWithGoogle(code)
      navigate('/', { replace: true })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginWrapper>
      <LoginCard>
        <Logo>Turno Fácil</Logo>
        <Subtitle>Gestión de turnos médicos</Subtitle>

        <TabContainer>
          <Tab $active={activeTab === 'login'} onClick={() => { setActiveTab('login'); setApiError('') }}>
            Iniciar Sesión
          </Tab>
          <Tab $active={activeTab === 'register'} onClick={() => { setActiveTab('register'); setApiError('') }}>
            Registrarse
          </Tab>
        </TabContainer>

        {apiError && <ApiError>{apiError}</ApiError>}

        {activeTab === 'login' ? (
          <Form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <FieldGroup>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                {...loginForm.register('email', {
                  required: 'El email es requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
                })}
              />
              {loginForm.formState.errors.email && (
                <ErrorText>{loginForm.formState.errors.email.message}</ErrorText>
              )}
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="login-password">Contraseña</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                {...loginForm.register('password', {
                  required: 'La contraseña es requerida',
                })}
              />
              {loginForm.formState.errors.password && (
                <ErrorText>{loginForm.formState.errors.password.message}</ErrorText>
              )}
            </FieldGroup>

            <SubmitButton type="submit" disabled={loading} $loading={loading}>
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </SubmitButton>
          </Form>
        ) : (
          <Form onSubmit={registerForm.handleSubmit(handleRegister)}>
            <FieldGroup>
              <Label htmlFor="reg-nombre">Nombre completo</Label>
              <Input
                id="reg-nombre"
                type="text"
                placeholder="Juan Pérez"
                {...registerForm.register('nombre', {
                  required: 'El nombre es requerido',
                })}
              />
              {registerForm.formState.errors.nombre && (
                <ErrorText>{registerForm.formState.errors.nombre.message}</ErrorText>
              )}
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="tu@email.com"
                {...registerForm.register('email', {
                  required: 'El email es requerido',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
                })}
              />
              {registerForm.formState.errors.email && (
                <ErrorText>{registerForm.formState.errors.email.message}</ErrorText>
              )}
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="reg-password">Contraseña</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...registerForm.register('password', {
                  required: 'La contraseña es requerida',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
              />
              {registerForm.formState.errors.password && (
                <ErrorText>{registerForm.formState.errors.password.message}</ErrorText>
              )}
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Repetí tu contraseña"
                {...registerForm.register('confirmPassword', {
                  required: 'Confirmá tu contraseña',
                })}
              />
              {registerForm.formState.errors.confirmPassword && (
                <ErrorText>{registerForm.formState.errors.confirmPassword.message}</ErrorText>
              )}
            </FieldGroup>

            <SubmitButton type="submit" disabled={loading} $loading={loading}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </SubmitButton>
          </Form>
        )}

        <Divider>o</Divider>

        <GoogleButton type="button" onClick={() => googleLogin()} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </GoogleButton>
      </LoginCard>
    </LoginWrapper>
  )
}
