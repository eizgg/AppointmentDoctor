import prisma from '../lib/prisma.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { usuarioId } = req.query

    if (!usuarioId) {
      return res.status(400).json({
        error: 'Missing required query parameter: usuarioId'
      })
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
