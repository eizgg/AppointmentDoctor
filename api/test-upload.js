import supabase from './lib/supabase.js'
import { uploadPDF, getPublicUrl, deletePDF } from './lib/storage.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const results = { upload: null, publicUrl: null, cleanup: null }

  try {
    // Create a minimal valid PDF buffer
    const pdfContent = '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    const buffer = Buffer.from(pdfContent)

    // Upload
    const { path, error: uploadErr } = await uploadPDF(buffer, 'test-dummy.pdf', 'test-upload')
    if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`)
    results.upload = { status: 'ok', path }

    // Get public URL
    const url = getPublicUrl(path)
    results.publicUrl = { status: 'ok', url }

    // Cleanup
    const { error: deleteErr } = await deletePDF(path)
    if (deleteErr) throw new Error(`Delete failed: ${deleteErr.message}`)
    results.cleanup = { status: 'ok', detail: 'File deleted' }

    res.status(200).json(results)
  } catch (err) {
    res.status(500).json({ ...results, error: err.message })
  }
}
