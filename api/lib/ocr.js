import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';

/**
 * Extrae texto de un PDF.
 * 1. Intenta pdf-parse (PDFs digitales con texto embebido).
 * 2. Si no obtiene texto, usa Tesseract.js OCR (PDFs escaneados / imágenes).
 */
async function extractText(pdfBuffer) {
  // Intento 1: pdf-parse (rápido, funciona con PDFs digitales)
  try {
    const pdfData = await pdf(pdfBuffer);
    if (pdfData.text && pdfData.text.trim().length > 10) {
      return pdfData.text;
    }
  } catch {
    // pdf-parse falló, seguimos con Tesseract
  }

  // Intento 2: Tesseract.js OCR (para PDFs escaneados / imágenes)
  try {
    const { data } = await Tesseract.recognize(pdfBuffer, 'spa', {
      logger: () => {},
    });
    if (data.text && data.text.trim().length > 10) {
      return data.text;
    }
  } catch {
    // Tesseract también falló
  }

  throw new Error('No se pudo extraer texto del PDF (ni digital ni por OCR).');
}

/**
 * Parsea texto crudo de una receta médica argentina y extrae datos estructurados.
 */
function parseRecetaText(texto) {
  const medico = extractMedico(texto);
  const fecha = extractFecha(texto);
  const estudios = extractEstudios(texto);

  return { medico, fecha, estudios };
}

/**
 * Busca el nombre del médico en el texto.
 */
function extractMedico(texto) {
  const patterns = [
    // "Dr. Juan Pérez" / "Dra. María López"
    /\b(?:Dr\.?a?|DRA?\.?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/i,
    // "Médico: Juan Pérez" / "Médico solicitante: ..."
    /[Mm][ée]dico(?:\s+solicitante)?[:\s]+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/,
    // "M.P. 12345 - Juan Pérez" o "M.N. 12345 Juan Pérez"
    /M\.[PN]\.?\s*\d+[\s\-–]+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/,
    // "Profesional: Juan Pérez"
    /[Pp]rofesional[:\s]+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/,
  ];

  for (const pattern of patterns) {
    const match = texto.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Busca una fecha en el texto y la devuelve en formato YYYY-MM-DD.
 */
function extractFecha(texto) {
  const patterns = [
    // DD/MM/YYYY o DD-MM-YYYY
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    // DD de mes de YYYY
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(\d{4})/i,
    // YYYY-MM-DD (ISO)
    /(\d{4})-(\d{2})-(\d{2})/,
  ];

  // DD/MM/YYYY o DD-MM-YYYY
  const numericMatch = texto.match(patterns[0]);
  if (numericMatch) {
    const [, day, month, year] = numericMatch;
    const d = day.padStart(2, '0');
    const m = month.padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // DD de mes de YYYY
  const monthNames = {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
  };
  const spanishMatch = texto.match(patterns[1]);
  if (spanishMatch) {
    const [, day, monthName, year] = spanishMatch;
    const d = day.padStart(2, '0');
    const m = monthNames[monthName.toLowerCase()];
    return `${year}-${m}-${d}`;
  }

  // YYYY-MM-DD
  const isoMatch = texto.match(patterns[2]);
  if (isoMatch) {
    return isoMatch[0];
  }

  return null;
}

/**
 * Extrae la lista de estudios/prácticas del texto.
 */
function extractEstudios(texto) {
  const estudios = [];

  // Palabras clave comunes en recetas médicas argentinas
  const keywords = [
    'ecograf[ií]a', 'radiograf[ií]a', 'tomograf[ií]a', 'resonancia',
    'an[aá]lisis', 'hemograma', 'laboratorio', 'electrocardiograma',
    'ecocardiograma', 'mamograf[ií]a', 'densitometr[ií]a', 'endoscop[ií]a',
    'colonoscop[ií]a', 'biopsia', 'rx\\b', 'tac\\b', 'rmn\\b', 'ecg\\b',
    'glucemia', 'colesterol', 'triglic[eé]ridos', 'urocultivo',
    'orina completa', 'hepatograma', 'coagulograma', 'eritrosedimentaci[oó]n',
    'tiroidea', 'tsh\\b', 't[34]\\b', 'psa\\b', 'pap\\b',
    'espirometr[ií]a', 'audiometr[ií]a', 'fondo de ojo',
  ];

  // Buscar líneas que contengan estudios por keywords
  const lines = texto.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);
  const keywordRegex = new RegExp(`(${keywords.join('|')})`, 'gi');

  for (const line of lines) {
    if (keywordRegex.test(line)) {
      // Limpiar la línea (sacar bullets, números de lista, etc.)
      const cleaned = line
        .replace(/^[\s\-•●○◦▪*>\d.)\]]+/, '')
        .trim();
      if (cleaned.length > 2 && cleaned.length < 150) {
        estudios.push(cleaned);
      }
    }
    // Reset lastIndex ya que usamos flag 'g'
    keywordRegex.lastIndex = 0;
  }

  // Si no encontramos por keywords, buscar líneas con formato de lista
  if (estudios.length === 0) {
    const listPatterns = /^[\s]*[\-•●○◦▪*>]\s+(.{5,100})$/;
    for (const line of lines) {
      const match = line.match(listPatterns);
      if (match) {
        estudios.push(match[1].trim());
      }
    }
  }

  // Deduplicar
  return [...new Set(estudios)];
}

/**
 * Analiza un PDF de receta médica y devuelve datos estructurados.
 * Reemplaza la integración con Claude API — usa pdf-parse + Tesseract.js + regex.
 */
export async function analyzeRecetaPDF(pdfUrl) {
  // 1. Descargar PDF
  let pdfBuffer;
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`Failed to download PDF: ${response.status}`);
    pdfBuffer = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    throw new Error(`Error descargando PDF: ${error.message}`);
  }

  // 2. Extraer texto (pdf-parse → Tesseract.js fallback)
  const textoExtraido = await extractText(pdfBuffer);

  // 3. Parsear texto para extraer datos estructurados
  const result = parseRecetaText(textoExtraido);

  return {
    medico: typeof result.medico === 'string' ? result.medico : null,
    fecha: typeof result.fecha === 'string' ? result.fecha : null,
    estudios: Array.isArray(result.estudios) ? result.estudios : [],
  };
}
