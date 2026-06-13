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
    const { id, nombre, emailGeneral, emailImagenes, esPredeterminado } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Falta campo requerido: id' })
    }

    const centro = await prisma.centroMedico.findUnique({ where: { id } })
    if (!centro) {
      return res.status(404).json({ error: 'Centro no encontrado' })
    }
    if (centro.usuarioId !== decoded.userId) {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const data = {}
    if (nombre !== undefined) data.nombre = nombre
    if (emailGeneral !== undefined) data.emailGeneral = emailGeneral
    if (emailImagenes !== undefined) data.emailImagenes = emailImagenes || null

    if (esPredeterminado === true) {
      await prisma.centroMedico.updateMany({
        where: { usuarioId: decoded.userId },
        data: { esPredeterminado: false },
      })
      data.esPredeterminado = true
    }

    const actualizado = await prisma.centroMedico.update({ where: { id }, data })

    return res.status(200).json(actualizado)
  } catch (error) {
    console.error('Error updating centro:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
