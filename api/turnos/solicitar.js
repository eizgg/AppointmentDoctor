import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'
import { getGmailClient, downloadPdfFromUrl } from '../lib/gmail.js'
import { buildRawMessage, sendGmailMessage, detectarTipoEstudio } from '../lib/email.js'

function formatFecha(fecha) {
  if (!fecha) return 'No detectada'
  const d = new Date(fecha)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function buildBody(usuario, receta) {
  const estudios = Array.isArray(receta.estudios) && receta.estudios.length > 0
    ? receta.estudios.map((e) => `  - ${e}`).join('\n')
    : '  - (ver orden adjunta)'

  return [
    'Buenos días,',
    '',
    'Solicito un turno para los siguientes estudios:',
    '',
    estudios,
    '',
    'Datos del paciente:',
    `  Nombre: ${usuario.nombre || '-'}`,
    `  DNI: ${usuario.dni || '-'}`,
    `  Obra social: ${usuario.obraSocial || '-'}`,
    `  N° de afiliado: ${usuario.nroAfiliado || '-'}`,
    `  Teléfono: ${usuario.telefono || '-'}`,
    `  Email: ${usuario.email}`,
    '',
    'Datos de la orden:',
    `  Médico solicitante: ${receta.medicoSolicitante || 'No detectado'}`,
    `  Especialidad: ${receta.especialidad || 'No detectada'}`,
    `  Fecha de emisión: ${formatFecha(receta.fechaEmision)}`,
    '',
    'Quedo a la espera de la disponibilidad de turnos.',
    'Muchas gracias.',
    `${usuario.nombre || ''}`.trim(),
  ].join('\n')
}

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' })
  }

  const decoded = requireAuth(req, res)
  if (!decoded) return

  try {
    const { recetaId, centroId, tipoOverride } = req.body

    if (!recetaId || !centroId) {
      return res.status(400).json({ error: 'Faltan campos requeridos: recetaId, centroId' })
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: decoded.userId } })
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (!usuario.gmailRefreshToken) {
      return res.status(400).json({ error: 'Gmail no conectado. Iniciá sesión con Google para poder enviar emails.' })
    }

    const receta = await prisma.receta.findUnique({ where: { id: recetaId } })
    if (!receta) {
      return res.status(404).json({ error: 'Orden no encontrada' })
    }
    if (receta.usuarioId !== usuario.id) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const centro = await prisma.centroMedico.findUnique({ where: { id: centroId } })
    if (!centro) {
      return res.status(404).json({ error: 'Centro médico no encontrado' })
    }
    if (centro.usuarioId !== usuario.id) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    // Determinar tipo y destino
    const tipo = tipoOverride === 'general' || tipoOverride === 'imagenes'
      ? tipoOverride
      : detectarTipoEstudio(receta)

    const usarImagenes = tipo === 'imagenes' && !!centro.emailImagenes
    const destino = usarImagenes ? centro.emailImagenes : centro.emailGeneral

    if (!destino) {
      return res.status(400).json({ error: 'El centro no tiene un email configurado para este tipo de turno.' })
    }

    // Adjuntar PDF de la orden cuando es un turno de imágenes
    let attachment
    if (usarImagenes && receta.pdfUrl) {
      try {
        const pdfBuffer = await downloadPdfFromUrl(receta.pdfUrl)
        attachment = {
          filename: receta.pdfNombreOriginal || 'orden-medica.pdf',
          content: pdfBuffer,
          mimeType: 'application/pdf',
        }
      } catch (pdfErr) {
        console.warn(`[Solicitar Turno] No se pudo adjuntar el PDF (${pdfErr.message}). Se envía sin adjunto.`)
      }
    }

    const gmail = await getGmailClient(usuario.gmailRefreshToken)
    const subject = `Solicitud de turno - ${usuario.nombre || usuario.email}${receta.especialidad ? ` - ${receta.especialidad}` : ''}`
    const raw = buildRawMessage({
      from: usuario.email,
      to: destino,
      subject,
      body: buildBody(usuario, receta),
      attachment,
    })

    const mailEnviadoId = await sendGmailMessage(gmail, raw)

    const recetaActualizada = await prisma.receta.update({
      where: { id: receta.id },
      data: {
        estado: 'enviado',
        mailEnviadoId,
        fechaPedidoTurno: new Date(),
      },
    })

    console.log(`[Solicitar Turno] Email enviado a ${destino} (tipo: ${tipo}) para receta ${receta.id}`)

    return res.status(200).json({
      ok: true,
      destino,
      tipo,
      adjunto: !!attachment,
      mailEnviadoId,
      receta: recetaActualizada,
    })
  } catch (error) {
    console.error('[Solicitar Turno] Error:', error)

    // Token de Gmail revocado/expirado → limpiar (mismo patrón que gmail/scan.js)
    if (error.message?.includes('invalid_grant') || error.message?.includes('Token has been expired or revoked')) {
      await prisma.usuario.update({
        where: { id: decoded.userId },
        data: { gmailRefreshToken: null, gmailConnectedAt: null },
      })
      return res.status(401).json({ error: 'El acceso a Gmail expiró. Volvé a iniciar sesión con Google.' })
    }

    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
