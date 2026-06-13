import prisma from './prisma.js'
import { getOrCreateTestUser } from './testUser.js'

const ANCHORENA = {
  nombre: 'Sanatorio Anchorena',
  emailGeneral: 'turnos_sanmartin@sanatorio-anchorena.com.ar',
  emailImagenes: 'diagnostico@sasm.com.ar',
  esPredeterminado: true,
}

async function seedCentroAnchorena(usuarioId) {
  const existente = await prisma.centroMedico.findFirst({
    where: { usuarioId, nombre: ANCHORENA.nombre },
  })
  if (existente) {
    console.log('Centro "Sanatorio Anchorena" ya existe:', existente.id)
    return existente
  }
  const centro = await prisma.centroMedico.create({
    data: { usuarioId, ...ANCHORENA },
  })
  console.log('Centro "Sanatorio Anchorena" creado:', centro.id)
  return centro
}

async function retry(fn, retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      console.log(`Attempt ${i + 1} failed: ${err.message}. Retrying in ${delay / 1000}s...`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
}

async function main() {
  console.log('Seeding database...\n')

  const user = await retry(() => getOrCreateTestUser())
  console.log(`\nTest user ready:`)
  console.log(`  ID:    ${user.id}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Name:  ${user.nombre}`)

  await retry(() => seedCentroAnchorena(user.id))

  console.log('\nSeed complete.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Seed failed:', e.message)
  process.exit(1)
})
