import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'
import { analyzeRecetaPDF } from '../lib/ocr.js'

/**
 * POST /api/recetas/reanalyze
 * Re-runs OCR on recetas that have a pdfUrl but missing especialidad.
 * Used to backfill data after improving OCR extraction.
 */
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
    // Find recetas with pdfUrl but null especialidad
    const recetas = await prisma.receta.findMany({
      where: {
        usuarioId: decoded.userId,
        especialidad: null,
      },
    })

    console.log(`[Reanalyze] Found ${recetas.length} recetas with null especialidad for user ${decoded.userId}`)

    const result = { total: recetas.length, updated: 0, errors: 0 }

    for (const receta of recetas) {
      try {
        const ocrResult = await analyzeRecetaPDF(receta.pdfUrl)

        // Only update fields that were previously null
        const updates = {}
        if (!receta.medicoSolicitante && ocrResult.medico) updates.medicoSolicitante = ocrResult.medico
        if (!receta.especialidad && ocrResult.especialidad) updates.especialidad = ocrResult.especialidad
        if (!receta.fechaEmision && ocrResult.fecha) updates.fechaEmision = new Date(ocrResult.fecha)
        if ((!receta.estudios || receta.estudios.length === 0) && ocrResult.estudios?.length > 0) updates.estudios = ocrResult.estudios

        if (Object.keys(updates).length > 0) {
          await prisma.receta.update({ where: { id: receta.id }, data: updates })
          console.log(`[Reanalyze] Updated receta ${receta.id}:`, Object.keys(updates))
          result.updated++
        }
      } catch (err) {
        console.error(`[Reanalyze] Error re-analyzing receta ${receta.id}:`, err.message)
        result.errors++
      }
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('[Reanalyze] Error:', error)
    return res.status(500).json({ error: 'Error interno del servidor.' })
  }
}
