# Backend — Turno Fácil

## Arquitectura

- **Runtime**: Vercel Serverless Functions (Node.js)
- **Base de datos**: Supabase (PostgreSQL) via Prisma 7 ORM + @prisma/adapter-pg
- **Storage**: Supabase Storage (bucket `recetas` para PDFs)
- **OCR**: Claude API (claude-sonnet-4-5-20250929) + pdf-parse
- **Auth** (pendiente): JWT + Google OAuth

## Configuración

### 1. Variables de entorno

Copiá `.env.example` a `.env` y completá los valores:

```bash
cp .env.example .env
```

| Variable | Dónde obtenerla |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (URI) |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` `public` |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → `service_role` (secreto) |
| `JWT_SECRET` | Cualquier string secreto largo |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `ANTHROPIC_API_KEY` | Anthropic Console |

### 2. Generar Prisma Client

```bash
npm run db:generate
```

### 3. Sincronizar schema con la base de datos

```bash
npm run db:push
```

### 4. Crear usuario de prueba

```bash
npm run seed
```

Esto crea un usuario `test@turno-facil.com` y muestra su ID para usar en el frontend.

### 5. Explorar datos (opcional)

```bash
npm run db:studio
```

## Prisma 7

El proyecto usa Prisma 7 que tiene cambios significativos respecto a versiones anteriores:

- **prisma.config.ts**: define la URL de conexión para comandos CLI (generate, db push)
- **@prisma/adapter-pg**: adapter obligatorio para el constructor de PrismaClient
- **createRequire**: necesario porque `@prisma/client` es CJS y el proyecto usa ESM
- **Singleton**: `api/lib/prisma.js` cachea la instancia en `globalThis.__prisma` en dev

## Endpoints

### Health check
```
GET /api/hello → { message: "API funcionando", timestamp: "..." }
```

### Recetas CRUD

| Método | Endpoint | Body / Query | Descripción |
|---|---|---|---|
| POST | `/api/recetas/create` | `{ usuarioId, pdfUrl, pdfNombreOriginal }` | Crear receta |
| GET | `/api/recetas/list` | `?usuarioId=xxx` | Listar recetas del usuario |
| GET | `/api/recetas/[id]` | — | Detalle de una receta |
| PATCH | `/api/recetas/update` | `{ id, ...campos }` | Actualizar receta |
| POST | `/api/recetas/upload-and-analyze` | `{ fileName, fileBase64, usuarioId }` | Upload PDF + OCR |

Todos los endpoints devuelven JSON y manejan CORS.

### Upload + OCR Flow

1. Cliente envía PDF en base64 + nombre + usuarioId
2. Server valida (máx 10MB, formato PDF)
3. Sube a Supabase Storage → obtiene URL pública
4. Crea receta en DB con estado `"procesando"`
5. Llama a Claude API para OCR (médico, fecha, estudios)
6. Actualiza receta con datos extraídos, estado `"pendiente"`
7. Si OCR falla → estado `"error_ocr"` (no falla el request)

## Desarrollo local

### Opción 1: Vercel CLI (recomendada)

```bash
npm i -g vercel    # Si no está instalado
npm run vercel:dev # Backend + frontend en localhost:3000
```

### Opción 2: Frontend y backend separados

```bash
# Terminal 1: Backend (Vercel serverless functions)
npm run vercel:dev

# Terminal 2: Frontend (Vite con proxy a localhost:3000)
npm run dev
```

El proxy de Vite redirige `/api/*` a `http://localhost:3000`.

## Storage (Supabase)

Helpers disponibles en `api/lib/storage.js`:

```js
import { uploadPDF, getPublicUrl, deletePDF } from './lib/storage.js'

// Subir PDF
const { path, error } = await uploadPDF(buffer, 'receta.pdf', userId)

// Obtener URL pública
const url = getPublicUrl(path)

// Eliminar
const { error } = await deletePDF(path)
```

Requiere crear el bucket `recetas` en Supabase Dashboard → Storage.

## Modelos (Prisma)

```
Usuario  1──n  Receta  1──1  Turno
```

- **Usuario**: email, nombre, DNI, obra social, nro afiliado, teléfono, dirección
- **Receta**: PDF, médico, estudios (JSON), estado, fecha pedido turno
- **Turno**: fecha, hora, detalles, recordatorio enviado

## Usuario de prueba

Creado por `npm run seed`:

| Campo | Valor |
|---|---|
| email | test@turno-facil.com |
| nombre | Usuario de Prueba |
| dni | 12345678 |
| obraSocial | OSDE |
| nroAfiliado | 123456789 |
| telefono | +5491123456789 |
| direccion | Calle Falsa 123, CABA |
