import 'dotenv/config'
import prisma from './lib/prisma.js'

async function main() {
  const user = await prisma.usuario.findUnique({
    where: { email: 'test@turno-facil.com' },
  })

  if (!user) {
    console.error('User NOT found!')
    process.exit(1)
  }

  console.log('=== USER VERIFIED ===')
  console.log(JSON.stringify(user, null, 2))
  process.exit(0)
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
