import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const decoded = requireAuth(req, res)
  if (!decoded) return

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({
        error: 'Missing required query parameter: usuarioId'
      })
    }

    // Verify the user can only access their own recetas
    if (usuarioId !== decoded.userId) {
      return res.status(403).json({ error: 'No autorizado para ver recetas de otro usuario' })
    }

    const recetas = await prisma.receta.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: { turno: true }
    })

    return res.status(200).json(recetas)
  } catch (error) {
    console.error('Error listing recetas:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
