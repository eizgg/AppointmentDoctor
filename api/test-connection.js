import prisma from './lib/prisma.js'
import supabase from './lib/supabase.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const results = {
    timestamp: new Date().toISOString(),
    prisma: { status: 'unknown', detail: null },
    supabase: { status: 'unknown', detail: null },
  }

  // Test 1: Prisma / DB connection
  try {
    const count = await prisma.usuario.count()
    results.prisma = { status: 'ok', detail: `Connected. ${count} usuario(s) in DB.` }
  } catch (err) {
    results.prisma = { status: 'error', detail: err.message }
  }

  // Test 2: Supabase Storage
  try {
    const { data, error } = await supabase.storage.listBuckets()
    if (error) throw new Error(error.message)
    const bucketNames = data.map((b) => b.name)
    results.supabase = {
      status: 'ok',
      detail: `Connected. Buckets: [${bucketNames.join(', ')}]`,
    }
  } catch (err) {
    results.supabase = { status: 'error', detail: err.message }
  }

  const allOk = results.prisma.status === 'ok' && results.supabase.status === 'ok'
  res.status(allOk ? 200 : 500).json(results)
}
