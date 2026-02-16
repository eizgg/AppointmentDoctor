import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Checks if a buffer looks like a PDF (starts with %PDF magic bytes).
 */
function isPdfBuffer(buffer) {
  return buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
}

/**
 * Extrae texto de un PDF usando pdf-parse v2.
 * Para PDFs digitales (como los de OSDE) que tienen texto embebido.
 */
async function extractText(pdfBuffer) {
  try {
    const parser = new PDFParse({ data: new Uint8Array(pdfBuffer), verbosity: 0 })
    const result = await parser.getText()
    const text = result.pages.map(p => p.text).join('\n').trim()
    console.log(`[OCR] pdf-parse extracted ${text.length} chars, pages: ${result.pages.length}`)
    if (text.length > 0) {
      console.log(`[OCR] First 500 chars: ${text.substring(0, 500)}`)
      return text
    }
    await parser.destroy()
  } catch (error) {
    console.error('[OCR] pdf-parse failed:', error.message)
  }

  throw new Error('No se pudo extraer texto del PDF.');
}

/**
 * Parsea texto de una receta/orden médica OSDE y extrae datos estructurados.
 *
 * Formato esperado de OSDE:
 *   Dra. Romina Moretti
 *   Médico / Gastroenterología
 *   M.P. 450012
 *   ...
 *   Paciente: Enzo Zalazar
 *   Fecha de nacimiento: 21/05/1998
 *   ...
 *   Rp./
 *   Diagnóstico: 62315008 - diarrea
 *   865 - TIROTROFINA PLASMATICA ...
 *   412 - GLUCEMIA
 */
function parseRecetaText(texto) {
  const medico = extractMedico(texto);
  const especialidad = extractEspecialidad(texto);
  const fecha = extractFecha(texto);
  const estudios = extractEstudios(texto);

  return { medico, especialidad, fecha, estudios };
}

/**
 * Extrae el nombre del médico.
 * Busca patrones como "Dra. Romina Moretti" o "Dr. Juan Pérez"
 * que aparecen al inicio del documento OSDE.
 */
function extractMedico(texto) {
  const lines = texto.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);

  // Strategy 1: "Dra." / "Dr." al inicio de una línea (formato OSDE)
  for (const line of lines) {
    const match = line.match(/^(Dra?\.?\s+[A-ZÁÉÍÓÚÑa-záéíóúñ\s.]{3,50})$/i);
    if (match) {
      return match[1].trim();
    }
  }

  // Strategy 2: "Dr./Dra." en cualquier parte
  const patterns = [
    /\b(Dra?\.?\s+[A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/i,
    /[Mm][ée]dico(?:\s+solicitante)?[:\s]+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/,
    /M\.[PN]\.?\s*\d+[\s\-–]+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/,
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
 * Extrae la especialidad médica.
 * Busca "Médico / Gastroenterología" o "Médica / Dermatología"
 */
function extractEspecialidad(texto) {
  // "Médico / Especialidad" o "Médica / Especialidad"
  const match = texto.match(/[Mm][ée]dic[oa]\s*\/\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/);
  if (match) {
    return match[1].trim();
  }

  return null;
}

/**
 * Extrae la fecha de emisión de la receta.
 * En OSDE, la fecha puede venir en el texto del email ("Prescripción del día DD/MM/YYYY")
 * o en el PDF como "Fecha de nacimiento" (no es la fecha de emisión).
 * Buscamos una fecha que NO sea la de nacimiento.
 */
function extractFecha(texto) {
  // Buscar todas las fechas DD/MM/YYYY en el texto
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g
  let match
  const dates = []

  while ((match = dateRegex.exec(texto)) !== null) {
    // Chequear que no sea la fecha de nacimiento
    const context = texto.substring(Math.max(0, match.index - 30), match.index)
    const isNacimiento = /nacimiento/i.test(context)

    const [, day, month, year] = match
    dates.push({
      raw: match[0],
      iso: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      isNacimiento,
    })
  }

  // Preferir fecha que NO sea de nacimiento
  const emision = dates.find(d => !d.isNacimiento)
  if (emision) return emision.iso

  // DD de mes de YYYY
  const monthNames = {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
  };
  const spanishMatch = texto.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(?:de\s+)?(\d{4})/i
  );
  if (spanishMatch) {
    const [, day, monthName, year] = spanishMatch;
    return `${year}-${monthNames[monthName.toLowerCase()]}-${day.padStart(2, '0')}`;
  }

  // YYYY-MM-DD (ISO)
  const isoMatch = texto.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  return null;
}

/**
 * Extrae la lista de estudios/prácticas del texto.
 * En formato OSDE, los estudios vienen después de "Rp./" con formato:
 *   CÓDIGO - DESCRIPCIÓN DEL ESTUDIO
 * Ejemplo: "865 - TIROTROFINA PLASMATICA POR RADIOINMUNOENSAYO - TSH"
 */
function extractEstudios(texto) {
  const estudios = [];
  const lines = texto.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);

  // Strategy 1: Lines with OSDE code format "NÚMERO - DESCRIPCIÓN" after "Rp./"
  let afterRp = false;
  for (const line of lines) {
    if (/^Rp\.?\/?$/.test(line)) {
      afterRp = true;
      continue;
    }

    if (afterRp) {
      // Match "865 - TIROTROFINA PLASMATICA..." or "6951 - ANTICUERPOS..."
      const codeMatch = line.match(/^\d{2,5}\s*-\s*(.+)$/);
      if (codeMatch) {
        estudios.push(codeMatch[1].trim());
        continue;
      }
      // Also match "Diagnóstico: ..." line (skip it, it's not a study)
      if (/^Diagn[oó]stico/i.test(line)) continue;
    }
  }

  // Strategy 2: If no Rp./ found, try matching code-description pattern anywhere
  if (estudios.length === 0) {
    for (const line of lines) {
      const codeMatch = line.match(/^\d{2,5}\s*-\s*([A-ZÁÉÍÓÚÑ\s\-(),.]{5,})$/);
      if (codeMatch) {
        estudios.push(codeMatch[1].trim());
      }
    }
  }

  // Strategy 3: Fallback to keyword matching
  if (estudios.length === 0) {
    const keywords = [
      'ecograf[ií]a', 'radiograf[ií]a', 'tomograf[ií]a', 'resonancia',
      'hemograma', 'laboratorio', 'electrocardiograma', 'mamograf[ií]a',
      'endoscop[ií]a', 'colonoscop[ií]a', 'biopsia', 'glucemia',
      'colesterol', 'urocultivo', 'hepatograma', 'coagulograma',
      'tirotrofina', 'creatinina', 'urea', 'coprocultivo',
    ];
    const keywordRegex = new RegExp(`(${keywords.join('|')})`, 'gi');

    for (const line of lines) {
      if (keywordRegex.test(line)) {
        const cleaned = line.replace(/^[\s\-•●○◦▪*>\d.)\]]+/, '').trim();
        if (cleaned.length > 2 && cleaned.length < 150) {
          estudios.push(cleaned);
        }
      }
      keywordRegex.lastIndex = 0;
    }
  }

  return [...new Set(estudios)];
}

/**
 * Extrae el diagnóstico de la receta.
 */
function extractDiagnostico(texto) {
  const match = texto.match(/Diagn[oó]stico:\s*\d*\s*-?\s*(.+)/i);
  if (match) return match[1].trim();
  return null;
}

/**
 * Analiza un PDF de receta médica y devuelve datos estructurados.
 */
export async function analyzeRecetaPDF(pdfUrl) {
  // 1. Descargar PDF
  let pdfBuffer;
  try {
    console.log(`[OCR] Downloading PDF from: ${pdfUrl.substring(0, 100)}...`)
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`Failed to download PDF: ${response.status}`);
    pdfBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`[OCR] PDF downloaded: ${pdfBuffer.length} bytes, is PDF: ${isPdfBuffer(pdfBuffer)}`)
  } catch (error) {
    throw new Error(`Error descargando PDF: ${error.message}`);
  }

  // 2. Extraer texto con pdf-parse
  const textoExtraido = await extractText(pdfBuffer);

  // 3. Parsear texto para extraer datos estructurados
  const result = parseRecetaText(textoExtraido);
  const diagnostico = extractDiagnostico(textoExtraido);
  console.log('[OCR] Parsed result:', JSON.stringify({ ...result, diagnostico }, null, 2));

  return {
    medico: typeof result.medico === 'string' ? result.medico : null,
    especialidad: typeof result.especialidad === 'string' ? result.especialidad : null,
    fecha: typeof result.fecha === 'string' ? result.fecha : null,
    estudios: Array.isArray(result.estudios) ? result.estudios : [],
    diagnostico: typeof diagnostico === 'string' ? diagnostico : null,
  };
}
