import prisma from '../lib/prisma.js'
import { signToken, setCorsHeaders } from '../lib/auth.js'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' })
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario || !usuario.passwordHash) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const valid = await bcrypt.compare(password, usuario.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
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
    console.error('Error in login:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
