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
    const centros = await prisma.centroMedico.findMany({
      where: { usuarioId: decoded.userId },
      orderBy: [{ esPredeterminado: 'desc' }, { createdAt: 'asc' }],
    })

    return res.status(200).json(centros)
  } catch (error) {
    console.error('Error listing centros:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
