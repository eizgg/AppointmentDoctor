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
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.status(200).json({
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        dni: usuario.dni,
        telefono: usuario.telefono,
        obraSocial: usuario.obraSocial,
        nroAfiliado: usuario.nroAfiliado,
      },
    })
  } catch (error) {
    console.error('Error in /auth/me:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
