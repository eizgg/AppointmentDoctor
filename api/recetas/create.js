import prisma from '../lib/prisma.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { usuarioId, pdfUrl, pdfNombreOriginal } = req.body

    if (!usuarioId || !pdfUrl || !pdfNombreOriginal) {
      return res.status(400).json({
        error: 'Missing required fields: usuarioId, pdfUrl, pdfNombreOriginal'
      })
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
