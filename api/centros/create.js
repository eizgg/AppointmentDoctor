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
    const { nombre, emailGeneral, emailImagenes, esPredeterminado } = req.body

    if (!nombre || !emailGeneral) {
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, emailGeneral' })
    }

    // Si es el primer centro o se marca como predeterminado, será el predeterminado.
    const existentes = await prisma.centroMedico.count({ where: { usuarioId: decoded.userId } })
    const marcarPredeterminado = !!esPredeterminado || existentes === 0

    if (marcarPredeterminado) {
      await prisma.centroMedico.updateMany({
        where: { usuarioId: decoded.userId },
        data: { esPredeterminado: false },
      })
    }

    const centro = await prisma.centroMedico.create({
      data: {
        usuarioId: decoded.userId,
        nombre,
        emailGeneral,
        emailImagenes: emailImagenes || null,
        esPredeterminado: marcarPredeterminado,
      },
    })

    return res.status(201).json(centro)
  } catch (error) {
    console.error('Error creating centro:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
