import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const decoded = requireAuth(req, res)
  if (!decoded) return

  const { id } = req.query

  try {
    const centro = await prisma.centroMedico.findUnique({ where: { id } })
    if (!centro) {
      return res.status(404).json({ error: 'Centro no encontrado' })
    }
    if (centro.usuarioId !== decoded.userId) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    if (req.method === 'GET') {
      return res.status(200).json(centro)
    }

    if (req.method === 'DELETE') {
      await prisma.centroMedico.delete({ where: { id } })

      // Si era el predeterminado, promover el más antiguo restante.
      if (centro.esPredeterminado) {
        const siguiente = await prisma.centroMedico.findFirst({
          where: { usuarioId: decoded.userId },
          orderBy: { createdAt: 'asc' },
        })
        if (siguiente) {
          await prisma.centroMedico.update({
            where: { id: siguiente.id },
            data: { esPredeterminado: true },
          })
        }
      }

      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Error in centro [id]:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
