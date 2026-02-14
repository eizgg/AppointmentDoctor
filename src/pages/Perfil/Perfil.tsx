import { useForm } from 'react-hook-form'
import { PageTitle, PageDescription } from '../Page.styles'
import { page, labels, placeholders, errors, actions } from './Perfil.strings'
import {
  Form,
  FieldGroup,
  Field,
  Label,
  Input,
  ErrorText,
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
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<PerfilForm>()

  const onSubmit = (data: PerfilForm) => {
    console.log('Datos del perfil:', data)
  }

  return (
    <>
      <PageTitle>{page.title}</PageTitle>
      <PageDescription>{page.description}</PageDescription>

      <Form onSubmit={handleSubmit(onSubmit)}>
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
              $error={!!formErrors.email}
              {...register('email', {
                required: errors.emailRequired,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: errors.emailInvalid,
                },
              })}
            />
            {formErrors.email && <ErrorText>{formErrors.email.message}</ErrorText>}
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

        <SubmitButton type="submit">{actions.guardar}</SubmitButton>
      </Form>
    </>
  )
}
