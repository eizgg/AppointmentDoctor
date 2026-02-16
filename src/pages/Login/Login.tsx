import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
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
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    setApiError('')
    setLoading(true)
    try {
      await loginWithGoogle(credentialResponse.credential)
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

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setApiError('Error al conectar con Google')}
          theme="filled_blue"
          text="continue_with"
          width="100%"
        />
      </LoginCard>
    </LoginWrapper>
  )
}
