import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Mail, Loader2, CheckCircle2, Search } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { fetchRecetas } from '../../services/api'
import type { RecetaResponse } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  summary,
  sections,
  specialty,
  empty,
  actions,
  time,
  loading as loadingStrings,
  gmail as gmailStrings,
  RECETA_MAX_DAYS,
} from './Dashboard.strings'
import {
  SummaryBar,
  SummaryCard,
  SummaryValue,
  SummaryLabel,
  CountBadge,
  Section,
  SectionHeader,
  SpecialtyGroup,
  SpecialtyHeader,
  CardList,
  CardBody,
  CardFooter,
  EmptyMessage,
  LoadingWrapper,
  ErrorMessage,
  GmailBanner,
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

type SpecialtyGroupData = {
  key: string
  label: string
  recetas: RecetaResponse[]
}

function getEspecialidadLabel(receta: RecetaResponse): string {
  const label = receta.especialidad?.trim()
  if (!label) return specialty.sinEspecialidad
  return label
}

function groupByEspecialidad(recetas: RecetaResponse[]): SpecialtyGroupData[] {
  const groups = new Map<string, SpecialtyGroupData>()

  for (const receta of recetas) {
    const label = getEspecialidadLabel(receta)
    const key = label.toLocaleLowerCase()
    const existing = groups.get(key)

    if (existing) {
      existing.recetas.push(receta)
    } else {
      groups.set(key, { key, label, recetas: [receta] })
    }
  }

  return Array.from(groups.values())
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, gmailScanStatus, gmailScanResult, scanGmail } = useAuth()
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

  // Reload recetas after Gmail scan completes with imports
  useEffect(() => {
    if (gmailScanStatus === 'done' && gmailScanResult && (gmailScanResult.imported > 0 || gmailScanResult.reprocessed > 0) && user) {
      fetchRecetas(user.id)
        .then((data) => setRecetas(data))
        .catch(() => {})
    }
  }, [gmailScanStatus, gmailScanResult, user])

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

  const recetasVigentes = recetas.filter((r) => diasDesde(r.createdAt) <= RECETA_MAX_DAYS)

  const recetasPendientes = recetasVigentes.filter(
    (r) => r.estado === 'pendiente' || r.estado === 'enviado' || r.estado === 'error_ocr' || r.estado === 'procesando'
  )
  const recetasConTurno = recetasVigentes.filter((r) => r.turno && r.estado === 'confirmado')
  const recetasPendientesPorEspecialidad = groupByEspecialidad(recetasPendientes)
  const recetasConTurnoPorEspecialidad = groupByEspecialidad(recetasConTurno)

  return (
    <>
      {/* Gmail scan banner */}
      {gmailScanStatus === 'scanning' && (
        <GmailBanner $variant="scanning">
          <Loader2 size={16} className="animate-spin" />
          {gmailStrings.scanning}
        </GmailBanner>
      )}
      {gmailScanStatus === 'done' && gmailScanResult && (
        <GmailBanner $variant="done">
          {gmailScanResult.imported > 0 || gmailScanResult.reprocessed > 0 ? (
            <>
              <CheckCircle2 size={16} />
              <span>
                {gmailScanResult.imported > 0 && gmailStrings.imported(gmailScanResult.imported)}
                {gmailScanResult.imported > 0 && gmailScanResult.reprocessed > 0 && ' '}
                {gmailScanResult.reprocessed > 0 && gmailStrings.reprocessed(gmailScanResult.reprocessed)}
              </span>
            </>
          ) : (
            <>
              <Mail size={16} />
              {gmailStrings.nothingNew}
            </>
          )}
        </GmailBanner>
      )}
      {gmailScanStatus === 'error' && (
        <GmailBanner $variant="error">
          <AlertCircle size={16} />
          {gmailStrings.error}
        </GmailBanner>
      )}

      {/* Scan Gmail button */}
      {user?.hasGmailAccess && gmailScanStatus !== 'scanning' && (
        <div style={{ marginBottom: '1rem' }}>
          <Button variant="secondary" onClick={scanGmail}>
            <Search size={16} />
            {gmailStrings.scanButton}
          </Button>
        </div>
      )}

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
          <>
            {recetasPendientesPorEspecialidad.map((group) => (
              <SpecialtyGroup key={group.key}>
                <SpecialtyHeader>{group.label}</SpecialtyHeader>
                <CardList>
                  {group.recetas.map((receta) => {
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
              </SpecialtyGroup>
            ))}
          </>
        )}
      </Section>

      {/* Próximos turnos */}
      <Section>
        <SectionHeader>{sections.proximosTurnos}</SectionHeader>

        {recetasConTurno.length === 0 ? (
          <EmptyMessage>{empty.noTurnosProximos}</EmptyMessage>
        ) : (
          <>
            {recetasConTurnoPorEspecialidad.map((group) => (
              <SpecialtyGroup key={group.key}>
                <SpecialtyHeader>{group.label}</SpecialtyHeader>
                <CardList>
                  {group.recetas.map((receta) => (
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
              </SpecialtyGroup>
            ))}
          </>
        )}
      </Section>
    </>
  )
}
