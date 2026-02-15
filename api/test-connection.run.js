import 'dotenv/config'
import prisma from './lib/prisma.js'
import supabase from './lib/supabase.js'

async function main() {
  console.log('=== BACKEND HEALTH CHECK ===\n')

  // Test 1: Prisma / DB
  console.log('1. Testing Prisma (PostgreSQL)...')
  try {
    const count = await prisma.usuario.count()
    console.log(`   OK - Connected. ${count} usuario(s) in DB.`)
  } catch (err) {
    console.error(`   FAIL - ${err.message}`)
  }

  // Test 2: Supabase Storage
  console.log('2. Testing Supabase Storage...')
  try {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) throw new Error(error.message)
    const bucketNames = data.map((b) => b.name)
    console.log(`   OK - Buckets: [${bucketNames.join(', ')}]`)
  } catch (err) {
    console.error(`   FAIL - ${err.message}`)
  }

  // Test 3: Verify env vars are set
  console.log('\n3. Environment variables check:')
  const vars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'ANTHROPIC_API_KEY',
    'JWT_SECRET',
  ]
  for (const v of vars) {
    const val = process.env[v]
    if (val) {
      console.log(`   ${v}: set (${val.substring(0, 12)}...)`)
    } else {
      console.log(`   ${v}: NOT SET`)
    }
  }

  console.log('\n=== DONE ===')
  process.exit(0)
}

main().catch((e) => {
  console.error('Health check crashed:', e.message)
  process.exit(1)
})
