import prisma from '../lib/prisma.js'
import { requireAuth, setCorsHeaders } from '../lib/auth.js'

/**
 * PATCH /api/auth/update
 * Actualiza los datos personales del usuario autenticado.
 * No permite cambiar email (identidad de la cuenta) ni password.
 */
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
    const { nombre, dni, telefono, obraSocial, nroAfiliado, direccion } = req.body

    const data = {}
    if (nombre !== undefined) data.nombre = nombre
    if (dni !== undefined) data.dni = dni
    if (telefono !== undefined) data.telefono = telefono
    if (obraSocial !== undefined) data.obraSocial = obraSocial
    if (nroAfiliado !== undefined) data.nroAfiliado = nroAfiliado
    if (direccion !== undefined) data.direccion = direccion || null

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' })
    }

    const usuario = await prisma.usuario.update({
      where: { id: decoded.userId },
      data,
    })

    return res.status(200).json({
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        dni: usuario.dni,
        telefono: usuario.telefono,
        obraSocial: usuario.obraSocial,
        nroAfiliado: usuario.nroAfiliado,
        direccion: usuario.direccion,
        hasGmailAccess: !!usuario.gmailRefreshToken,
      },
    })
  } catch (error) {
    console.error('Error in /auth/update:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
