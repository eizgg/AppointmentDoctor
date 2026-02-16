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
    const { email, password, nombre } = req.body

    if (!email || !password || !nombre) {
      return res.status(400).json({ error: 'Email, password y nombre son requeridos' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
    }

    const existing = await prisma.usuario.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con este email' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const usuario = await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre,
      },
    })

    const token = signToken({ userId: usuario.id, email: usuario.email })

    return res.status(201).json({
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
    console.error('Error in register:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
