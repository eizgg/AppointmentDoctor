import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = requireAuth(req, res)
  if (!decoded) return

  try {
    const { id, ...data } = req.body

    if (!id) {
      return res.status(400).json({
        error: 'Missing required field: id'
      })
    }

    // Verify ownership before updating
    const existing = await prisma.receta.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ error: 'Receta not found' })
    }
    if (existing.usuarioId !== decoded.userId) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const receta = await prisma.receta.update({
      where: { id },
      data
    })

    return res.status(200).json(receta)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Receta not found' })
    }

    console.error('Error updating receta:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
