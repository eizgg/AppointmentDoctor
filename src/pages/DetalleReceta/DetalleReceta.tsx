import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download, CalendarCheck, CalendarPlus, AlertCircle } from 'lucide-react'
import { fetchReceta, solicitarTurno } from '../../services/api'
import type { RecetaResponse, TipoTurno } from '../../services/api'
import { fetchCentros, type Centro } from '../../services/centros'
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
  turno as turnoStrings,
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
  PdfEmbed,
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
  TurnoPanel,
  PanelField,
  PanelLabel,
  Select,
  PanelActions,
  SendButton,
  CancelButton,
  PanelMessage,
  PanelError,
  PanelLink,
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

const imagenesRegex = /resonancia|tomograf[ií]a|\bRMN\b|\bTAC\b/i

function detectarTipo(receta: RecetaResponse): TipoTurno {
  const partes = [...(receta.estudios ?? []), receta.especialidad ?? '']
  return imagenesRegex.test(partes.join(' ')) ? 'imagenes' : 'general'
}

export default function DetalleReceta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [receta, setReceta] = useState<RecetaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado del panel "Pedir turno"
  const [panelOpen, setPanelOpen] = useState(false)
  const [centros, setCentros] = useState<Centro[] | null>(null)
  const [centroId, setCentroId] = useState('')
  const [tipoOverride, setTipoOverride] = useState<'' | TipoTurno>('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

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

  const handleOpenPanel = async () => {
    setPanelOpen(true)
    setSendError(null)
    if (centros === null) {
      try {
        const data = await fetchCentros()
        setCentros(data)
        const predeterminado = data.find((c) => c.esPredeterminado) ?? data[0]
        if (predeterminado) setCentroId(predeterminado.id)
      } catch {
        setCentros([])
        setSendError(loadingStrings.error)
      }
    }
  }

  const handleEnviar = async () => {
    if (!receta || !centroId) return
    setSending(true)
    setSendError(null)
    try {
      const res = await solicitarTurno(receta.id, centroId, tipoOverride || undefined)
      setReceta(res.receta)
      setPanelOpen(false)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Error al solicitar turno')
    } finally {
      setSending(false)
    }
  }

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
  const tipoDetectado = detectarTipo(receta)
  const tipoDetectadoLabel =
    tipoDetectado === 'imagenes' ? turnoStrings.tipoImagenes : turnoStrings.tipoGeneral

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
            {receta.pdfUrl ? (
              <PdfEmbed src={receta.pdfUrl} title={receta.pdfNombreOriginal || 'Receta PDF'} />
            ) : (
              <PdfPlaceholder>
                <FileText size={32} />
                {documento.vistaPreviaPdf}
              </PdfPlaceholder>
            )}
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

            {estado === 'pendiente' && !panelOpen && (
              <ActionButton onClick={handleOpenPanel}>
                <CalendarPlus size={18} />
                {actions.pedirTurno}
              </ActionButton>
            )}

            {estado === 'pendiente' && panelOpen && (
              <TurnoPanel>
                {centros === null ? (
                  <PanelMessage>{turnoStrings.cargandoCentros}</PanelMessage>
                ) : centros.length === 0 ? (
                  <>
                    <PanelMessage>{turnoStrings.sinCentros}</PanelMessage>
                    <PanelLink onClick={() => navigate('/centros')}>
                      {turnoStrings.irACentros}
                    </PanelLink>
                  </>
                ) : (
                  <>
                    <PanelField>
                      <PanelLabel>{turnoStrings.centroLabel}</PanelLabel>
                      <Select value={centroId} onChange={(e) => setCentroId(e.target.value)}>
                        {centros.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                            {c.esPredeterminado ? ' ★' : ''}
                          </option>
                        ))}
                      </Select>
                    </PanelField>

                    <PanelField>
                      <PanelLabel>{turnoStrings.tipoLabel}</PanelLabel>
                      <Select
                        value={tipoOverride}
                        onChange={(e) => setTipoOverride(e.target.value as '' | TipoTurno)}
                      >
                        <option value="">
                          {turnoStrings.tipoAutomatico} ({turnoStrings.detectado}: {tipoDetectadoLabel})
                        </option>
                        <option value="general">{turnoStrings.tipoGeneral}</option>
                        <option value="imagenes">{turnoStrings.tipoImagenes}</option>
                      </Select>
                    </PanelField>

                    {sendError && (
                      <PanelError>
                        <AlertCircle size={16} />
                        {sendError}
                      </PanelError>
                    )}

                    <PanelActions>
                      <SendButton onClick={handleEnviar} disabled={sending || !centroId}>
                        <CalendarPlus size={16} />
                        {sending ? turnoStrings.enviando : turnoStrings.enviar}
                      </SendButton>
                      <CancelButton onClick={() => setPanelOpen(false)} disabled={sending}>
                        {turnoStrings.cancelar}
                      </CancelButton>
                    </PanelActions>
                  </>
                )}
              </TurnoPanel>
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
