import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import pdf from 'pdf-parse';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeRecetaPDF(pdfUrl) {
  // 1. Download PDF from URL (Supabase public URL)
  let pdfBuffer;
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error(`Failed to download PDF: ${response.status}`);
    pdfBuffer = Buffer.from(await response.arrayBuffer());
  } catch (error) {
    throw new Error(`Error descargando PDF: ${error.message}`);
  }

  // 2. Extract text from PDF using pdf-parse
  let textoExtraido;
  try {
    const pdfData = await pdf(pdfBuffer);
    textoExtraido = pdfData.text;
    if (!textoExtraido || textoExtraido.trim().length === 0) {
      throw new Error('No se pudo extraer texto del PDF');
    }
  } catch (error) {
    throw new Error(`Error extrayendo texto del PDF: ${error.message}`);
  }

  // 3. Send to Claude API
  let claudeResponse;
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Eres un asistente médico experto en Argentina.
Analiza esta receta médica y extrae la información en formato JSON.

Texto de la receta:
${textoExtraido}

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "medico": "nombre completo del médico o null",
  "fecha": "YYYY-MM-DD o null",
  "estudios": ["estudio 1", "estudio 2"]
}

Si no encontrás algún dato, usa null.
Los estudios siempre deben ser un array, aunque esté vacío.`
        }
      ]
    });

    claudeResponse = message.content[0].text;
  } catch (error) {
    throw new Error(`Error llamando a Claude API: ${error.message}`);
  }

  // 4. Parse and validate JSON response
  try {
    // Clean markdown code blocks if present
    let jsonStr = claudeResponse;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    jsonStr = jsonStr.trim();

    const result = JSON.parse(jsonStr);

    // Validate structure
    return {
      medico: typeof result.medico === 'string' ? result.medico : null,
      fecha: typeof result.fecha === 'string' ? result.fecha : null,
      estudios: Array.isArray(result.estudios) ? result.estudios : [],
    };
  } catch (error) {
    throw new Error(`Error parseando respuesta de Claude: ${error.message}`);
  }
}
