import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { summary, sections, empty, actions, time } from './Dashboard.strings'
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
} from './Dashboard.styles'

/* ── Datos mock ── */

interface Receta {
  id: number
  estudio: string
  diasDesde: number
  estado: 'pendiente' | 'enviado' | 'confirmado'
}

interface Turno {
  id: number
  estudio: string
  fecha: string
  hora: string
  estado: 'confirmado'
}

const recetasPendientes: Receta[] = [
  { id: 1, estudio: 'Análisis de sangre', diasDesde: 5, estado: 'pendiente' },
  { id: 2, estudio: 'Ecografía abdominal', diasDesde: 2, estado: 'pendiente' },
  { id: 3, estudio: 'Radiografía de tórax', diasDesde: 8, estado: 'enviado' },
]

const proximosTurnos: Turno[] = [
  { id: 1, estudio: 'Hemograma completo', fecha: 'Lun 17 Feb', hora: '10:00', estado: 'confirmado' },
  { id: 2, estudio: 'Ecografía renal', fecha: 'Mié 19 Feb', hora: '15:30', estado: 'confirmado' },
]

/* ── Componente ── */

export default function Dashboard() {
  const navigate = useNavigate()
  const pendientes = recetasPendientes.filter((r) => r.estado === 'pendiente')

  return (
    <>
      {/* Resumen */}
      <SummaryBar>
        <SummaryCard>
          <SummaryValue>
            {pendientes.length}
            {pendientes.length > 0 && <CountBadge>{pendientes.length}</CountBadge>}
          </SummaryValue>
          <SummaryLabel>{summary.recetasPendientes}</SummaryLabel>
        </SummaryCard>

        <SummaryCard>
          <SummaryValue>{proximosTurnos.length}</SummaryValue>
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
            {recetasPendientes.map((receta) => (
              <Card key={receta.id} title={receta.estudio}>
                <CardBody>
                  {time.hace} {receta.diasDesde} {receta.diasDesde === 1 ? time.dia : time.dias}
                </CardBody>
                <CardFooter>
                  <Badge status={receta.estado} />
                  <Button variant="primary" onClick={() => navigate(`/receta/${receta.id}`)}>{actions.pedirTurno}</Button>
                </CardFooter>
              </Card>
            ))}
          </CardList>
        )}
      </Section>

      {/* Próximos turnos */}
      <Section>
        <SectionHeader>{sections.proximosTurnos}</SectionHeader>

        {proximosTurnos.length === 0 ? (
          <EmptyMessage>{empty.noTurnosProximos}</EmptyMessage>
        ) : (
          <CardList>
            {proximosTurnos.map((turno) => (
              <Card key={turno.id} title={turno.estudio}>
                <CardBody>{turno.fecha} · {turno.hora} hs</CardBody>
                <CardFooter>
                  <Badge status={turno.estado} />
                </CardFooter>
              </Card>
            ))}
          </CardList>
        )}
      </Section>
    </>
  )
}
