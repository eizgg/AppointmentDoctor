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
    const { code, idToken } = req.body

    // Support both auth code flow (new) and id token flow (legacy)
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage' // Required for auth code flow from frontend
    )

    let payload
    let refreshToken = null

    if (code) {
      // Authorization code flow — exchange code for tokens
      const { tokens } = await client.getToken(code)

      if (!tokens.id_token) {
        return res.status(400).json({ error: 'No se pudo obtener id_token de Google' })
      }

      // Verify the id_token from the token exchange
      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload()
      refreshToken = tokens.refresh_token || null
    } else if (idToken) {
      // Legacy ID token flow (backward compatibility)
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload()
    } else {
      return res.status(400).json({ error: 'code o idToken es requerido' })
    }

    const { email, name, sub: googleId } = payload

    if (!email) {
      return res.status(400).json({ error: 'No se pudo obtener email de Google' })
    }

    let usuario = await prisma.usuario.findUnique({ where: { email } })

    const updateData = { googleId }
    if (refreshToken) {
      updateData.gmailRefreshToken = refreshToken
      updateData.gmailConnectedAt = new Date()
    }

    if (!usuario) {
      usuario = await prisma.usuario.create({
        data: {
          email,
          nombre: name || email.split('@')[0],
          ...updateData,
        },
      })
    } else {
      // Update googleId if not set, and always update refresh token if we got one
      const fieldsToUpdate = {}
      if (!usuario.googleId) fieldsToUpdate.googleId = googleId
      if (refreshToken) {
        fieldsToUpdate.gmailRefreshToken = refreshToken
        fieldsToUpdate.gmailConnectedAt = new Date()
      }

      if (Object.keys(fieldsToUpdate).length > 0) {
        usuario = await prisma.usuario.update({
          where: { id: usuario.id },
          data: fieldsToUpdate,
        })
      }
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
        hasGmailAccess: !!usuario.gmailRefreshToken,
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
