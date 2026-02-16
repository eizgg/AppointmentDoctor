import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../Dashboard'
import { fetchRecetas } from '../../../services/api'

const TEST_USER_ID = '31e07434-33b3-4dda-91ef-d3d843f93bce'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../../../services/api', () => ({
  fetchRecetas: jest.fn(),
}))

jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: TEST_USER_ID, email: 'test@turno-facil.com', nombre: 'Test User' },
    isAuthenticated: true,
    isLoading: false,
  }),
}))

const mockFetchRecetas = fetchRecetas as jest.MockedFunction<typeof fetchRecetas>

// Wrapper para proveer router
function renderWithRouter() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  )
}

// Helpers para fechas
function todayISO() {
  const d = new Date()
  return d.toISOString()
}

function daysAgoISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('estado de carga', () => {
    it('muestra mensaje de carga mientras obtiene datos', () => {
      mockFetchRecetas.mockImplementation(() => new Promise(() => {})) // Nunca resuelve

      renderWithRouter()

      expect(screen.getByText(/Cargando recetas/)).toBeInTheDocument()
      expect(mockFetchRecetas).toHaveBeenCalledWith(TEST_USER_ID)
    })
  })

  describe('manejo de errores', () => {
    it('muestra mensaje de error cuando fetchRecetas falla', async () => {
      mockFetchRecetas.mockRejectedValue(new Error('Error de red'))

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/No se pudieron cargar las recetas/)).toBeInTheDocument()
      })
    })

    it('no muestra contenido principal cuando hay error', async () => {
      mockFetchRecetas.mockRejectedValue(new Error('Error'))

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/No se pudieron cargar las recetas/)).toBeInTheDocument()
      })

      expect(screen.queryByText(/Recetas pendientes/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Próximos Turnos/)).not.toBeInTheDocument()
    })
  })

  describe('datos vacíos', () => {
    it('muestra mensajes vacíos cuando no hay recetas', async () => {
      mockFetchRecetas.mockResolvedValue([])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/No tenés recetas pendientes/)).toBeInTheDocument()
      })
      expect(screen.getByText(/No tenés turnos próximos/)).toBeInTheDocument()
    })

    it('muestra conteo 0 en resumen cuando no hay datos', async () => {
      mockFetchRecetas.mockResolvedValue([])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getAllByText('0')).toHaveLength(2) // Recetas pendientes y turnos próximos
      })
    })
  })

  describe('recetas pendientes', () => {
    it('muestra recetas con estado pendiente', async () => {
      const recetaPendiente = {
        id: 'r1',
        pdfUrl: 'http://example.com/1.pdf',
        pdfNombreOriginal: 'receta1.pdf',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: ['Radiografía', 'Laboratorio'],
        estado: 'pendiente',
        createdAt: todayISO(),
        turno: null,
      }

      mockFetchRecetas.mockResolvedValue([recetaPendiente])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText('Radiografía, Laboratorio')).toBeInTheDocument()
      })

      expect(screen.getByText(/Hoy/)).toBeInTheDocument()
      expect(screen.getByText(/Pedir Turno/)).toBeInTheDocument()
    })

    it('incluye recetas con estados pendiente, enviado, error_ocr y procesando', async () => {
      const recetas = [
        { id: 'r1', pdfUrl: '', pdfNombreOriginal: '', medicoSolicitante: null, fechaEmision: null, estudios: ['A'], estado: 'pendiente', createdAt: todayISO(), turno: null },
        { id: 'r2', pdfUrl: '', pdfNombreOriginal: '', medicoSolicitante: null, fechaEmision: null, estudios: ['B'], estado: 'enviado', createdAt: todayISO(), turno: null },
      ]

      mockFetchRecetas.mockResolvedValue(recetas)

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText('A')).toBeInTheDocument()
        expect(screen.getByText('B')).toBeInTheDocument()
      })

      expect(screen.getAllByText(/Pedir Turno/)).toHaveLength(2)
    })

    it('muestra "Sin estudios detectados" cuando estudios es null o vacío', async () => {
      const receta = {
        id: 'r1',
        pdfUrl: '',
        pdfNombreOriginal: '',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: null,
        estado: 'pendiente',
        createdAt: todayISO(),
        turno: null,
      }

      mockFetchRecetas.mockResolvedValue([receta])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText('Sin estudios detectados')).toBeInTheDocument()
      })
    })

    it('muestra "Hace X día" correctamente para recetas antiguas', async () => {
      const receta = {
        id: 'r1',
        pdfUrl: '',
        pdfNombreOriginal: '',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: ['Lab'],
        estado: 'pendiente',
        createdAt: daysAgoISO(1),
        turno: null,
      }

      mockFetchRecetas.mockResolvedValue([receta])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/Hace 1 día/)).toBeInTheDocument()
      })
    })

    it('navega a detalle de receta al hacer clic en Pedir Turno', async () => {
      const receta = {
        id: 'receta-123',
        pdfUrl: '',
        pdfNombreOriginal: '',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: ['Lab'],
        estado: 'pendiente',
        createdAt: todayISO(),
        turno: null,
      }

      mockFetchRecetas.mockResolvedValue([receta])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/Pedir Turno/)).toBeInTheDocument()
      })

      const user = userEvent.setup()
      await user.click(screen.getByText(/Pedir Turno/))

      expect(mockNavigate).toHaveBeenCalledWith('/receta/receta-123')
    })
  })

  describe('próximos turnos', () => {
    it('muestra turnos confirmados con fecha y hora formateada', async () => {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() + 2)
      const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`

      const recetaConTurno = {
        id: 'r1',
        pdfUrl: '',
        pdfNombreOriginal: '',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: ['Ecografía'],
        estado: 'confirmado',
        createdAt: todayISO(),
        turno: {
          id: 't1',
          recetaId: 'r1',
          fecha: fechaStr,
          hora: '10:30',
          detalles: null,
        },
      }

      mockFetchRecetas.mockResolvedValue([recetaConTurno])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/10:30 hs/)).toBeInTheDocument()
        expect(screen.getByText(/Ecografía/)).toBeInTheDocument()
        // Formato: "Día DD Mes · HH:MM hs" (ej: "Lun 16 Feb · 10:30 hs")
        expect(screen.getByText(/\w{3} \d{1,2} \w{3} · 10:30 hs/)).toBeInTheDocument()
      })
    })

    it('no incluye recetas pendientes en la sección de próximos turnos', async () => {
      const recetaPendiente = {
        id: 'r1',
        pdfUrl: '',
        pdfNombreOriginal: '',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: ['Lab'],
        estado: 'pendiente',
        createdAt: todayISO(),
        turno: { id: 't1', recetaId: 'r1', fecha: '2025-03-01', hora: '09:00', detalles: null },
      }

      mockFetchRecetas.mockResolvedValue([recetaPendiente])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/No tenés turnos próximos/)).toBeInTheDocument()
      })
    })

    it('muestra conteo correcto en resumen cuando hay pendientes y turnos', async () => {
      const recetaPendiente = {
        id: 'r1',
        pdfUrl: '',
        pdfNombreOriginal: '',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: ['A'],
        estado: 'pendiente',
        createdAt: todayISO(),
        turno: null,
      }

      const fecha = new Date()
      fecha.setDate(fecha.getDate() + 1)
      const fechaStr = fecha.toISOString().split('T')[0]

      const recetaConTurno = {
        id: 'r2',
        pdfUrl: '',
        pdfNombreOriginal: '',
        medicoSolicitante: null,
        fechaEmision: null,
        estudios: ['B'],
        estado: 'confirmado',
        createdAt: todayISO(),
        turno: { id: 't1', recetaId: 'r2', fecha: fechaStr, hora: '14:00', detalles: null },
      }

      mockFetchRecetas.mockResolvedValue([recetaPendiente, recetaConTurno])

      renderWithRouter()

      await waitFor(() => {
        expect(screen.getByText(/Recetas pendientes/)).toBeInTheDocument()
        expect(screen.getByText(/Turnos próximos/)).toBeInTheDocument()
        // Ambas secciones muestran contenido (pendiente A, turno B)
        expect(screen.getByText('A')).toBeInTheDocument()
        expect(screen.getByText('B')).toBeInTheDocument()
        expect(screen.getByText(/14:00 hs/)).toBeInTheDocument()
      })
    })
  })

  describe('llamada a API', () => {
    it('llama a fetchRecetas con el ID del usuario autenticado', async () => {
      mockFetchRecetas.mockResolvedValue([])

      renderWithRouter()

      await waitFor(() => {
        expect(mockFetchRecetas).toHaveBeenCalledTimes(1)
        expect(mockFetchRecetas).toHaveBeenCalledWith(TEST_USER_ID)
      })
    })
  })
})
