import prisma from '../lib/prisma.js'
import { signToken, setCorsHeaders } from '../lib/auth.js'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { OAuth2Client } = require('google-auth-library')

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { idToken } = req.body

    if (!idToken) {
      return res.status(400).json({ error: 'idToken es requerido' })
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { email, name, sub: googleId } = payload

    if (!email) {
      return res.status(400).json({ error: 'No se pudo obtener email de Google' })
    }

    let usuario = await prisma.usuario.findUnique({ where: { email } })

    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          email,
          nombre: name || email.split('@')[0],
          googleId,
        },
      })
    } else if (!usuario.googleId) {
      usuario = await prisma.usuario.update({
        where: { id: usuario.id },
        data: { googleId },
      })
    }

    const token = signToken({ userId: usuario.id, email: usuario.email })

    return res.status(200).json({
      token,
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
    console.error('Error in Google auth:', error)
    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({ error: 'Token de Google inválido o expirado' })
    }
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
