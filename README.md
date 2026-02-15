<div align="center">

# 🏥 Turno Fácil

### Sistema inteligente de gestión de turnos médicos

[![Node.js](https://img.shields.io/badge/Node.js-22.22.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Simplifica la gestión de tus citas médicas. Sube tu receta, nosotros nos encargamos del resto.**

[Demo en Vivo](#) · [Documentación](#) · [Reportar Bug](https://github.com/eizgg/ApointmentDoctor/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Flujo de Datos](#-flujo-de-datos)
- [Modelo de Datos](#-modelo-de-datos)
- [Inicio Rápido](#-inicio-rápido)
- [Scripts Disponibles](#-scripts-disponibles)
- [API Endpoints](#-api-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Sobre el Proyecto

**Turno Fácil** es una aplicación web mobile-first que revoluciona la forma en que los pacientes gestionan sus turnos médicos.

### El Problema
- ❌ Llamadas telefónicas interminables para pedir turnos
- ❌ Pérdida de recetas médicas en papel
- ❌ Falta de seguimiento centralizado de estudios y citas

### Nuestra Solución
- ✅ **Upload inteligente**: Sube tu receta médica en PDF
- ✅ **OCR automático**: Extraemos médico, estudios y fechas automáticamente
- ✅ **Gestión centralizada**: Todas tus recetas y turnos en un solo lugar
- ✅ **Mobile-first**: Diseñado para usar desde tu celular

---

## ✨ Características

| Feature | Descripción | Estado |
|---------|-------------|--------|
| 📤 **Upload de Recetas** | Sube archivos PDF mediante drag & drop | ✅ Completado |
| 🔍 **OCR Inteligente** | Análisis automático con Tesseract.js | ✅ Completado |
| 📊 **Dashboard** | Vista general de todas tus recetas y turnos | ✅ Completado |
| 📝 **Gestión de Perfil** | Actualiza tus datos personales y obra social | ✅ Completado |
| 🔐 **Autenticación** | Login seguro con Google OAuth | 🚧 En progreso |
| 📧 **Notificaciones** | Recordatorios de turnos por email | 📅 Planeado |
| 📱 **PWA** | Instalable como app nativa | 📅 Planeado |

---

## 🏗 Arquitectura

```mermaid
graph TB
    subgraph "Frontend - React 19"
        A[📱 UI Components] --> B[🎨 styled-components]
        A --> C[🔄 React Router]
        A --> D[📝 React Hook Form]
    end

    subgraph "Backend - Vercel Serverless"
        E[⚡ API Functions] --> F[🔍 OCR Engine]
        E --> G[🗄️ Prisma ORM]
        F --> H[📄 Tesseract.js]
        F --> I[📑 pdf-parse]
    end

    subgraph "Database & Storage"
        J[(🐘 PostgreSQL)]
        K[📦 Supabase Storage]
    end

    A -->|HTTP/Axios| E
    G -->|@prisma/adapter-pg| J
    E -->|Upload/Download| K

    style A fill:#3B82F6,stroke:#2563EB,color:#fff
    style E fill:#10B981,stroke:#059669,color:#fff
    style J fill:#336791,stroke:#2D5A7B,color:#fff
    style K fill:#3ECF8E,stroke:#2DA771,color:#fff
```

### Tecnologías Clave

#### ⚛️ Frontend
- **React 19** - UI library con Server Components
- **TypeScript 5.6** - Type safety
- **Vite 6** - Build tool ultrarrápido
- **styled-components** - CSS-in-JS con theming
- **Tailwind CSS v4** - Utility-first CSS
- **React Router v7** - Routing declarativo
- **React Hook Form** - Validación de formularios

#### 🎨 UI/UX
- **Lucide React** - Iconos modernos
- **Headless UI** - Componentes accesibles sin estilos

#### 🔧 Backend
- **Vercel Serverless Functions** - Backend escalable sin servidor
- **Prisma 7** - ORM type-safe con Prisma Migrate
- **Supabase** - PostgreSQL managed + Storage
- **Tesseract.js** - OCR en JavaScript (WebAssembly)
- **pdf-parse** - Extracción de texto de PDFs

#### 🗄️ Database
- **PostgreSQL 15** - Base de datos relacional
- **Supabase Storage** - Almacenamiento de archivos

---

## 🔄 Flujo de Datos

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant API as Vercel API
    participant OCR as Tesseract OCR
    participant Storage as Supabase Storage
    participant DB as PostgreSQL

    Usuario->>Frontend: 1. Sube PDF de receta
    Frontend->>API: 2. POST /api/recetas/upload-and-analyze
    API->>Storage: 3. Upload PDF
    Storage-->>API: 4. URL pública del archivo
    API->>OCR: 5. Analizar PDF (texto + regex)
    OCR-->>API: 6. Datos extraídos<br/>(médico, estudios, fecha)
    API->>DB: 7. Crear registro de Receta
    DB-->>API: 8. Receta guardada
    API-->>Frontend: 9. Respuesta con datos
    Frontend->>Usuario: 10. Confirmar datos<br/>y solicitar turno
```

### Proceso de OCR

1. **Upload**: El PDF se sube a Supabase Storage
2. **Parsing**: `pdf-parse` extrae el texto plano del PDF
3. **OCR**: Si el PDF es imagen, Tesseract.js convierte imagen → texto
4. **Extracción**: Regex extrae datos estructurados (médico, estudios, fecha)
5. **Persistencia**: Los datos se guardan en PostgreSQL via Prisma

---

## 🗄️ Modelo de Datos

```mermaid
erDiagram
    Usuario ||--o{ Receta : "tiene"
    Receta ||--o| Turno : "genera"

    Usuario {
        uuid id PK
        string email UK "unique"
        string nombre
        string dni
        string obraSocial
        string nroAfiliado
        string telefono
        string direccion
        datetime createdAt
        datetime updatedAt
    }

    Receta {
        uuid id PK
        uuid usuarioId FK
        string pdfUrl "URL en Supabase Storage"
        string pdfNombreOriginal
        string medicoSolicitante
        json estudios "Array de estudios"
        string estado "pendiente|enviado|confirmado"
        datetime createdAt
        datetime updatedAt
    }

    Turno {
        uuid id PK
        uuid recetaId FK "unique"
        datetime fecha
        string hora
        string detalles
        boolean recordatorioEnviado
        datetime createdAt
        datetime updatedAt
    }
```

### Estados de Receta

| Estado | Descripción | Color |
|--------|-------------|-------|
| `pendiente` | Receta subida, esperando solicitud de turno | 🟡 Warning |
| `enviado` | Solicitud de turno enviada al centro médico | 🔵 Primary |
| `confirmado` | Turno confirmado por el centro médico | 🟢 Success |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 22.22.0 (LTS)
- **npm** >= 10.9.4
- Cuenta en [Supabase](https://supabase.com) (para DB + Storage)
- Cuenta en [Vercel](https://vercel.com) (opcional, para deploy)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/eizgg/ApointmentDoctor.git
cd ApointmentDoctor

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

**Variables de entorno requeridas** (`.env`):

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_KEY="tu-service-role-key"
JWT_SECRET="tu-secreto-jwt-256-bits"
```

```bash
# 4. Generar Prisma Client
npm run db:generate

# 5. Sincronizar schema con la base de datos
npm run db:push

# 6. Crear usuario de prueba (opcional)
npm run seed
```

### Desarrollo Local

Necesitas **dos terminales** ejecutando simultáneamente:

```bash
# Terminal 1 - Backend (Vercel Functions)
npm run vercel:dev
# Escucha en localhost:3000

# Terminal 2 - Frontend (Vite)
npm run dev
# Escucha en localhost:5173 (con proxy a :3000 para /api)
```

Abre tu navegador en **http://localhost:5173** 🎉

---

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo Vite (frontend) |
| `npm run build` | Compila TypeScript + build de producción |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Ejecuta ESLint en el código |
| `npm run type-check` | Verifica tipos de TypeScript sin compilar |
| `npm run db:generate` | Genera Prisma Client desde `schema.prisma` |
| `npm run db:push` | Sincroniza schema de Prisma con la DB |
| `npm run db:studio` | Abre Prisma Studio (GUI para la DB) |
| `npm run seed` | Crea usuario de prueba en la DB |
| `npm run vercel:dev` | Inicia servidor de desarrollo Vercel (backend) |

---

## 🔌 API Endpoints

### Recetas

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| `GET` | `/api/hello` | Health check | - |
| `POST` | `/api/recetas/create` | Crear receta manualmente | `{ usuarioId, pdfUrl, ... }` |
| `GET` | `/api/recetas/list?usuarioId=` | Listar recetas del usuario | Query param |
| `GET` | `/api/recetas/[id]` | Detalle de receta por ID | Path param |
| `PATCH` | `/api/recetas/update` | Actualizar receta | `{ id, estado, ... }` |
| `POST` | `/api/recetas/upload-and-analyze` | Upload PDF + OCR automático | `FormData` (file) |

### Ejemplo de Request

```bash
# Upload y análisis de receta
curl -X POST http://localhost:3000/api/recetas/upload-and-analyze \
  -F "file=@receta.pdf" \
  -F "usuarioId=31e07434-33b3-4dda-91ef-d3d843f93bce"
```

**Response** (200 OK):
```json
{
  "receta": {
    "id": "abc-123",
    "pdfUrl": "https://...",
    "medicoSolicitante": "Dr. García",
    "estudios": ["Resonancia Magnética", "Análisis de sangre"],
    "estado": "pendiente",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "analisisOCR": {
    "textoCompleto": "...",
    "confianza": 0.89
  }
}
```

---

## 📁 Estructura del Proyecto

```
📦 ApointmentDoctor
├── 📂 api/                          # Vercel Serverless Functions
│   ├── 📄 hello.js                  # Health check endpoint
│   ├── 📂 lib/
│   │   ├── 📄 prisma.js             # Singleton de Prisma Client
│   │   ├── 📄 supabase.js           # Cliente de Supabase
│   │   ├── 📄 storage.js            # Helpers de Supabase Storage
│   │   ├── 📄 ocr.js                # Engine de OCR (Tesseract + regex)
│   │   ├── 📄 testUser.js           # Crear usuario de prueba
│   │   └── 📄 seed.js               # Script de seeding
│   └── 📂 recetas/
│       ├── 📄 create.js             # POST - Crear receta
│       ├── 📄 list.js               # GET - Listar recetas
│       ├── 📄 [id].js               # GET - Detalle de receta
│       ├── 📄 update.js             # PATCH - Actualizar receta
│       └── 📄 upload-and-analyze.js # POST - Upload + OCR
│
├── 📂 prisma/
│   └── 📄 schema.prisma             # Modelos de datos (Usuario, Receta, Turno)
│
├── 📂 src/                          # Código fuente del frontend
│   ├── 📄 App.tsx                   # Router principal
│   ├── 📄 main.tsx                  # Entry point de React
│   ├── 📄 index.css                 # Tailwind config + estilos base
│   │
│   ├── 📂 components/
│   │   ├── 📄 Layout.tsx            # Layout con header + sidebar + bottom nav
│   │   ├── 📄 Layout.styles.ts      # Estilos del Layout
│   │   ├── 📄 FileUpload.tsx        # Componente de drag & drop
│   │   └── 📂 ui/
│   │       ├── 📄 Button.tsx        # Botones (primary, secondary, danger)
│   │       ├── 📄 Card.tsx          # Tarjetas contenedoras
│   │       └── 📄 Badge.tsx         # Badges de estado
│   │
│   ├── 📂 pages/
│   │   ├── 📂 Dashboard/            # Pantalla principal
│   │   ├── 📂 Perfil/               # Formulario de datos personales
│   │   ├── 📂 NuevaReceta/          # Upload de recetas
│   │   ├── 📂 DetalleReceta/        # Detalle de receta individual
│   │   └── 📄 Page.styles.ts        # Estilos compartidos
│   │
│   ├── 📂 services/
│   │   └── 📄 api.ts                # Cliente HTTP (Axios) + tipos
│   │
│   └── 📂 utils/                    # Funciones utilitarias
│
├── 📄 vercel.json                   # Config de Vercel (rewrites)
├── 📄 prisma.config.ts              # Config de Prisma 7 (datasource URL)
├── 📄 package.json                  # Dependencias y scripts
├── 📄 tsconfig.json                 # Configuración de TypeScript
├── 📄 vite.config.ts                # Configuración de Vite
├── 📄 .env.example                  # Template de variables de entorno
└── 📄 README.md                     # Este archivo
```

---

## 🗺️ Roadmap

### ✅ Fase 1: MVP (Completada)
- [x] Setup del proyecto (Vite + React + TypeScript)
- [x] Layout responsive mobile-first
- [x] Sistema de componentes UI reutilizables
- [x] Backend con Vercel Serverless Functions
- [x] Integración con Supabase (DB + Storage)
- [x] OCR con Tesseract.js
- [x] CRUD completo de recetas
- [x] Dashboard con datos reales
- [x] Formulario de perfil

### 🚧 Fase 2: Autenticación (En Progreso)
- [ ] Login con Google OAuth 2.0
- [ ] JWT authentication
- [ ] Middleware de autenticación en API
- [ ] Protección de rutas en frontend
- [ ] Sesión persistente

### 📅 Fase 3: Notificaciones (Planeado)
- [ ] Sistema de emails transaccionales
- [ ] Recordatorios de turnos programados
- [ ] Confirmación de turnos por email
- [ ] Notificaciones push (PWA)

### 📅 Fase 4: Features Avanzadas
- [ ] Calendario interactivo de turnos
- [ ] Integración con APIs de centros médicos
- [ ] Historial médico completo
- [ ] Compartir recetas con familiares
- [ ] Exportar reportes en PDF
- [ ] Chat con soporte médico

### 📅 Fase 5: PWA & Performance
- [ ] Service Worker para offline
- [ ] Instalable como app nativa
- [ ] Optimización de imágenes
- [ ] Lazy loading de componentes
- [ ] Caché estratégica

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si querés ayudar a mejorar **Turno Fácil**, seguí estos pasos:

1. **Fork** el proyecto
2. Creá una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Hacé commit de tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrí un **Pull Request**

### Convenciones de Código

- **Estilos**: Cada componente tiene su `.styles.ts` separado
- **Props transient**: Usar prefijo `$` para props de estilo (`$variant`)
- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` nueva funcionalidad
  - `fix:` corrección de bugs
  - `docs:` cambios en documentación
  - `refactor:` refactorización sin cambios funcionales
  - `test:` agregar o modificar tests

---

## 🐛 Troubleshooting

### Error: "Prisma Client not found"
```bash
npm run db:generate
```

### Error: "Connection to database failed"
Verificá que tu `DATABASE_URL` en `.env` sea correcta y que la DB esté accesible.

### Error: "Module not found: @prisma/client"
```bash
npm install
npm run db:generate
```

### El OCR no extrae datos correctamente
- Asegurate de que el PDF tenga buena calidad de imagen
- Los PDFs escaneados necesitan mejor resolución para Tesseract.js
- Podés ajustar el `tessedit_pageseg_mode` en `api/lib/ocr.js`

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**eizgg**
- GitHub: [@eizgg](https://github.com/eizgg)
- Proyecto: [ApointmentDoctor](https://github.com/eizgg/ApointmentDoctor)

---

<div align="center">

**¿Te gustó el proyecto? ¡Dale una ⭐ en GitHub!**

Hecho con ❤️ y ☕ en Argentina

</div>
