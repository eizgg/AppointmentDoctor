import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'
import { uploadPDF, getPublicUrl } from '../lib/storage.js'
import { analyzeRecetaPDF } from '../lib/ocr.js'
import {
  getGmailClient,
  searchOsdeEmails,
  getEmailContent,
  extractPdfLinks,
  downloadPdfFromUrl,
} from '../lib/gmail.js'

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
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (!usuario.gmailRefreshToken) {
      return res.status(400).json({ error: 'Gmail no conectado. Iniciá sesión con Google para conectar tu Gmail.' })
    }

    // Create Gmail client with refresh token
    const gmail = await getGmailClient(usuario.gmailRefreshToken)
    console.log('[Gmail Scan] Starting scan for user:', usuario.email)

    // Search for OSDE emails
    const messages = await searchOsdeEmails(gmail)
    console.log(`[Gmail Scan] Found ${messages.length} OSDE emails`)

    // Get already imported message IDs to skip duplicates (only skip successful ones)
    const existingRecetas = await prisma.receta.findMany({
      where: {
        usuarioId: usuario.id,
        mailEnviadoId: { not: null },
      },
      select: { id: true, mailEnviadoId: true, estado: true },
    })
    // Only skip messages that were successfully imported (not error_ocr)
    const successfulMessageIds = new Set(
      existingRecetas.filter((r) => r.estado !== 'error_ocr' && r.estado !== 'procesando').map((r) => r.mailEnviadoId)
    )
    // Track recetas with OCR errors so we can retry them
    const errorRecetasByMessageId = new Map(
      existingRecetas.filter((r) => r.estado === 'error_ocr' || r.estado === 'procesando').map((r) => [r.mailEnviadoId, r.id])
    )

    const result = {
      found: messages.length,
      imported: 0,
      reprocessed: 0,
      skipped: 0,
      errors: 0,
      recetas: [],
    }

    for (const message of messages) {
      // Skip already successfully imported emails
      if (successfulMessageIds.has(message.id)) {
        console.log(`[Gmail Scan] Skipping already imported message: ${message.id}`)
        result.skipped++
        continue
      }

      // Check if this is a retry of a failed OCR
      const existingRecetaId = errorRecetasByMessageId.get(message.id)

      try {
        // Get email content
        console.log(`[Gmail Scan] Processing message: ${message.id}`)
        const htmlBody = await getEmailContent(gmail, message.id)
        if (!htmlBody) {
          console.log(`[Gmail Scan] No HTML body found for message: ${message.id}`)
          result.errors++
          continue
        }
        console.log(`[Gmail Scan] HTML body length: ${htmlBody.length} chars`)

        // Extract PDF links
        const pdfLinks = extractPdfLinks(htmlBody)
        console.log(`[Gmail Scan] Found ${pdfLinks.length} PDF links in message ${message.id}:`, pdfLinks)
        if (pdfLinks.length === 0) {
          result.errors++
          continue
        }

        // If this is a retry, re-run OCR on the existing receta
        if (existingRecetaId) {
          console.log(`[Gmail Scan] Retrying OCR for existing receta: ${existingRecetaId}`)
          try {
            const existingReceta = await prisma.receta.findUnique({ where: { id: existingRecetaId } })
            if (existingReceta?.pdfUrl) {
              const ocrResult = await analyzeRecetaPDF(existingReceta.pdfUrl)

              const receta = await prisma.receta.update({
                where: { id: existingRecetaId },
                data: {
                  medicoSolicitante: ocrResult.medico || null,
                  especialidad: ocrResult.especialidad || null,
                  fechaEmision: ocrResult.fecha ? new Date(ocrResult.fecha) : null,
                  estudios: ocrResult.estudios,
                  estado: 'pendiente',
                },
              })
              result.recetas.push(receta)
              result.reprocessed++
              console.log(`[Gmail Scan] Successfully reprocessed receta: ${existingRecetaId}`)
            }
          } catch (retryError) {
            console.error(`[Gmail Scan] Retry OCR failed for receta ${existingRecetaId}:`, retryError.message)
            result.errors++
          }
          continue
        }

        // Process each PDF link from this email
        for (const pdfUrl of pdfLinks) {
          try {
            // Download PDF
            const pdfBuffer = await downloadPdfFromUrl(pdfUrl)

            // Generate filename
            const fileName = `osde-orden-${message.id}-${Date.now()}.pdf`

            // Upload to Supabase Storage
            const { path, error: uploadError } = await uploadPDF(pdfBuffer, fileName, usuario.id)
            if (uploadError) {
              console.error('Error uploading PDF from Gmail:', uploadError)
              result.errors++
              continue
            }

            const storedPdfUrl = getPublicUrl(path)

            // Create receta in DB
            let receta = await prisma.receta.create({
              data: {
                usuarioId: usuario.id,
                pdfUrl: storedPdfUrl,
                pdfNombreOriginal: fileName,
                estado: 'procesando',
                mailEnviadoId: message.id,
              },
            })

            // Run OCR
            try {
              const ocrResult = await analyzeRecetaPDF(storedPdfUrl)

              receta = await prisma.receta.update({
                where: { id: receta.id },
                data: {
                  medicoSolicitante: ocrResult.medico || null,
                  especialidad: ocrResult.especialidad || null,
                  fechaEmision: ocrResult.fecha ? new Date(ocrResult.fecha) : null,
                  estudios: ocrResult.estudios,
                  estado: 'pendiente',
                },
              })
            } catch (ocrError) {
              console.error('OCR error for Gmail PDF:', ocrError)
              receta = await prisma.receta.update({
                where: { id: receta.id },
                data: { estado: 'error_ocr' },
              })
            }

            result.recetas.push(receta)
            result.imported++
          } catch (pdfError) {
            console.error('Error processing PDF from Gmail:', pdfError)
            result.errors++
          }
        }
      } catch (emailError) {
        console.error('Error processing Gmail message:', emailError)
        result.errors++
      }
    }

    console.log('[Gmail Scan] Scan complete:', JSON.stringify(result, null, 2))
    return res.status(200).json(result)
  } catch (error) {
    console.error('[Gmail Scan] Error:', error)

    // Handle revoked/expired refresh token
    if (error.message?.includes('invalid_grant') || error.message?.includes('Token has been expired or revoked')) {
      // Clear the invalid refresh token
      await prisma.usuario.update({
        where: { id: decoded.userId },
        data: { gmailRefreshToken: null, gmailConnectedAt: null },
      })
      return res.status(401).json({ error: 'El acceso a Gmail expiró. Volvé a iniciar sesión con Google.' })
    }

    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
