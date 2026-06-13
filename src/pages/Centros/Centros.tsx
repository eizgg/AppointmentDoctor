import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { PageTitle, PageDescription } from '../Page.styles'
import {
  fetchCentros,
  createCentro,
  updateCentro,
  deleteCentro,
  type Centro,
} from '../../services/centros'
import { page, labels, placeholders, errors, actions, labelsList, states } from './Centros.strings'
import {
  Toolbar,
  AddButton,
  List,
  CentroCard,
  CentroHeader,
  CentroName,
  DefaultTag,
  EmailRow,
  EmailLabel,
  EmailValue,
  CardActions,
  SecondaryButton,
  DangerButton,
  Form,
  Field,
  Label,
  Input,
  ErrorText,
  CheckboxRow,
  FormActions,
  SubmitButton,
  StateMessage,
  ErrorBanner,
} from './Centros.styles'

interface CentroForm {
  nombre: string
  emailGeneral: string
  emailImagenes: string
  esPredeterminado: boolean
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Centros() {
  const [centros, setCentros] = useState<Centro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Centro | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<CentroForm>()

  const loadCentros = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchCentros()
      setCentros(data)
      setLoadError(null)
    } catch {
      setLoadError(states.errorCargar)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCentros()
  }, [loadCentros])

  const openNew = () => {
    setEditing(null)
    setFormError(null)
    reset({ nombre: '', emailGeneral: '', emailImagenes: '', esPredeterminado: centros.length === 0 })
    setShowForm(true)
  }

  const openEdit = (centro: Centro) => {
    setEditing(centro)
    setFormError(null)
    reset({
      nombre: centro.nombre,
      emailGeneral: centro.emailGeneral,
      emailImagenes: centro.emailImagenes ?? '',
      esPredeterminado: centro.esPredeterminado,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setFormError(null)
  }

  const onSubmit = async (data: CentroForm) => {
    setSaving(true)
    setFormError(null)
    const payload = {
      nombre: data.nombre.trim(),
      emailGeneral: data.emailGeneral.trim(),
      emailImagenes: data.emailImagenes.trim() || null,
      esPredeterminado: data.esPredeterminado,
    }
    try {
      if (editing) {
        await updateCentro(editing.id, payload)
      } else {
        await createCentro(payload)
      }
      await loadCentros()
      closeForm()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar el centro')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (centro: Centro) => {
    if (!window.confirm(states.confirmarEliminar)) return
    try {
      await deleteCentro(centro.id)
      await loadCentros()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Error al eliminar el centro')
    }
  }

  return (
    <>
      <PageTitle>{page.title}</PageTitle>
      <PageDescription>{page.description}</PageDescription>

      {!showForm && (
        <Toolbar>
          <AddButton onClick={openNew}>
            <Plus size={18} />
            {actions.agregar}
          </AddButton>
        </Toolbar>
      )}

      {showForm && (
        <Form onSubmit={handleSubmit(onSubmit)}>
          {formError && <ErrorBanner>{formError}</ErrorBanner>}

          <Field>
            <Label htmlFor="nombre">{labels.nombre}</Label>
            <Input
              id="nombre"
              type="text"
              placeholder={placeholders.nombre}
              $error={!!formErrors.nombre}
              {...register('nombre', { required: errors.nombreRequired })}
            />
            {formErrors.nombre && <ErrorText>{formErrors.nombre.message}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="emailGeneral">{labels.emailGeneral}</Label>
            <Input
              id="emailGeneral"
              type="email"
              placeholder={placeholders.emailGeneral}
              $error={!!formErrors.emailGeneral}
              {...register('emailGeneral', {
                required: errors.emailGeneralRequired,
                pattern: { value: emailPattern, message: errors.emailInvalid },
              })}
            />
            {formErrors.emailGeneral && <ErrorText>{formErrors.emailGeneral.message}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="emailImagenes">{labels.emailImagenes}</Label>
            <Input
              id="emailImagenes"
              type="email"
              placeholder={placeholders.emailImagenes}
              $error={!!formErrors.emailImagenes}
              {...register('emailImagenes', {
                pattern: { value: emailPattern, message: errors.emailInvalid },
              })}
            />
            {formErrors.emailImagenes && <ErrorText>{formErrors.emailImagenes.message}</ErrorText>}
          </Field>

          <CheckboxRow>
            <input type="checkbox" {...register('esPredeterminado')} />
            {labels.esPredeterminado}
          </CheckboxRow>

          <FormActions>
            <SubmitButton type="submit" disabled={saving}>
              {actions.guardar}
            </SubmitButton>
            <SecondaryButton type="button" onClick={closeForm}>
              {actions.cancelar}
            </SecondaryButton>
          </FormActions>
        </Form>
      )}

      {!showForm && (
        <>
          {loadError && <ErrorBanner>{loadError}</ErrorBanner>}
          {isLoading ? (
            <StateMessage>{states.cargando}</StateMessage>
          ) : centros.length === 0 ? (
            <StateMessage>{states.vacio}</StateMessage>
          ) : (
            <List>
              {centros.map((centro) => (
                <CentroCard key={centro.id}>
                  <CentroHeader>
                    <CentroName>{centro.nombre}</CentroName>
                    {centro.esPredeterminado && (
                      <DefaultTag>
                        <Star size={11} /> {labelsList.predeterminado}
                      </DefaultTag>
                    )}
                  </CentroHeader>

                  <EmailRow>
                    <EmailLabel>{labelsList.general}</EmailLabel>
                    <EmailValue>{centro.emailGeneral}</EmailValue>
                  </EmailRow>

                  <EmailRow>
                    <EmailLabel>{labelsList.imagenes}</EmailLabel>
                    <EmailValue>{centro.emailImagenes || labelsList.sinImagenes}</EmailValue>
                  </EmailRow>

                  <CardActions>
                    <SecondaryButton onClick={() => openEdit(centro)}>
                      <Pencil size={15} />
                      {actions.editar}
                    </SecondaryButton>
                    <DangerButton onClick={() => handleDelete(centro)}>
                      <Trash2 size={15} />
                      {actions.eliminar}
                    </DangerButton>
                  </CardActions>
                </CentroCard>
              ))}
            </List>
          )}
        </>
      )}
    </>
  )
}
