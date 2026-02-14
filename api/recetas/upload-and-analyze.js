import prisma from '../lib/prisma.js';
import { uploadPDF, getPublicUrl } from '../lib/storage.js';
import { analyzeRecetaPDF } from '../lib/ocr.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { fileName, fileBase64, usuarioId } = req.body || {};

    // --- Validation ---
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId es requerido.' });
    }

    if (!fileName || !fileName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'fileName es requerido y debe terminar en .pdf.' });
    }

    if (!fileBase64 || fileBase64.length === 0) {
      return res.status(400).json({ error: 'fileBase64 es requerido y no puede estar vacío.' });
    }

    // Decode base64 and check file size
    const fileBuffer = Buffer.from(fileBase64, 'base64');

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        error: `El archivo excede el tamaño máximo permitido de 10 MB. Tamaño recibido: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB.`,
      });
    }

    // --- Upload to Supabase Storage ---
    const { path, error: uploadError } = await uploadPDF(fileBuffer, fileName, usuarioId);

    if (uploadError) {
      return res.status(500).json({ error: 'Error subiendo PDF' });
    }

    const pdfUrl = getPublicUrl(path);

    // --- Create receta in DB with estado "procesando" ---
    let receta = await prisma.receta.create({
      data: {
        usuarioId,
        pdfUrl,
        pdfNombreOriginal: fileName,
        estado: 'procesando',
      },
    });

    // --- Call OCR service ---
    try {
      const ocrResult = await analyzeRecetaPDF(pdfUrl);

      receta = await prisma.receta.update({
        where: { id: receta.id },
        data: {
          medicoSolicitante: ocrResult.medico,
          fechaEmision: ocrResult.fecha ? new Date(ocrResult.fecha) : null,
          estudios: ocrResult.estudios,
          estado: 'pendiente',
        },
      });
    } catch (ocrError) {
      // If OCR fails, mark as error but don't fail the whole request
      receta = await prisma.receta.update({
        where: { id: receta.id },
        data: { estado: 'error_ocr' },
      });
    }

    // --- Return created receta ---
    return res.status(201).json(receta);
  } catch (error) {
    console.error('Error inesperado en upload-and-analyze:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
