import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = requireAuth(req, res)
  if (!decoded) return

  try {
    const { usuarioId, pdfUrl, pdfNombreOriginal } = req.body

    if (!usuarioId || !pdfUrl || !pdfNombreOriginal) {
      return res.status(400).json({
        error: 'Missing required fields: usuarioId, pdfUrl, pdfNombreOriginal'
      })
    }

    // Verify ownership
    if (usuarioId !== decoded.userId) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const receta = await prisma.receta.create({
      data: {
        usuarioId,
        pdfUrl,
        pdfNombreOriginal,
        estado: 'pendiente'
      }
    })

    return res.status(201).json(receta)
  } catch (error) {
    console.error('Error creating receta:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
