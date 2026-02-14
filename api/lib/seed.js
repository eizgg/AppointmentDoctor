import { getOrCreateTestUser } from './testUser.js'

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
  console.log(`\nUse this ID in the frontend:`)
  console.log(`  export const USUARIO_TEMP_ID = '${user.id}'`)

  console.log('\nSeed complete.')
  process.exit(0)
}

main().catch((e) => {
  console.error('Seed failed:', e.message)
  process.exit(1)
})
