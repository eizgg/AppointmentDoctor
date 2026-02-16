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
    const { id } = req.query

    const receta = await prisma.receta.findUnique({
      where: { id },
      include: {
        turno: true,
        usuario: true
      }
    })

    if (!receta) {
      return res.status(404).json({ error: 'Receta not found' })
    }

    // Verify ownership
    if (receta.usuarioId !== decoded.userId) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    return res.status(200).json(receta)
  } catch (error) {
    console.error('Error fetching receta:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
