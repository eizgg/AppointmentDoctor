import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Download, CalendarCheck, CalendarPlus } from 'lucide-react'
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
} from './DetalleReceta.styles'

/* ── Datos mock ── */

type Estado = 'pendiente' | 'enviado' | 'confirmado'

interface RecetaDetalle {
  id: number
  medico: string
  fechaEmision: string
  estudios: string[]
  estado: Estado
  turnoFecha?: string
  turnoHora?: string
  turnoLugar?: string
}

const statusIcons: Record<Estado, string> = {
  pendiente: '⏳',
  enviado: '📤',
  confirmado: '✅',
}

const recetasMock: Record<string, RecetaDetalle> = {
  '1': {
    id: 1,
    medico: 'Dr. García, Roberto',
    fechaEmision: '10 de febrero 2025',
    estudios: ['Hemograma completo', 'Glucemia', 'Perfil lipídico'],
    estado: 'confirmado',
    turnoFecha: 'Lunes 17 de febrero',
    turnoHora: '10:00 hs',
    turnoLugar: 'Laboratorio Central · Av. Rivadavia 4500',
  },
  '2': {
    id: 2,
    medico: 'Dra. López, Mariana',
    fechaEmision: '12 de febrero 2025',
    estudios: ['Ecografía abdominal'],
    estado: 'enviado',
  },
  '3': {
    id: 3,
    medico: 'Dr. Martínez, Carlos',
    fechaEmision: '6 de febrero 2025',
    estudios: ['Radiografía de tórax', 'Espirometría'],
    estado: 'pendiente',
  },
}

const fallbackReceta: RecetaDetalle = {
  id: 0,
  medico: fallback.medicoNoEncontrado,
  fechaEmision: fallback.guion,
  estudios: [],
  estado: 'pendiente',
}

function getStepDone(estado: Estado, stepIndex: number): boolean {
  const levels: Record<Estado, number> = { pendiente: 0, enviado: 1, confirmado: 2 }
  return stepIndex <= levels[estado]
}

/* ── Componente ── */

export default function DetalleReceta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const receta = recetasMock[id ?? ''] ?? fallbackReceta

  return (
    <>
      <BackLink onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        {back}
      </BackLink>

      <Header>
        <Title>{header.recetaNum}{receta.id}</Title>
        <Subtitle>{header.emitidaEl} {receta.fechaEmision}</Subtitle>
      </Header>

      <Grid>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section>
            <SectionTitle>{sections.documento}</SectionTitle>
            <PdfPlaceholder>
              <FileText size={32} />
              {documento.vistaPreviaPdf}
            </PdfPlaceholder>
            <DownloadButton>
              <Download size={16} />
              {documento.descargarPdf}
            </DownloadButton>
          </Section>

          <Section>
            <SectionTitle>{sections.informacionReceta}</SectionTitle>

            <InfoRow>
              <InfoLabel>{info.medicoSolicitante}</InfoLabel>
              <InfoValue>{receta.medico}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>{info.fechaEmision}</InfoLabel>
              <InfoValue>{receta.fechaEmision}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>{info.estudiosDetectados}</InfoLabel>
              <ChipList>
                {receta.estudios.map((estudio) => (
                  <Chip key={estudio}>{estudio}</Chip>
                ))}
              </ChipList>
            </InfoRow>
          </Section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section>
            <SectionTitle>{sections.estado}</SectionTitle>

            <StatusBadge $status={receta.estado}>
              {statusIcons[receta.estado]} {statusLabels[receta.estado]}
            </StatusBadge>

            <Timeline>
              {timelineSteps.map((step, i) => {
                const done = getStepDone(receta.estado, i)
                const isLast = i === timelineSteps.length - 1
                return (
                  <TimelineItem key={step.key} $done={done} $last={isLast}>
                    <TimelineDot $done={done} />
                    <TimelineLabel $done={done}>{step.label}</TimelineLabel>
                    {done && i === 0 && (
                      <TimelineDate>{receta.fechaEmision}</TimelineDate>
                    )}
                  </TimelineItem>
                )
              })}
            </Timeline>

            {receta.estado === 'pendiente' && (
              <ActionButton>
                <CalendarPlus size={18} />
                {actions.pedirTurno}
              </ActionButton>
            )}
          </Section>

          {receta.estado === 'confirmado' && receta.turnoFecha && (
            <Section>
              <SectionTitle>{sections.detallesTurno}</SectionTitle>
              <TurnoCard>
                <TurnoIcon>
                  <CalendarCheck size={20} />
                </TurnoIcon>
                <TurnoInfo>
                  <TurnoDate>{receta.turnoFecha} · {receta.turnoHora}</TurnoDate>
                  <TurnoMeta>{receta.turnoLugar}</TurnoMeta>
                </TurnoInfo>
              </TurnoCard>
            </Section>
          )}
        </div>
      </Grid>
    </>
  )
}
