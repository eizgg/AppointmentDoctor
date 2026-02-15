import 'dotenv/config'
import supabase from './lib/supabase.js'

async function main() {
  console.log('=== CREATING RECETAS BUCKET ===\n')

  // Check if bucket exists
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets()
  if (listErr) {
    console.error('Failed to list buckets:', listErr.message)
    process.exit(1)
  }

  const exists = buckets.some((b) => b.name === 'recetas')
  if (exists) {
    console.log('Bucket "recetas" already exists.')
    process.exit(0)
  }

  // Create bucket
  const { data, error } = await supabase.storage.createBucket('recetas', {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
  })

  if (error) {
    console.error('Failed to create bucket:', error.message)
    process.exit(1)
  }

  console.log('Bucket "recetas" created successfully:', data)
  process.exit(0)
}

main().catch((e) => {
  console.error('Setup failed:', e.message)
  process.exit(1)
})
