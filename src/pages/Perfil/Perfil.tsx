import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { PageTitle, PageDescription } from '../Page.styles'
import { page, labels, placeholders, errors, actions, feedback } from './Perfil.strings'
import {
  Form,
  FieldGroup,
  Field,
  Label,
  Input,
  ErrorText,
  HelperText,
  SuccessBanner,
  ErrorBanner,
  SubmitButton,
} from './Perfil.styles'

interface PerfilForm {
  nombreCompleto: string
  dni: string
  email: string
  telefono: string
  obraSocial: string
  nroAfiliado: string
  direccion: string
}

export default function Perfil() {
  const { user, updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<PerfilForm>()

  // Precargar los datos actuales del usuario cuando estén disponibles
  useEffect(() => {
    if (!user) return
    reset({
      nombreCompleto: user.nombre ?? '',
      dni: user.dni ?? '',
      email: user.email ?? '',
      telefono: user.telefono ?? '',
      obraSocial: user.obraSocial ?? '',
      nroAfiliado: user.nroAfiliado ?? '',
      direccion: user.direccion ?? '',
    })
  }, [user, reset])

  const onSubmit = async (data: PerfilForm) => {
    setSaving(true)
    setSaved(false)
    setApiError(null)
    try {
      await updateProfile({
        nombre: data.nombreCompleto,
        dni: data.dni,
        telefono: data.telefono,
        obraSocial: data.obraSocial,
        nroAfiliado: data.nroAfiliado,
        direccion: data.direccion || null,
      })
      setSaved(true)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : feedback.error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageTitle>{page.title}</PageTitle>
      <PageDescription>{page.description}</PageDescription>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {saved && <SuccessBanner>{feedback.guardado}</SuccessBanner>}
        {apiError && <ErrorBanner>{apiError}</ErrorBanner>}

        <Field>
          <Label htmlFor="nombreCompleto">{labels.nombreCompleto}</Label>
          <Input
            id="nombreCompleto"
            type="text"
            placeholder={placeholders.nombreCompleto}
            $error={!!formErrors.nombreCompleto}
            {...register('nombreCompleto', { required: errors.nombreRequired })}
          />
          {formErrors.nombreCompleto && <ErrorText>{formErrors.nombreCompleto.message}</ErrorText>}
        </Field>

        <FieldGroup>
          <Field>
            <Label htmlFor="dni">{labels.dni}</Label>
            <Input
              id="dni"
              type="text"
              inputMode="numeric"
              placeholder={placeholders.dni}
              $error={!!formErrors.dni}
              {...register('dni', {
                required: errors.dniRequired,
                pattern: {
                  value: /^\d{7,8}$/,
                  message: errors.dniInvalid,
                },
              })}
            />
            {formErrors.dni && <ErrorText>{formErrors.dni.message}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="email">{labels.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder={placeholders.email}
              readOnly
              {...register('email')}
            />
            <HelperText>{feedback.emailReadonly}</HelperText>
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <Label htmlFor="telefono">{labels.telefono}</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder={placeholders.telefono}
              $error={!!formErrors.telefono}
              {...register('telefono', { required: errors.telefonoRequired })}
            />
            {formErrors.telefono && <ErrorText>{formErrors.telefono.message}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="obraSocial">{labels.obraSocial}</Label>
            <Input
              id="obraSocial"
              type="text"
              placeholder={placeholders.obraSocial}
              $error={!!formErrors.obraSocial}
              {...register('obraSocial', { required: errors.obraSocialRequired })}
            />
            {formErrors.obraSocial && <ErrorText>{formErrors.obraSocial.message}</ErrorText>}
          </Field>
        </FieldGroup>

        <Field>
          <Label htmlFor="nroAfiliado">{labels.nroAfiliado}</Label>
          <Input
            id="nroAfiliado"
            type="text"
            placeholder={placeholders.nroAfiliado}
            $error={!!formErrors.nroAfiliado}
            {...register('nroAfiliado', { required: errors.nroAfiliadoRequired })}
          />
          {formErrors.nroAfiliado && <ErrorText>{formErrors.nroAfiliado.message}</ErrorText>}
        </Field>

        <Field>
          <Label htmlFor="direccion">{labels.direccion}</Label>
          <Input
            id="direccion"
            type="text"
            placeholder={placeholders.direccion}
            {...register('direccion')}
          />
        </Field>

        <SubmitButton type="submit" disabled={saving}>
          {saving ? actions.guardando : actions.guardar}
        </SubmitButton>
      </Form>
    </>
  )
}
