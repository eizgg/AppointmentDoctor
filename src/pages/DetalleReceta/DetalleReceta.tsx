import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download, CalendarCheck, CalendarPlus, AlertCircle } from 'lucide-react'
import { fetchReceta } from '../../services/api'
import type { RecetaResponse } from '../../services/api'
import {
  back,
  header,
  sections,
  documento,
  info,
  timelineSteps,
  statusLabels,
  actions,
  fallback,
  loading as loadingStrings,
} from './DetalleReceta.strings'
import {
  BackLink,
  Header,
  Title,
  Subtitle,
  Grid,
  Section,
  SectionTitle,
  PdfPlaceholder,
  DownloadButton,
  InfoRow,
  InfoLabel,
  InfoValue,
  ChipList,
  Chip,
  StatusBadge,
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineLabel,
  TimelineDate,
  TurnoCard,
  TurnoIcon,
  TurnoInfo,
  TurnoDate,
  TurnoMeta,
  ActionButton,
  LoadingWrapper,
  ErrorMessage,
} from './DetalleReceta.styles'

type Estado = 'pendiente' | 'enviado' | 'confirmado'

const statusIcons: Record<Estado, string> = {
  pendiente: '\u23F3',
  enviado: '\uD83D\uDCE4',
  confirmado: '\u2705',
}

function normalizeEstado(estado: string): Estado {
  if (estado === 'enviado') return 'enviado'
  if (estado === 'confirmado') return 'confirmado'
  return 'pendiente'
}

function formatFecha(fechaIso: string | null): string {
  if (!fechaIso) return fallback.fechaNoDetectada
  const date = new Date(fechaIso)
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${date.getDate()} de ${meses[date.getMonth()]} ${date.getFullYear()}`
}

function formatTurnoFecha(fechaIso: string): string {
  const date = new Date(fechaIso)
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`
}

function getStepDone(estado: Estado, stepIndex: number): boolean {
  const levels: Record<Estado, number> = { pendiente: 0, enviado: 1, confirmado: 2 }
  return stepIndex <= levels[estado]
}

export default function DetalleReceta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receta, setReceta] = useState<RecetaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const loadReceta = async () => {
      try {
        const data = await fetchReceta(id)
        setReceta(data)
      } catch {
        setError(loadingStrings.error)
      } finally {
        setIsLoading(false)
      }
    }
    loadReceta()
  }, [id])

  if (isLoading) {
    return <LoadingWrapper>{loadingStrings.cargando}</LoadingWrapper>
  }

  if (error || !receta) {
    return (
      <>
        <BackLink onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          {back}
        </BackLink>
        <ErrorMessage>
          <AlertCircle size={18} />
          {error || loadingStrings.noEncontrada}
        </ErrorMessage>
      </>
    )
  }

  const estado = normalizeEstado(receta.estado)
  const fechaEmision = formatFecha(receta.fechaEmision)
  const estudios = receta.estudios ?? []

  return (
    <>
      <BackLink onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        {back}
      </BackLink>

      <Header>
        <Title>{header.recetaNum}{receta.pdfNombreOriginal}</Title>
        <Subtitle>{header.emitidaEl} {fechaEmision}</Subtitle>
      </Header>

      <Grid>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section>
            <SectionTitle>{sections.documento}</SectionTitle>
            <PdfPlaceholder>
              <FileText size={32} />
              {documento.vistaPreviaPdf}
            </PdfPlaceholder>
            <DownloadButton as="a" href={receta.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Download size={16} />
              {documento.descargarPdf}
            </DownloadButton>
          </Section>

          <Section>
            <SectionTitle>{sections.informacionReceta}</SectionTitle>

            <InfoRow>
              <InfoLabel>{info.medicoSolicitante}</InfoLabel>
              <InfoValue>{receta.medicoSolicitante || fallback.medicoNoEncontrado}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>{info.fechaEmision}</InfoLabel>
              <InfoValue>{fechaEmision}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>{info.estudiosDetectados}</InfoLabel>
              {estudios.length > 0 ? (
                <ChipList>
                  {estudios.map((estudio) => (
                    <Chip key={estudio}>{estudio}</Chip>
                  ))}
                </ChipList>
              ) : (
                <InfoValue>{fallback.sinEstudios}</InfoValue>
              )}
            </InfoRow>
          </Section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section>
            <SectionTitle>{sections.estado}</SectionTitle>

            <StatusBadge $status={estado}>
              {statusIcons[estado]} {statusLabels[estado]}
            </StatusBadge>

            <Timeline>
              {timelineSteps.map((step, i) => {
                const done = getStepDone(estado, i)
                const isLast = i === timelineSteps.length - 1
                return (
                  <TimelineItem key={step.key} $done={done} $last={isLast}>
                    <TimelineDot $done={done} />
                    <TimelineLabel $done={done}>{step.label}</TimelineLabel>
                    {done && i === 0 && (
                      <TimelineDate>{fechaEmision}</TimelineDate>
                    )}
                  </TimelineItem>
                )
              })}
            </Timeline>

            {estado === 'pendiente' && (
              <ActionButton>
                <CalendarPlus size={18} />
                {actions.pedirTurno}
              </ActionButton>
            )}
          </Section>

          {receta.turno && estado === 'confirmado' && (
            <Section>
              <SectionTitle>{sections.detallesTurno}</SectionTitle>
              <TurnoCard>
                <TurnoIcon>
                  <CalendarCheck size={20} />
                </TurnoIcon>
                <TurnoInfo>
                  <TurnoDate>{formatTurnoFecha(receta.turno.fecha)} · {receta.turno.hora} hs</TurnoDate>
                  {receta.turno.detalles && <TurnoMeta>{receta.turno.detalles}</TurnoMeta>}
                </TurnoInfo>
              </TurnoCard>
            </Section>
          )}
        </div>
      </Grid>
    </>
  )
}
