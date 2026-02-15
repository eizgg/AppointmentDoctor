import 'dotenv/config'
import { uploadPDF, getPublicUrl, deletePDF } from './lib/storage.js'

async function main() {
  console.log('=== TEST UPLOAD SIMULADO ===\n')

  // Create a minimal valid PDF buffer
  const pdfContent = '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
  const buffer = Buffer.from(pdfContent)

  // 1. Upload
  console.log('1. Uploading dummy PDF...')
  const { path, error: uploadErr } = await uploadPDF(buffer, 'test-dummy.pdf', 'test-upload')
  if (uploadErr) {
    console.error(`   FAIL - ${uploadErr.message}`)
    process.exit(1)
  }
  console.log(`   OK - Uploaded to: ${path}`)

  // 2. Get public URL
  console.log('2. Getting public URL...')
  const url = getPublicUrl(path)
  console.log(`   OK - URL: ${url}`)

  // 3. Cleanup
  console.log('3. Deleting test file...')
  const { error: deleteErr } = await deletePDF(path)
  if (deleteErr) {
    console.error(`   FAIL - ${deleteErr.message}`)
    process.exit(1)
  }
  console.log('   OK - File deleted')

  console.log('\n=== ALL UPLOAD TESTS PASSED ===')
  process.exit(0)
}

main().catch((e) => {
  console.error('Test upload failed:', e.message)
  process.exit(1)
})
