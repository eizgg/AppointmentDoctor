import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { fetchRecetas } from '../../../services/api'
import type { RecetaResponse } from '../../../services/api'

const TEST_USER_ID = '31e07434-33b3-4dda-91ef-d3d843f93bce'

const mockNavigate = jest.fn()
const mockScanGmail = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../../services/api', () => ({
  fetchRecetas: jest.fn(),
}))

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: TEST_USER_ID, email: 'test@turno-facil.com', nombre: 'Test User', hasGmailAccess: false },
    isAuthenticated: true,
    isLoading: false,
    gmailScanStatus: 'idle',
    gmailScanResult: null,
    scanGmail: mockScanGmail,
  }),
}))

const mockFetchRecetas = fetchRecetas as jest.MockedFunction<typeof fetchRecetas>

function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

function todayISO() {
  return new Date().toISOString()
}

function daysAgoISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function createReceta(overrides: Partial<RecetaResponse> = {}): RecetaResponse {
  return {
    id: 'receta-default',
    pdfUrl: '',
    pdfNombreOriginal: '',
    medicoSolicitante: null,
    especialidad: null,
    fechaEmision: null,
    estudios: ['Estudio Base'],
    estado: 'pendiente',
    createdAt: todayISO(),
    turno: null,
    ...overrides,
  }
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
    mockScanGmail.mockClear()
  })

  it('muestra estado de carga mientras obtiene datos', () => {
    mockFetchRecetas.mockImplementation(() => new Promise(() => {}))

    renderWithRouter()

    expect(screen.getByText(/Cargando .*rdenes/i)).toBeInTheDocument()
    expect(mockFetchRecetas).toHaveBeenCalledWith(TEST_USER_ID)
  })

  it('muestra error cuando fetchRecetas falla', async () => {
    mockFetchRecetas.mockRejectedValue(new Error('network'))

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar las .*rdenes/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/.*rdenes Pendientes/i)).not.toBeInTheDocument()
  })

  it('muestra estados vacios cuando no hay recetas', async () => {
    mockFetchRecetas.mockResolvedValue([])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/No ten.s .*rdenes pendientes/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/No ten.s turnos pr.ximos/i)).toBeInTheDocument()
  })

  it('agrupa ordenes pendientes por especialidad', async () => {
    mockFetchRecetas.mockResolvedValue([
      createReceta({ id: 'r1', especialidad: 'Gastroenterologia', estudios: ['Endoscopia'] }),
      createReceta({ id: 'r2', especialidad: 'Cardiologia', estudios: ['Holter'], estado: 'enviado' }),
    ])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Endoscopia')).toBeInTheDocument()
      expect(screen.getByText('Holter')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { level: 3, name: 'Gastroenterologia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Cardiologia' })).toBeInTheDocument()
  })

  it('agrupa especialidades ignorando mayusculas/minusculas', async () => {
    mockFetchRecetas.mockResolvedValue([
      createReceta({ id: 'r1', especialidad: 'Gastroenterologia', estudios: ['Colonoscopia'] }),
      createReceta({ id: 'r2', especialidad: 'gastroenterologia', estudios: ['Endoscopia'] }),
    ])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Colonoscopia')).toBeInTheDocument()
      expect(screen.getByText('Endoscopia')).toBeInTheDocument()
    })

    expect(screen.getAllByRole('heading', { level: 3, name: /gastroenterologia/i })).toHaveLength(1)
  })

  it('usa Sin especialidad cuando especialidad es null o vacia', async () => {
    mockFetchRecetas.mockResolvedValue([
      createReceta({ id: 'r1', especialidad: null, estudios: ['Estudio A'] }),
      createReceta({ id: 'r2', especialidad: '   ', estudios: ['Estudio B'], estado: 'enviado' }),
    ])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText('Estudio A')).toBeInTheDocument()
      expect(screen.getByText('Estudio B')).toBeInTheDocument()
    })

    expect(screen.getAllByRole('heading', { level: 3, name: /Sin especialidad/i })).toHaveLength(1)
  })

  it('agrupa proximos turnos por especialidad', async () => {
    mockFetchRecetas.mockResolvedValue([
      createReceta({
        id: 'r1',
        especialidad: 'Gastroenterologia',
        estado: 'confirmado',
        estudios: ['Endoscopia'],
        turno: { id: 't1', recetaId: 'r1', fecha: '2026-03-04', hora: '10:30', detalles: null },
      }),
      createReceta({
        id: 'r2',
        especialidad: 'Traumatologia',
        estado: 'confirmado',
        estudios: ['Resonancia'],
        turno: { id: 't2', recetaId: 'r2', fecha: '2026-03-05', hora: '11:00', detalles: null },
      }),
    ])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/10:30 hs/)).toBeInTheDocument()
      expect(screen.getByText(/11:00 hs/)).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { level: 3, name: 'Gastroenterologia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Traumatologia' })).toBeInTheDocument()
  })

  it('mantiene navegacion al detalle desde orden pendiente', async () => {
    mockFetchRecetas.mockResolvedValue([
      createReceta({
        id: 'receta-123',
        especialidad: 'Clinica',
        estudios: ['Laboratorio'],
        estado: 'pendiente',
      }),
    ])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/Pedir Turno/i)).toBeInTheDocument()
    })

    const user = userEvent.setup()
    await user.click(screen.getByText(/Pedir Turno/i))

    expect(mockNavigate).toHaveBeenCalledWith('/receta/receta-123')
  })

  it('sigue mostrando tiempos relativos en pendientes', async () => {
    mockFetchRecetas.mockResolvedValue([
      createReceta({
        id: 'r1',
        especialidad: 'Clinica',
        estudios: ['Laboratorio'],
        estado: 'pendiente',
        createdAt: daysAgoISO(1),
      }),
    ])

    renderWithRouter()

    await waitFor(() => {
      expect(screen.getByText(/Hace 1 d.a/i)).toBeInTheDocument()
    })
  })
})
