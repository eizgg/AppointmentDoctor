import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { fetchRecetas } from '../../services/api'
import type { RecetaResponse } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { summary, sections, empty, actions, time, loading as loadingStrings } from './Dashboard.strings'
import {
  SummaryBar,
  SummaryCard,
  SummaryValue,
  SummaryLabel,
  CountBadge,
  Section,
  SectionHeader,
  CardList,
  CardBody,
  CardFooter,
  EmptyMessage,
  LoadingWrapper,
  ErrorMessage,
} from './Dashboard.styles'

function diasDesde(dateStr: string): number {
  const created = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - created.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function formatEstudios(estudios: string[] | null): string {
  if (!estudios || estudios.length === 0) return 'Sin estudios detectados'
  return estudios.join(', ')
}

function formatTurnoFecha(fechaIso: string): string {
  const date = new Date(fechaIso)
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${dias[date.getDay()]} ${date.getDate()} ${meses[date.getMonth()]}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [recetas, setRecetas] = useState<RecetaResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const data = await fetchRecetas(user.id)
        setRecetas(data)
      } catch {
        setError(loadingStrings.error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [user])

  if (isLoading) {
    return <LoadingWrapper>{loadingStrings.cargando}</LoadingWrapper>
  }

  if (error) {
    return (
      <ErrorMessage>
        <AlertCircle size={18} />
        {error}
      </ErrorMessage>
    )
  }

  const recetasPendientes = recetas.filter(
    (r) => r.estado === 'pendiente' || r.estado === 'enviado' || r.estado === 'error_ocr' || r.estado === 'procesando'
  )
  const recetasConTurno = recetas.filter((r) => r.turno && r.estado === 'confirmado')

  return (
    <>
      {/* Resumen */}
      <SummaryBar>
        <SummaryCard>
          <SummaryValue>
            {recetasPendientes.length}
            {recetasPendientes.length > 0 && <CountBadge>{recetasPendientes.length}</CountBadge>}
          </SummaryValue>
          <SummaryLabel>{summary.recetasPendientes}</SummaryLabel>
        </SummaryCard>

        <SummaryCard>
          <SummaryValue>{recetasConTurno.length}</SummaryValue>
          <SummaryLabel>{summary.turnosProximos}</SummaryLabel>
        </SummaryCard>
      </SummaryBar>

      {/* Recetas pendientes */}
      <Section>
        <SectionHeader>{sections.recetasPendientes}</SectionHeader>

        {recetasPendientes.length === 0 ? (
          <EmptyMessage>{empty.noRecetasPendientes}</EmptyMessage>
        ) : (
          <CardList>
            {recetasPendientes.map((receta) => {
              const dias = diasDesde(receta.createdAt)
              return (
                <Card key={receta.id} title={formatEstudios(receta.estudios)}>
                  <CardBody>
                    {dias === 0 ? time.hoy : `${time.hace} ${dias} ${dias === 1 ? time.dia : time.dias}`}
                  </CardBody>
                  <CardFooter>
                    <Badge status={receta.estado as 'pendiente' | 'enviado' | 'confirmado'} />
                    <Button variant="primary" onClick={() => navigate(`/receta/${receta.id}`)}>{actions.pedirTurno}</Button>
                  </CardFooter>
                </Card>
              )
            })}
          </CardList>
        )}
      </Section>

      {/* Próximos turnos */}
      <Section>
        <SectionHeader>{sections.proximosTurnos}</SectionHeader>

        {recetasConTurno.length === 0 ? (
          <EmptyMessage>{empty.noTurnosProximos}</EmptyMessage>
        ) : (
          <CardList>
            {recetasConTurno.map((receta) => (
              <Card key={receta.id} title={formatEstudios(receta.estudios)}>
                <CardBody>
                  {receta.turno && `${formatTurnoFecha(receta.turno.fecha)} · ${receta.turno.hora} hs`}
                </CardBody>
                <CardFooter>
                  <Badge status="confirmado" />
                </CardFooter>
              </Card>
            ))}
          </CardList>
        )}
      </Section>
    </>
  )
}
