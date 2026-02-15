# Turno Fácil — CLAUDE.md

## Descripción
Sistema de gestión de turnos médicos. Webapp mobile-first para que pacientes gestionen citas con profesionales de salud.

## Stack Tecnológico

### Frontend
| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React | 19 |
| Lenguaje | TypeScript | 5.6 |
| Build | Vite | 6 |
| Estilos | styled-components + Tailwind CSS v4 | 6.3 / 4.1 |
| Routing | React Router DOM | 7.13 |
| Formularios | React Hook Form | 7.71 |
| HTTP | Axios | 1.13 |
| Iconos | Lucide React | 0.564 |
| UI accesible | Headless UI | 2.2 |

### Backend
| Capa | Tecnología | Versión |
|---|---|---|
| Runtime | Vercel Serverless Functions | — |
| ORM | Prisma | 7.4 |
| DB adapter | @prisma/adapter-pg + pg | 7.4 / 8.18 |
| Base de datos | Supabase (PostgreSQL) | — |
| Storage | Supabase Storage | — |
| OCR | pdf-parse + Tesseract.js | 2.4 / 5.x |
| Auth (pendiente) | JWT + Google OAuth | — |

**Node.js**: v22.22.0 (LTS) — **npm**: 10.9.4

## Estructura del Proyecto

```
├── api/                               # Vercel Serverless Functions
│   ├── hello.js                       # Health check endpoint
│   ├── lib/
│   │   ├── prisma.js                  # Prisma client singleton (adapter-pg)
│   │   ├── supabase.js                # Supabase client
│   │   ├── storage.js                 # Helpers: uploadPDF, getPublicUrl, deletePDF
│   │   ├── ocr.js                     # analyzeRecetaPDF() — pdf-parse + Tesseract.js + regex
│   │   ├── testUser.js                # getOrCreateTestUser() — test@turno-facil.com
│   │   └── seed.js                    # Script: crear usuario de prueba
│   └── recetas/
│       ├── create.js                  # POST — crear receta
│       ├── list.js                    # GET — listar por usuario
│       ├── [id].js                    # GET — detalle por ID
│       ├── update.js                  # PATCH — actualizar receta
│       └── upload-and-analyze.js      # POST — upload PDF + OCR con Tesseract.js
├── prisma/
│   └── schema.prisma                  # Modelos: Usuario, Receta, Turno
├── prisma.config.ts                   # Prisma 7 config (datasource URL)
├── src/
│   ├── App.tsx                        # Router principal (BrowserRouter + Routes)
│   ├── index.css                      # Tailwind config (@theme) + base styles
│   ├── main.tsx                       # Entry point (React 19 + StrictMode)
│   ├── vite-env.d.ts                  # Tipos de Vite
│   ├── assets/                        # Imágenes, fuentes (vacío)
│   ├── components/
│   │   ├── Layout.tsx / .styles.ts    # Layout con Outlet (header + sidebar + bottom nav)
│   │   ├── FileUpload.tsx / .styles.ts # Drag & drop de archivos (reutilizable)
│   │   └── ui/
│   │       ├── Button.tsx / .styles.ts # Variantes: primary, secondary, danger
│   │       ├── Card.tsx / .styles.ts   # Tarjeta contenedora con título opcional
│   │       └── Badge.tsx / .styles.ts  # Estados: pendiente, enviado, confirmado
│   ├── hooks/                         # Custom hooks (vacío)
│   ├── pages/
│   │   ├── Dashboard/                # Dashboard: datos reales vía fetchRecetas()
│   │   ├── Perfil/                   # Formulario datos personales
│   │   ├── NuevaReceta/              # Upload PDF + OCR con estado de progreso
│   │   ├── DetalleReceta/            # Detalle real vía fetchReceta(id)
│   │   └── Page.styles.ts            # Estilos compartidos
│   ├── services/
│   │   └── api.ts                    # uploadReceta, fetchRecetas, fetchReceta + tipos (RecetaResponse, TurnoResponse)
│   └── utils/                         # Funciones utilitarias (vacío)
├── vercel.json                        # Config de Vercel (rewrites)
├── .env.example                       # Template de variables de entorno
└── README-BACKEND.md                  # Guía de setup del backend
```

## Prisma 7 — Configuración

Prisma 7 requiere:
1. **prisma.config.ts** en la raíz: define `datasource.url` para CLI (generate, db push)
2. **@prisma/adapter-pg**: adapter obligatorio para PrismaClient constructor
3. **prisma-client-js** generator: genera JavaScript (no TypeScript)
4. **createRequire**: necesario para importar `@prisma/client` en ESM (`.js` con `"type": "module"`)

```js
// api/lib/prisma.js — patrón singleton
import { createRequire } from 'node:module'
import { PrismaPg } from '@prisma/adapter-pg'
const require = createRequire(import.meta.url)
const { PrismaClient } = require('@prisma/client')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
```

## Base de datos (Prisma)

```
Usuario  1──n  Receta  1──1  Turno
```

| Modelo | Campos clave |
|---|---|
| **Usuario** | email (unique), nombre, dni, obraSocial, nroAfiliado, telefono, direccion? |
| **Receta** | pdfUrl, pdfNombreOriginal, medicoSolicitante?, estudios (JSON)?, estado ("pendiente" default) |
| **Turno** | recetaId (unique), fecha, hora, detalles?, recordatorioEnviado |

## API Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/hello` | Health check |
| POST | `/api/recetas/create` | Crear receta |
| GET | `/api/recetas/list?usuarioId=` | Listar recetas del usuario |
| GET | `/api/recetas/[id]` | Detalle de receta |
| PATCH | `/api/recetas/update` | Actualizar receta |
| POST | `/api/recetas/upload-and-analyze` | Upload PDF + OCR con Tesseract.js |

## Routing (Frontend)

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | Dashboard | Pantalla principal, lista de turnos |
| `/perfil` | Perfil | Datos personales del usuario |
| `/nueva-receta` | NuevaReceta | Subir receta PDF |
| `/receta/:id` | DetalleReceta | Detalle de una receta (param dinámico) |

**Patrón**: Layout como route padre con `<Outlet />`.
**Navegación**: `NavLink` con `.active` automática. Bottom nav (mobile): Inicio, Nueva Receta, Perfil.

## Convenciones

### Estilos
- **Patrón**: cada componente tiene su archivo `.styles.ts` separado con styled-components
- **Componentes** (`.tsx`): solo lógica y estructura JSX, sin estilos inline
- **Estilos** (`.styles.ts`): styled-components con CSS puro, media queries explícitas
- **Props transient**: prefijo `$` para props de estilo (`$variant`, `$status`, `$open`)
- **Tailwind**: disponible en `index.css` para utilidades puntuales

### Backend
- **Serverless functions**: cada endpoint en su propio archivo `.js` en `/api`
- **CORS**: headers seteados manualmente en cada función
- **Prisma 7**: singleton con `@prisma/adapter-pg`, `createRequire` para imports CJS
- **dotenv**: importar `'dotenv/config'` en módulos que leen env vars directamente
- **Supabase**: client en `api/lib/supabase.js`, storage helpers en `api/lib/storage.js`
- **Errores**: try/catch con status codes (400, 404, 405, 500)

### Paleta de Colores
| Token | Hex | Uso |
|---|---|---|
| primary | #3B82F6 | Acciones principales, header, links activos |
| primary-light | #60A5FA | Hover suave |
| primary-dark | #2563EB | Hover fuerte, pressed |
| secondary | #64748B | Texto secundario |
| accent | #10B981 | Éxito, confirmaciones |
| danger | #EF4444 | Errores, eliminaciones |
| warning | #F59E0B | Alertas, pendientes |

## Scripts

```bash
# Frontend
npm run dev           # Servidor de desarrollo Vite (proxy /api → localhost:3000)
npm run build         # Type check + build producción
npm run preview       # Preview del build
npm run lint          # ESLint
npm run type-check    # Verificación de tipos TS

# Backend / DB
npm run db:generate   # Generar Prisma Client
npm run db:push       # Sincronizar schema con DB
npm run db:studio     # GUI de Prisma para la DB
npm run seed          # Crear usuario de prueba en la DB
npm run vercel:dev    # Dev server con serverless functions
```

## Setup Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Completar con valores reales de Supabase

# 3. Generar Prisma Client
npm run db:generate

# 4. Crear tablas en la base de datos
npm run db:push

# 5. Crear usuario de prueba
npm run seed

# 6. Desarrollo local (dos terminales)
npm run vercel:dev    # Terminal 1: backend en localhost:3000
npm run dev           # Terminal 2: frontend en localhost:5173 (proxy a backend)
```

## Variables de entorno requeridas

| Variable | Descripción | Configurada |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL (Supabase) | Sí |
| `SUPABASE_URL` | URL del proyecto Supabase | Sí |
| `SUPABASE_ANON_KEY` | Clave pública de Supabase | Sí |
| `SUPABASE_SERVICE_KEY` | Clave de servicio de Supabase | Sí |
| `JWT_SECRET` | Secreto para tokens JWT | Sí |
| `GOOGLE_CLIENT_ID` | OAuth de Google (pendiente) | No |
| `GOOGLE_CLIENT_SECRET` | OAuth de Google (pendiente) | No |

## Estado Actual
- [x] Scaffold del proyecto (Vite + React + TS)
- [x] Dependencias MVP instaladas
- [x] Layout mobile-first con header, sidebar y bottom nav
- [x] Componentes UI base (Button, Card, Badge, FileUpload)
- [x] Estilos separados con styled-components
- [x] Routing con React Router (4 rutas, NavLink con estado activo)
- [x] Páginas: Dashboard, Perfil, NuevaReceta, DetalleReceta
- [x] Formulario de perfil con React Hook Form
- [x] Backend: Vercel serverless functions configurado
- [x] Base de datos: Prisma 7 schema + tablas creadas en Supabase
- [x] Prisma Client generado con adapter-pg
- [x] Storage: Supabase helpers (upload, getUrl, delete)
- [x] CRUD: Endpoints de recetas (create, list, [id], update)
- [x] OCR: pdf-parse + Tesseract.js + regex parser (api/lib/ocr.js)
- [x] Upload + OCR endpoint (api/recetas/upload-and-analyze.js)
- [x] Frontend: servicio API (src/services/api.ts)
- [x] Frontend: NuevaReceta con progreso de upload/análisis
- [x] Páginas migradas a subdirectorios con index.ts barrel exports
- [x] Seed script con usuario de prueba y retry logic
- [x] Vite proxy configurado (/api → localhost:3000)
- [x] Seed ejecutado: usuario de prueba creado (ID: 31e07434-33b3-4dda-91ef-d3d843f93bce)
- [x] Integración frontend ↔ backend: Dashboard consume /api/recetas/list (datos reales)
- [x] Integración frontend ↔ backend: DetalleReceta consume /api/recetas/[id] (datos reales)
- [x] Dashboard: estados loading/error, cálculo diasDesde, formateo fechas
- [x] DetalleReceta: estados loading/error, descarga PDF real, formateo fechas
- [x] Vercel CLI configurado y linkeado al proyecto
- [ ] Autenticación (JWT + Google OAuth)
- [ ] Envío de emails para pedir turnos
