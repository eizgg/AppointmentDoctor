import supabase from './supabase.js'

const BUCKET = 'recetas'

/**
 * Uploads a PDF buffer to Supabase Storage in the "recetas" bucket.
 * Files are stored under the user's directory with a timestamp prefix.
 *
 * @param {Buffer} fileBuffer - The PDF file contents as a Buffer.
 * @param {string} fileName - The original file name.
 * @param {string} userId - The ID of the user uploading the file.
 * @returns {Promise<{ path: string|null, error: object|null }>}
 */
export async function uploadPDF(fileBuffer, fileName, userId) {
  const filePath = `${userId}/${Date.now()}-${fileName}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) {
    return { path: null, error }
  }

  return { path: data.path, error: null }
}

/**
 * Returns the public URL for a file stored in the "recetas" bucket.
 *
 * @param {string} path - The storage path of the file.
 * @returns {string} The public URL.
 */
export function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Deletes a file from the "recetas" bucket.
 *
 * @param {string} path - The storage path of the file to delete.
 * @returns {Promise<{ error: object|null }>}
 */
export async function deletePDF(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  return { error: error || null }
}
