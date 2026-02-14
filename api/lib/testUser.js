import prisma from './prisma.js'

const TEST_USER_DATA = {
  email: 'test@turno-facil.com',
  nombre: 'Usuario de Prueba',
  dni: '12345678',
  obraSocial: 'OSDE',
  nroAfiliado: '123456789',
  telefono: '+5491123456789',
  direccion: 'Calle Falsa 123, CABA',
}

/**
 * Finds or creates the test user.
 * @returns {Promise<{ id: string }>} The test user record.
 */
export async function getOrCreateTestUser() {
  let user = await prisma.usuario.findUnique({
    where: { email: TEST_USER_DATA.email },
  })

  if (!user) {
    user = await prisma.usuario.create({ data: TEST_USER_DATA })
    console.log('Test user created:', user.id)
  } else {
    console.log('Test user already exists:', user.id)
  }

  return user
}
